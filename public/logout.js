window.onload = function(){
  var memory = window.localStorage || 
    (window.UserDataStorage && new UserDataStorage()) || 
    new CookieStorage();
  memory.removeItem("username");
  //for(var name in memory) {
  //  var value = memory[name];
  //  console.log(value);
  //}
  //console.log(memory.getItem("username"));
}
