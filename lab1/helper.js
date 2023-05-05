// some code cites from my own cs546 lab10 assignments and my cs546 final project.
const { ObjectId } = require('mongodb');

//cite from my cs546 lab6 assignments
function checkName(str){
  //declare an index to store space index
  str = str.trim();
  let index = 0;
  for(let i = 0; i < str.length; i++){
    if(str.charAt(i) == " "){
      index = i;
      break;
    }  
  }
  if(index === 0){
    throw 'Name must have the following format "first name space last name"'
  }

  //first name and last name must be at least 3 characters 
  //each and only letters a-z or A-Z. No numbers or special characters or punctuation.
  let counter1 = 0;
  let nameInvalidFlag = false;
  //check first name
  for(let i = 0; i < index; i++){
    let ch3 = str.charAt(i);
    if(/[a-zA-Z]/g.test(ch3)){
      counter1 += 1;
    }else{
      nameInvalidFlag = true;
      break;
    }
  }
  if(nameInvalidFlag){
    throw 'firstName-No special characters or punctuation or numbers are allowed'
  }
  if(counter1 < 3){
    throw 'firstName must be least three characters long'
  }

  // remember to reset flag to traverse the rest string of director
  nameInvalidFlag = false;
  let counter2 = 0;
  //check last name
  for(let i = index + 1; i < str.length; i++){
    if(i === " "){
      throw 'There could not be multiple spaces between first name and last name'
    }else{
      let ch4 = str.charAt(i);
      if(/[a-zA-Z]/g.test(ch4)){
        counter2 += 1;
      }else{
        nameInvalidFlag = true;
        break;
      }
    }
  }
  if(nameInvalidFlag){
    throw 'lastName-No special characters or punctuation or numbers are allowed'
  }

  if(counter2 < 3){
    throw 'lastName must be least three characters long'
  }
}

//cite from my cs546 lab10 assignments
function validUserName(name) {
  if (!name) throw 'You must provide an user name to search for';
  if (typeof name !== 'string') throw 'User name must be a string';
  if (name.trim().length === 0)
    throw 'User name cannot be an empty string or just spaces';
  let nameValidFlag = false;
  let counter = 0;
  for (let i = 0; i < name.length; i++) {
    let ch = name.charAt(i);
    if (!/[a-zA-Z]/g.test(ch) && isNaN(ch)) {
      nameValidFlag = true;
      break;
    } else {
      counter += 1;
    }
  }
  if (counter < 3) {
    throw 'User name is too short. User name should be at least 3 characters long.'
  }
  if (nameValidFlag) {
    throw 'UserName-No empty spaces, no spaces in the username and only alphanumeric characters are allowed.'
  }
}

//cite from my cs546 lab10 assignments, I wrote this function in my cs546 assignments and my cs546 final project.
function checkPassword(password){
  //The constraints for password will be: There needs to be at least one uppercase character, 
  //with at least one lowercase letter
  //there has to be at least one number and there has to be at least one special character,
  //at least 6 characters long
  //var regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{6,}$/g;
  if(typeof password != "string"){
    throw 'password should be valid string.'
  }
  if(password.trim().length === 0){
    throw 'password should not be all empty spaces.'
  }

  for(let i = 0; i < password.length; i ++){
    if(password.charAt(i) === " "){
      throw 'No spaces between password.'
    }
  }
  let strongPassword = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,})')
  if(!strongPassword.test(password)){
    throw 'Not valid password-At least one upper case character,at least one lower case, at least one number,at least one special character,at least 6 character.'
  }
}

//cite from my cs546 lab6
function checkIsString(str){
  // check that string exists and is of the proper type(string) 
  if(str === undefined || typeof str !== 'string' || str.trim().length === 0){
    throw "Invalid String";
  }
}

function checkTitle(title){
  checkIsString(title);
  let titleInvalidFlag = false;
  let counter = 0;
  title = title.trim();
  for(let i = 0; i < title.length; i++){
    let ch = title.charAt(i);
    if(!/[a-zA-Z]/g.test(ch) && title[i] != " " && isNaN(ch)){
        titleInvalidFlag = true;
        break;
    } else {
      counter += 1;
    }
  }
  if(titleInvalidFlag){
    throw "title-No special characters or punctuation are allowed. No strings with empty spaces allowed."
  }

  if(counter < 4){
    throw "Title at least has four characters"
  }
}

function checkArray(array){
  if(!Array.isArray(array) || array.length === 0){
    throw "Not an Valid Array";
  }
  for(let i = 0; i < array.length; i++){
    if(typeof array[i] != 'string' || array[i].trim().length === 0){
      throw "One or more elements is not a string or empty string."
    }
  }
}

function checkIngredients(ingredients){
  checkArray(ingredients);
  if(ingredients.length < 3){
    throw "There should be at least 3 valid string elements in the array for ingredients."
  }

  for(const x of ingredients){
    if(x.trim().length < 3 || x.trim().length > 50){
      throw "The minimum characters for each ingredient should be 3 characters and the max 50 characters."
    }

    // if(!/^[a-zA-Z\s]+$/.test(x.trim()) && isNaN(x)){
    //   throw "Ingredients - No special characters or punctuation are allowed."
    // }
    for(let i = 0; i < x.length; i++){
      let ch = x.charAt(i);
      if(!/[a-zA-Z]/g.test(ch) && isNaN(ch) && ch != " "){
        throw 'Ingredients - No special characters or punctuation are allowed.'
      }
    }
  }
}

function checkSteps(steps){
  checkArray(steps);
  if(steps.length < 5){
    throw "There should be at least 5 valid string elements in the array for steps."
  }

  for(const x of steps){
    if(x.trim().length < 20){
      throw "The minimum characters for each steps should be 20 characters."
    }

    let count = 0;
    for(let i = 0; i < x.length; i++){
      let ch = x.charAt(i);
      if(/[^\w\s]|\d/g.test(ch) || ch === " "){
        count += 1;
      }
    }
    if(count === x.length){
      throw "Steps cannot be all special characters, numbers or spaces. Please enter valid steps.";
    }
  }
}

function checkCookingSkill(cookingSkill){
  if(typeof cookingSkill !== 'string'){
    throw 'Invalid cooking skill required, expected a string value.';
  }

  if(cookingSkill.trim().toLowerCase() !== "novice" && cookingSkill.trim().toLowerCase() !== "intermediate" && cookingSkill.trim().toLowerCase() !== "advanced"){
    throw 'Invalid cooking skill required.'
  }
}

function checkID(id){
  if(!id) throw "You must provide an id";
  if (typeof id !== 'string') throw 'ID must be a string';
  if (id.length === 0)
    throw 'ID cannot be an empty string or just spaces';
  if (!ObjectId.isValid(id)) throw 'invalid object ID';
  return id;
}

// function checkPage(page){
//   if (page===undefined) return 1;
//     page = page.trim()
//     if (page.length===0) return 1;
//     if (! /^[0-9]+$/.test(page)) throw "Invalid page";
//     page=Number(page);
//     if(page<1) throw "Page cannot be negative";
//     return page;
// }

module.exports ={
  checkName,
  validUserName,
  checkPassword,
  checkIsString,
  checkTitle,
  checkArray,
  checkIngredients,
  checkSteps,
  checkCookingSkill,
  checkID
}
