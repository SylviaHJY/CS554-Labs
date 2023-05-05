const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require('mongodb');
const recipes = mongoCollections.recipes;
const recipes1 = require('./recipes');
const helper = require("../helper.js");
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});

const like = async (recipeId,userId)  => {
  //check recipeId, userId
  if(!recipeId || !userId) throw 'You must provide an id to search for';
  //check recipeId
  helper.checkIsString(recipeId);
  recipeId = recipeId.trim();
  if (!ObjectId.isValid(recipeId)) throw 'invalid object ID';

  const recipe = await recipes1.getRecipeById(recipeId.toString());
  if(!recipe) throw 'No recipe with that recipeId';

  // Check if userId is already in the likes array
  const hasLiked = recipe.likes.includes(userId);

  const recipesCollection = await recipes();
  // Update the likes array
  if (hasLiked) {
    recipe.likes = recipe.likes.filter((like) => like !== userId);
  } else {
    recipe.likes.push(userId);
  }

   // Update the recipe in the collection
  const updatedRecipe = await recipesCollection.updateOne(
   { _id: ObjectId(recipeId) },
   { $set: {likes: recipe.likes } }
   );
  
  if (updatedRecipe.modifiedCount === 0) throw 'Could not update recipe';
  
  // Get the updated recipe
  const updated = await recipes1.getRecipeById(recipeId.toString());
  return updated;
}

const cachePage = async (req,res,next) => {
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

  let cachePageKey = `recipes:${page}`;
  let cachedPageData = await client.get(cachePageKey);

  if (cachedPageData) {
    return res.status(200).json(JSON.parse(cachedPageData));
  }else{
    next();
  }
}

const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You have to login first!" });
  }
  next();
};

// Middleware to check if the requested recipe is in cache
const cachedRecipe = async (req, res, next) => {
  try{
    req.params.id = helper.checkID(req.params.id);
  }catch(e){
    return res.status(400).json({error: e});
  }
  let cachedRecipeData = await client.get(req.params.id);
  if (cachedRecipeData) {
    // Check if the cached recipe data has any new comments or delete any new comments, check likes as well
    let cachedRecipe = JSON.parse(cachedRecipeData);
    await client.zIncrBy("recipes", 1, req.params.id);
    let updatedRecipe = await recipes1.getRecipeById(req.params.id);
    
    if (updatedRecipe.comments.length != cachedRecipe.comments.length || updatedRecipe.likes.length != cachedRecipe.likes.length) {
      await client.set(req.params.id, JSON.stringify(updatedRecipe));
      cachedRecipeData = JSON.stringify(updatedRecipe);
    }
    
    return res.status(200).json(JSON.parse(cachedRecipeData));
  } else {
    next();
  }
};

module.exports = {like,checkAuth,cachePage,cachedRecipe};