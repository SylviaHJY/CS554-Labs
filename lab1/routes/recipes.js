const express = require('express');
const router = express.Router();
const data = require('../data');
const helper = require("../helper.js");
const recipesData = data.recipes;
const commentsData = data.comments;
const likesData = data.likes;
const {checkAuth} = require("../data/likes");

router
.route('/')
.get(async (req, res) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  } else if (isNaN(page)) {
    return res.status(400).json({ error: "Invalid page parameter" });
  }else if(page <= 0){
    return res.status(400).json({ error: "Page parameter cannot be 0 or negative" });
  } else {
    page = parseInt(page);
  }

  const recipes = await recipesData.getAllRecipesByPage(page);
  if (!recipes || recipes.length === 0) {
    return res.status(404).send({ message: "No more recipes" });
  }
  res.status(200).json(recipes);
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
    res.status(200).json(createRecipe); 
  }catch(e){
    res.status(400).json({error: e});
  }
});

router
.route('/:id')
.get(async (req, res) => {
  try{
    req.params.id = helper.checkID(req.params.id);
  }catch(e){
    return res.status(400).json({error: e});
  }

  try{
    const recipeById = await recipesData.getRecipeById(req.params.id);
    res.status(200).json(recipeById);
  }catch(e){
    res.status(404).json({ error: 'recipe by id not found' });
  }
})
.patch(checkAuth, async (req, res) => {
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
  if (steps && JSON.stringify(steps) !== JSON.stringify(findRecipe.steps))isUpdateValid = true;
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
      return res.status(200).json(updateRecipe);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(400).json({error: e});
  }
});

router
.route('/:id/comments')
.post(checkAuth, async (req, res) => {
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
      return res.status(200).json(newComment);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(400).json({error: e});
  }
});

router
.route('/:recipeId/:commentId')
.delete(checkAuth, async (req, res) => {
  try {
    req.params.recipeId = helper.checkID(req.params.recipeId);
    req.params.commentId = helper.checkID(req.params.commentId);
  } catch (e) {
    return res.status(404).json({error: e});
  }

  let userID = req.session.user._id;

  try{
    const recipeAfterCommentDelete = await commentsData.removeComment( req.params.recipeId,req.params.commentId,userID);
    if(recipeAfterCommentDelete){
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
.route('/:id/likes')
.post(checkAuth, async (req, res) => {
  try {
    req.params.id = helper.checkID(req.params.id);
  } catch(e){
    return res.status(404).json({error: e});
  }

  let recipeId = req.params.id;
  let userId = req.session.user._id;

  try{
    const newLike = await likesData.like(recipeId,userId);
    if(newLike){
      return res.status(200).json(newLike);
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(404).json({error: e});
  }
})

module.exports = router;



