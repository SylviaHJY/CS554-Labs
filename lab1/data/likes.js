const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require('mongodb');
const recipes = mongoCollections.recipes;
const recipes1 = require('./recipes');
const helper = require("../helper.js");

const like = async (recipeId,userId)  => {
  //check recipeId, userId
  if(!recipeId || !userId) throw 'You must provide an id to search for';
  //check recipeId
  helper.checkIsString(recipeId);
  recipeId = recipeId.trim();
  if (!ObjectId.isValid(recipeId)) throw 'invalid object ID';

  const recipe = await recipes1.getRecipeById(recipeId.toString());
  if(!recipe){
    console.log('No recipe with that recipeId');
  };

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

const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You have to login first!" });
  }
  next();
};

module.exports = {like, checkAuth};