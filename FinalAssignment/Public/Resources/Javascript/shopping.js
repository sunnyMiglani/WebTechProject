function deleteItemFunc(button) {
    //get parent div
    var shopItem = button.parentElement.parentElement;
    //request to server to delete item
    if(window.XMLHttpRequest){
        // Code for modern
        var xmlhttp = new XMLHttpRequest();
    }
    else{
        // for other browsers
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    delItemRequest(xmlhttp, shopItem);
}  

function delItemRequest(xmlhttp, item){
    console.log(item.children[0].children[1]);
    var shopItemString = item.children[0].children[1].innerHTML;

    console.log(shopItemString);
    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            console.log("Success");
            var itemParent = item.parentElement;
            itemParent.removeChild(item);
        }
    }
    xmlhttp.open("DELETE", '/deleteShoppingItem', true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("item="+shopItemString);
}
