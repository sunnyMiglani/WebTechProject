"use strict"

window.onload = function(){
    var fName = document.getElementsByTagName("fName");
    var lName = document.getElementsByTagName("lName");
    var email = document.getElementsByTagName("email");

    var userData;
    console.log("on my account js now!")

    if(window.XMLHttpRequest){
        // Code for modern
        var xmlhttp = new XMLHttpRequest();
    }
    else{
        // for other browsers
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    getUserData(xmlhttp, userData);

    /* -- DO NOT UNCOMMENT THIS AS IT IS DDOSING THE SERVER --
    while(userData === null || userData === undefined){
        console.log("Request did not return!");
        getUserData(xmlhttp,userData);
    } -- DO NOT UNCOMMENT THIS AS IT IS DDOSING THE SERVER --
    */
    
    console.log(userData);
}

function getUserData(xmlhttp, userData){
    xmlhttp.onreadystatechange = function(){
        if(this.readystate == 4 && this.status == 200){
            userData = this.responseText;
        }
    }
    xmlhttp.open("GET", "/myaccountinfo", true);
    xmlhttp.send();
}