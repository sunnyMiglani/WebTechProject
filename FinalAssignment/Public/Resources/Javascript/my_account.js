"use strict"

window.onload = function(){
    if(window.XMLHttpRequest){
        // Code for modern
        var xmlhttp = new XMLHttpRequest();
    }
    else{
        // for other browsers
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    getUserData(xmlhttp);

    /* -- DO NOT UNCOMMENT THIS AS IT IS DDOSING THE SERVER --
    while(userData === null || userData === undefined){
        console.log("Request did not return!");
        getUserData(xmlhttp,userData);
    } -- DO NOT UNCOMMENT THIS AS IT IS DDOSING THE SERVER --
    */

}

function getUserData(xmlhttp){
    var userData;
    xmlhttp.onreadystatechange = function(){
        console.log("this status : "+this.status);
        console.log("this ready state : "+this.readyState);

        if(this.readyState == 4 && this.status == 200){
            userData = this.responseText;
            console.log("in user data!");
            console.log(userData);
            userData = JSON.parse(userData);
            showUserData(userData[0]);
        }
    }
    xmlhttp.open("GET", '/myaccountinfo', true);
    xmlhttp.send();
}

function showUserData(userData){
    var fName = document.getElementById("fName");
    var lName = document.getElementById("lName");
    var email = document.getElementById("email");
    var houseId = document.getElementById("house");

    console.log((userData));
    
    
    fName.innerHTML = "First Name : "+ userData.fname;
    lName.innerHTML = "Last Name : "+userData.lname;
    email.innerHTML = "Email ID : "+userData.email;
    houseId.innerHTML = "HouseID : "+userData.houseID;


}