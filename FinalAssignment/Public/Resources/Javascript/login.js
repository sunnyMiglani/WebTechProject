"use strict"

window.onload = function() {
    var firstPass = document.getElementById("regPsw");
    var secondPass = document.getElementById("regPswTwo")

    var number = document.getElementById("number");
    var length = document.getElementById("length");
    var both = document.getElementById("both");

    var subButton = document.getElementById("subButton");

    subButton.style.visibility = "hidden";

    var numbCorrect = false;
    var lengthCorrect = false;
    var bothCorrect = false;

    if(firstPass === null || both === null || length === null || number === null ){
        console.log("CANNOT FIND THE CORRECT ELEMENT IN LOGIN.JS");
    }

    secondPass.onfocus = displayRequirements;
    firstPass.onfocus = displayRequirements;
    secondPass.onblur = hideRequirements;
    firstPass.onblur = hideRequirements;

    firstPass.onkeyup = validate;
    secondPass.onkeyup = validate;

    function displayRequirements(){
        document.getElementById("requirements").style.display = "block";
    };

    function hideRequirements() {
        document.getElementById("requirements").style.display = "none";
    };


    function validate() {
        // Validate numbers
        var numbers = /[0-9]/g;
        if(firstPass.value.match(numbers)) {  
            number.classList.remove("invalid");
            number.classList.add("valid");
            numbCorrect = true;
        }
        else {
            number.classList.remove("valid");
            number.classList.add("invalid");
            numbCorrect = false;
        }

        // Validate Length
        if(firstPass.value.length >= 8) {
            length.classList.remove("invalid");
            length.classList.add("valid");
            lengthCorrect = true;
        }
        else {
            length.classList.remove("valid");
            length.classList.add("invalid");
            lengthCorrect = false;
        }

        if(secondPass.value === firstPass.value && secondPass.value.length > 0 ){
            both.classList.remove("invalid");
            both.classList.add("valid");
            bothCorrect = true;
        }
        else {
            both.classList.remove("valid");
            both.classList.add("invalid");
            bothCorrect = false;
        }

        if(numbCorrect && lengthCorrect && bothCorrect){
            subButton.style.visibility = "visible";
        } 
        else{
            subButton.style.visibility = "hidden";
        }
    }
}

