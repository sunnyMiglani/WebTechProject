"use strict"

window.onload = function(){
var firstPass = document.getElementById("regPsw");

var number = document.getElementById("number");
var length = document.getElementById("length");
var both = document.getElementById("both");

if(firstPass === null || both === null || length === null || number === null ){
  console.log("CANNOT FIND THE CORRECT ELEMENT IN LOGIN.JS");
}
firstPass.onfocus = function(){
    document.getElementById("requirements").style.display = "block";
};

firstPass.onblur = function() {
    document.getElementById("requirements").style.display = "none";
};

firstPass.onkeyup = function() {
    // Validate numbers
    var numbers = /[0-9]/g;
    if(firstPass.value.match(numbers)) {  
      number.classList.remove("invalid");
      number.classList.add("valid");
    } else {
      number.classList.remove("valid");
      number.classList.add("invalid");
    }
    // Validate Length
  if(firstPass.value.length >= 8) {
      length.classList.remove("invalid");
      length.classList.add("valid");
    } else {
      length.classList.remove("valid");
      length.classList.add("invalid");
    }
  if(secondPass.value === firstPass.value){
      both.classList.remove("invalid");
      both.classList.add("valid");
    } else {
      both.classList.remove("valid");
      both.classList.add("invalid");
    }
  }
}
