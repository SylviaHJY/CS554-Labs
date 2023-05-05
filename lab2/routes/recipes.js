const express = require('express');
const router = express.Router();
const data = require('../data');
const helper = require("../helper.js");
const recipesData = data.recipes;
const commentsData = data.comments;
const likesData = data.likes;
const{checkAuth,cachePage,cachedRecipe} = require('../data/likes');

const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});

router
.route('/recipes')
.get(cachePage, async (req, res) => {
  console.log('Page not cached!');
  let page = req.query.page;
  if (!page) {
    page = 1;
  } else if (isNaN(page)) {
    return res.status(400).json({ error: "Invalid page parameter" });
  } else if (page <= 0) {
    return res.status(400).json({ error: "Page parameter cannot be 0 or negative" });
  } else {
    page = parseInt(page);
  }
  let recipes = await recipesData.getAllRecipesByPage(page);
  if (!recipes || recipes.length === 0) {
    return res.status(404).send({ message: "No more recipes" });
  }
  let cachePageKey = `recipes:${page}`;
  await client.set(cachePageKey,JSON.stringify(recipes));
  return res.status(200).json(recipes);
})
.post(checkAuth, async (req, res) => {
  const recipePost = req.body;
  let userID = req.session.user._id;
  let username = req.session.user.username;

  if(!recipePost.title || !recipePost.ingredients || !recipePost.cookingSkillRequired || !recipePost.steps){
    return res.status(400).json({error: "All fields need to have valid values"});
  }

  try{
    //check title
    helper.checkTitle(recipePost.title);

    //check ingredients
      helper.checkIngredients(recipePost.ingredients);

      //check cookingSkill
      helper.checkCookingSkill(recipePost.cookingSkillRequired);

      //check steps
      helper.checkSteps(recipePost.steps);
  }catch(e){
    return res.status(400).json({error: e});
  }

  try{
    const {title,ingredients,cookingSkillRequired,steps} = recipePost;
    const createRecipe = await recipesData.createRecipe(title,ingredients,cookingSkillRequired,steps,userID,username);
    await client.set(createRecipe._id,JSON.stringify(createRecipe));
    await client.zAdd('recipes',{
      score: 1,
      value: createRecipe._id
    });
     // Delete all cached pages containing recipes,and the cache will be rebuilt the next time a user visits a page
     const keys = await client.keys('recipes:*');
     if (keys.length > 0) {
       await client.del(keys);
     }
     return res.status(200).json(createRecipe); 
  }catch(e){
    console.error('Error:', e);
    res.status(400).json({error: e});
  }
});

