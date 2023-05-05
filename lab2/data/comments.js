const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require('mongodb');
const recipes = mongoCollections.recipes;
const recipes1 = require('./recipes');
const helper = require("../helper.js");

const createComment = async (
  recipeId,
  userID,
  username,
  comment
) => {
  //check all the fields are valid
  if(!recipeId || !comment ||!userID || !username){
    throw 'All fields need to have valid values'
  }

  //check recipeId
  helper.checkIsString(recipeId);
  //Now we check if it's a valid ObjectId so we attempt to convert a value to a valid object ID,
  recipeId = recipeId.trim();
  if (!ObjectId.isValid(recipeId)) throw 'invalid object ID';

  const recipe = await recipes1.getRecipeById(recipeId);
  if(recipe === null) throw 'No recipe with that recipeId';

  //check comment
  helper.checkIsString(comment);

    //create comment
  let newComment = {
    _id: new ObjectId(),
    userThatPostedComment: {_id: ObjectId(userID), username: username},
    comment: comment
  }

  const recipesCollection = await recipes();
  const updatedComment = await recipesCollection.updateOne(
    {_id: ObjectId(recipeId)},
    {$addToSet:{comments:newComment}}) ;// add newReview element to reviews array where recipeID
  if (updatedComment.modifiedCount === 0) {
    throw 'could not update comments successfully';
  }

  const newlyRecipe = await recipes1.getRecipeById(recipeId.toString());
  return newlyRecipe;
}

//cite from my cs546 lab6
// const getComment = async (commentId) => {
//   //check commentId 
//   if(!commentId) throw 'You must provide an id to search for.';
//   helper.checkIsString(commentId);
//   commentId = commentId.trim();
//   if(!ObjectId.isValid(commentId)) throw 'comment Id - invalid ID';

//   const recipesCollection = await recipes();
//   const singleComment = await recipesCollection.findOne({'comments._id': ObjectId(commentId)}, {projection:{_id:0,title:0,ingredients:0,cookingSkillRequired:0,steps:0,userThatPosted:0,comments:{$elemMatch: {_id:ObjectId(commentId)},likes:0}}});
//   if(!singleComment) throw 'No comments with that commentID';
//   let myComment = singleComment.comments[0];
//   singleComment.comments[0]._id = singleComment.comments[0]._id.toString();
//   return myComment;
// }

const removeComment = async (recipeId,commentId, userId) => {
  // check ID
  if (!commentId) throw 'You must provide an id to search for.';
  helper.checkIsString(commentId);
  commentId = commentId.trim();
  if (!ObjectId.isValid(commentId)) throw 'comment Id - invalid ID';

  // find the recipes contain the comment with provided commentID
  const recipesCollection = await recipes();
  const recipeBeforeDelete = await recipesCollection.findOne({
    _id: ObjectId(recipeId)
  });

  if (!recipeBeforeDelete) throw 'Recipe not found';

  const recipesArr = await recipesCollection.find({
    'comments._id': ObjectId(commentId)
  }).toArray();

  if (recipesArr.length === 0) throw 'Comment not found';
  const callComment = recipesArr[0];

  // check if the user who wants to delete the comment is the original poster
  let commentUserId = callComment.comments.find(comment => comment._id.toString() === commentId).userThatPostedComment._id;
  if (commentUserId.toString() !== userId.toString()) throw 'Only the user who posted the comment can delete it';

  // splice -> delete from NO.i
  for (let i = 0; i < callComment.comments.length; i++) {
    if (callComment.comments[i]._id.toString() === commentId.toString()) {
      callComment.comments.splice(i, 1);
      break;
    }
  }

  const updateInfo = await recipesCollection.updateOne({
    _id: recipeBeforeDelete._id
  }, {
    $set: {
      comments: callComment.comments
    }
  });

  if (updateInfo.modifiedCount === 0) throw 'Could not delete comment with that id';

  let resultRecipe = await recipes1.getRecipeById(recipeBeforeDelete._id.toString());
  let resultRecipeComments = resultRecipe.comments;

  for (let i = 0; i < resultRecipeComments.length; i++) {
    resultRecipeComments[i]._id = resultRecipeComments[i]._id.toString();
  }

  return resultRecipe;
};


module.exports = {
  createComment,
  removeComment
}