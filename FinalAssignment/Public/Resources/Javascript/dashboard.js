"use strict"

window.onload = function() {
    var body = document.getElementsByTagName("BODY")[0];
    if (window.XMLHttpRequest) {
        // code for modern browsers
        var xmlhttp = new XMLHttpRequest();
    } 
    else {
        // code for old IE browsers
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } 
    getBody(xmlhttp, body);
}


function getBody(xmlhttp, body) {
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        body.innerHTML = this.responseText;
        }
    };
    xmlhttp.open("GET", "/dashboardBody", true);
    xmlhttp.send();
}