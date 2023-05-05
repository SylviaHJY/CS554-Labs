const {ObjectId} = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const recipes = mongoCollections.recipes;
const helper = require("../helper.js");

const createRecipe = async (
  title,
  ingredients,
  cookingSkillRequired,
  steps,
  userID,
  username
) => {
  //check all the fields are valid
  if(!title || !ingredients || !cookingSkillRequired || !steps || !userID || !username){
    throw 'All fields need to have valid values'
  }

  //check title
  helper.checkTitle(title);
  title = title.trim();

  //check ingredients
  helper.checkIngredients(ingredients);

  //check cookingSkillRequired
  helper.checkCookingSkill(cookingSkillRequired);
  cookingSkillRequired = cookingSkillRequired.trim();
  
  //check steps
  helper.checkSteps(steps);

  const recipesCollection = await recipes();
  let newRecipes = {
    title: title,
    ingredients: ingredients,
    cookingSkillRequired: cookingSkillRequired.toLowerCase(),
    steps:steps,
    userThatPosted: {_id: ObjectId(userID), username: username},
    comments: [],
    likes: []
  }

  const insertInfo = await recipesCollection.insertOne(newRecipes);
  if (insertInfo.insertedCount === 0) throw 'Could not add recipe';

  const newId = insertInfo.insertedId.toString();
  const recipe = await getRecipeById(newId);
  return recipe;   
}

//cite from my cs546 lab6
const getRecipeById = async (recipeId) => {
  //check to make sure we have input at all
  if (!recipeId) throw 'You must provide an id to search for';

  //check to make sure it's a string
  if (typeof recipeId !== 'string') throw 'Id must be a string';

  //check to make sure it's not all spaces
  if (recipeId.trim().length === 0) throw 'Id cannot be an empty string or just spaces';

  //Now we check if it's a valid ObjectId so we attempt to convert a value to a valid object ID,
  recipeId = recipeId.trim();
  if (!ObjectId.isValid(recipeId)) throw 'invalid object ID';
  
  const recipesCollection = await recipes();
  const recipe = await recipesCollection.findOne({ _id: ObjectId(recipeId)});
  if (recipe === null) throw 'no recipe with that id';

  //The output does not have ObjectId() around the ID field and no quotes around the key names,
  // your function needs to return it as shown.
  recipe._id = recipe._id.toString();
  return recipe;
};


const getAllRecipesByPage = async (page=1) => {
  const limit = 50;
  const recipesCollection = await recipes();
  const recipeList = await recipesCollection.find({}).skip((page-1)*limit).limit(limit).toArray();
  for(let i = 0; i < recipeList.length; i++){
    recipeList[i]._id = recipeList[i]._id.toString();
  }
  return recipeList;
};

//cite from my cs546 lab6
const removeRecipe = async (recipeId) => {
  //check ID as getRecipeByID
  if (!recipeId) throw 'You must provide an id to search for';
  if (typeof recipeId !== 'string') throw 'Id must be a string';
  if (recipeId.trim().length === 0) throw 'id cannot be an empty string or just spaces';
  recipeId = recipeId.trim();
  if (!ObjectId.isValid(recipeId)) throw 'invalid object ID';

  //convert string ID to ObjectID while we need to do operation
  const recipesCollection = await recipes();
  const recipe = await getRecipeById(newId);
  const deletionInfo = await recipesCollection.deleteOne({_id: ObjectId(recipeId)});

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete recipe with id of ${recipeId}`;
  }
  return recipe.title + " has been successfully deleted!";
};

//cite from my cs546 lab6
const updateRecipe = async (
  recipeId,
  title,
  ingredients,
  cookingSkillRequired,
  steps,
  userID,
  username
) =>{
  //check all the fields are valid
  if(!recipeId || !title || !ingredients || !cookingSkillRequired || !steps || !userID || !username){
    throw 'All fields need to have valid values'
  }

  const recipesCollection = await recipes();
  const updateRecipeData = {};

  const oldRecipe = await getRecipeById(recipeId);
  if(oldRecipe === null) throw 'No recipe with that ID';

  //check recipeID
  helper.checkIsString(recipeId);
  recipeId = recipeId.trim();
  if (!ObjectId.isValid(recipeId)) throw 'invalid object ID';

  //check if title and check title
  if(title){
    helper.checkIsString(title);
    helper.checkTitle(title);
    title = title.trim();
    updateRecipeData.title = title;
  }

  //check if ingredients 
  if(ingredients){
    helper.checkArray(ingredients);
    helper.checkIngredients(ingredients);
    updateRecipeData.ingredients = ingredients;
  }

  //check if cookingSkillRequired
  if(cookingSkillRequired){
    helper.checkCookingSkill(cookingSkillRequired);
    cookingSkillRequired = cookingSkillRequired.trim();
    updateRecipeData.cookingSkillRequired = cookingSkillRequired;
  }

  //check if steps
  if(steps){
    helper.checkArray(steps);
    helper.checkSteps(steps);
    updateRecipeData.steps = steps;
  }

  updateRecipeData.userThatPosted = oldRecipe.userThatPosted;
  updateRecipeData.comments = oldRecipe.comments;
  updateRecipeData.likes = oldRecipe.likes;

  //update RecipeData
  const updateData = await recipesCollection.updateOne(
    {_id: ObjectId(recipeId)},
    {$set: updateRecipeData}
  );
  if (updateData.modifiedCount === 0) {
    throw 'could not update reviews successfully';
  }

  return await getRecipeById(recipeId);
}

module.exports = {
  createRecipe,
  getRecipeById,
  getAllRecipesByPage,
  removeRecipe,
  updateRecipe
}