router
.route('/recipes/:id')
.get(cachedRecipe, async (req, res) => {
  console.log('Recipes not cached!')
  try{
    req.params.id = helper.checkID(req.params.id);
  }catch(e){
    return res.status(400).json({error: e});
  }
  try{
    const recipeById = await recipesData.getRecipeById(req.params.id);
    await client.zIncrBy("recipes", 1, req.params.id); // The recipe ID and its corresponding data are also stored in the "recipes" sorted set
    await client.set(req.params.id, JSON.stringify(recipeById));
    res.status(200).json(recipeById);
  }catch(e){
    res.status(404).json({ error: 'recipe by id not found' });
  }
})
.patch(checkAuth, async(req, res) => {
  try {
    req.params.id = helper.checkID(req.params.id);
  } catch (e) {
    return res.status(400).json({error: e});
  }

  let recipeId = req.params.id;
  let title = req.body.title;
  let ingredients = req.body.ingredients;
  let cookingSkillRequired = req.body.cookingSkillRequired;
  let steps = req.body.steps;
  let userID = req.session.user._id;
  let username = req.session.user.username;

  try{
    var findRecipe = await recipesData.getRecipeById(recipeId);
  }catch(e){
    return res.status(404).json({error: "No recipe found!"});
  }

  if(findRecipe.userThatPosted._id.toString() !== userID){
    return res.status(403).json({error: "Only author can update the recipe!"});
  }

  if(!title && !ingredients && !cookingSkillRequired && !steps){
    return res.status(400).json({error: "At least one field needs to be supplied"});
  }

  if(!title) title = findRecipe.title;
  if(!ingredients) ingredients = findRecipe.ingredients;
  if(!cookingSkillRequired) cookingSkillRequired = findRecipe.cookingSkillRequired;
  if(!steps) steps = findRecipe.steps;

  let isUpdateValid = false;
  if (title && title !== findRecipe.title) isUpdateValid = true;
  if (ingredients && JSON.stringify(ingredients) !== JSON.stringify(findRecipe.ingredients)) isUpdateValid = true;
  if (cookingSkillRequired && cookingSkillRequired !== findRecipe.cookingSkillRequired) isUpdateValid = true;
  if (steps && JSON.stringify(steps) !== JSON.stringify(findRecipe.steps)) isUpdateValid = true;
  if (!isUpdateValid) {
    return res.status(400).json({ error: "The values must be different than the current ones!" });
  }

  try{
    //check title
    helper.checkTitle(title);

    //check ingredients
    helper.checkIngredients(ingredients);

    //check cookingSkill
    helper.checkCookingSkill(cookingSkillRequired);

    //check steps
    helper.checkSteps(steps);
  }catch(e){
    return res.status(400).json({error: e});
  }

  try{
    let updateRecipe = await recipesData.updateRecipe(
      recipeId,
      title,
      ingredients,
      cookingSkillRequired,
      steps,
      userID,
      username);
    if(updateRecipe){
      await client.set(req.params.id, JSON.stringify(updateRecipe)); // If a key with the same name already exists, its value will be overwritten with the new value.
      await client.zIncrBy("recipes", 1, req.params.id);
      // Delete all cached pages containing recipes
      const keys = await client.keys('recipes:*');
      if (keys.length > 0) {
       await client.del(keys);
      }
      return res.status(200).json(updateRecipe);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(400).json({error: e});
  }
});


router
.route('/recipes/:id/comments')
.post(checkAuth, async(req, res) => {
  try {
    req.params.id = helper.checkID(req.params.id);
  } catch(e){
    return res.status(400).json({error: e});
  }

  let comment = req.body.comments;
  if(!comment){
    return res.status(400).json({error: "Please leave comment"});
  }

  //check comment
  try{
    helper.checkIsString(comment);
  }catch(e){
    return res.status(400).json({error: e});
  }

  let userID = req.session.user._id;
  let username = req.session.user.username;

  try{
    const newComment = await commentsData.createComment(req.params.id,userID, username,comment);
    if(newComment){
      await client.set(req.params.id, JSON.stringify(newComment));
      await client.zIncrBy("recipes", 1, req.params.id); 
      // Delete all cached pages containing recipes
      const keys = await client.keys('recipes:*');
      if (keys.length > 0) {
       await client.del(keys);
      }
      return res.status(200).json(newComment);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(404).json({error: e});
  }
});

router
.route('/recipes/:recipeId/:commentId')
.delete(checkAuth, async(req, res) => {
  try {
    req.params.recipeId = helper.checkID(req.params.recipeId);
    req.params.commentId = helper.checkID(req.params.commentId);
  } catch (e) {
    return res.status(400).json({error: e});
  }

  let userID = req.session.user._id;

  try{
    const recipeAfterCommentDelete = await commentsData.removeComment(req.params.recipeId, req.params.commentId,userID);
    if(recipeAfterCommentDelete){
      await client.set(req.params.recipeId,JSON.stringify(recipeAfterCommentDelete));
      await client.zIncrBy("recipes", 1, req.params.recipeId); 
      // Delete all cached pages containing recipes
      const keys = await client.keys('recipes:*');
      if (keys.length > 0) {
       await client.del(keys);
      }
      return res.status(200).json(recipeAfterCommentDelete);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    if (e === 'Recipe not found' || e === 'Comment not found') {
      res.status(404).json({
        error: e
      });
    } else {
      console.error('Error:', e);
      res.status(401).json({
        error: e
      });
    }
  }
});

router
.route('/recipes/:id/likes')
.post(checkAuth, async(req, res) => {
  try {
    req.params.id = helper.checkID(req.params.id);
  } catch(e){
    return res.status(400).json({error: e});
  }

  let recipeId = req.params.id;
  let userId = req.session.user._id;

  try{
    const newLike = await likesData.like(recipeId,userId);
    if(newLike){
      await client.set( req.params.id, JSON.stringify(newLike));
      await client.zIncrBy("recipes", 1, req.params.id); 
      // Delete all cached pages containing recipes
      const keys = await client.keys('recipes:*');
      if (keys.length > 0) {
      await client.del(keys);
      }
     return res.status(200).json(newLike);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(404).json({error: e});
  }
});

//The reason we use i += 2 instead of i++ is because zRange returns an array of key-value pairs. Each key-value pair takes up 2 indices in the array. 
//By incrementing i by 2, we are able to access both the key and the value at each iteration. 
//If you only increment i by 1, you would only access every other key-value pair, and you would miss every other value in the array.
router
.route('/mostaccessed')
.get(async (req, res) => {
  try {
    const recipeIds = await client.zRange('recipes', 0, 9, { REV: true });
    console.log(recipeIds);
    const recipes = [];
    for (let i = 0; i < recipeIds.length; i++) {
      const recipeData = await client.get(recipeIds[i]);
      recipes.push(JSON.parse(recipeData));
    }
    res.status(200).json(recipes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  });





module.exports = router;




//In Redis, a sorted set is stored as a series of keys, each containing a tuple of an element (the string value of a recipe) and its score (an integer). 
//The data in Redis for a sorted set might look something like this:

//127.0.0.1:6379> ZRANGE recipes 0 -1 WITHSCORES
//1) "{"id":1,"name":"recipe1","ingredients":["ingredient1","ingredient2"],"description":"description of recipe 1"}"
//"3"
//2) "{"id":2,"name":"recipe2","ingredients":["ingredient1","ingredient3"],"description":"description of recipe 2"}"
//"2"
//3) "{"id":3,"name":"recipe3","ingredients":["ingredient2","ingredient3"],"description":"description of recipe 3"}"
//"1"
//In this example, recipe 1 has been accessed 3 times, recipe 2 has been accessed 2 times, and recipe 3 has been accessed 1 time. The sorted set is sorted in descending order based on the scores, 
//so recipe 1 is first in the set, recipe 2 is second, and recipe 3 is third.
