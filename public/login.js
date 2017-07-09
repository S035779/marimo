window.onload = function(){
  var el = document.getElementById("username");
  var username = el.textContent;
  //console.log(username);
  var memory = window.localStorage || 
    (window.UserDataStorage && new UserDataStorage()) || 
    new CookieStorage();
  memory.setItem("username", username);
  //for(var name in memory) {
  //  var value = memory[name];
  //  console.log(value);
  //}
  //console.log(memory.getItem("username"));
}

