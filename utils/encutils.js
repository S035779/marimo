/**
 * Encode the properties of an object as if they were name/value 
 * pairs from an HTML form, 
 * using application/x-www-form-urlencoded format
 */
exports.encodeFormData = function(data) {
  if (!data) return "";
  var pairs = [];
  for(var name in data) {
    if (!data.hasOwnProperty(name)) continue;
    if (typeof data[name] === "function") continue;
    var value = data[name].toString();
    name = encodeURIComponent(name.replace(" ", "+"));
    value = encodeURIComponent(value.replace(" ", "+"));
    pairs.push(name + "=" + value);
  }
  return pairs.join('&');
}

/**
 * Decode an HTML form as if they were name/value pairs from 
 * the properties of an object, 
 * using application/x-www-form-urlencoded format↲
 */
exports.decodeFormData = function(text, sep, eq, isDecode) {
  text = text || location.search.substr(1);
  sep = sep || '&';
  eq = eq || '=';
  var decode = (isDecode) ? decodeURIComponent 
    : function(a) { return a; };
  return text.split(sep).reduce(function(obj, v) {
    var pair = v.split(eq);
    obj[pair[0]] = decode(pair[1]);
    return obj;
  }, {});
};

/**
 * Generated a randam characters, using 'Math.random()' method.
 * $length: number of characters to be generated.
 */
exports.makeRandStr = function(length) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789';
  var str = '';
  for (var i = 0; i < length; ++i) {
    str += chars[ Math.floor( Math.random() * 62 ) ];
  }
  return str;
}

/**
 * Generated a randam characters, using 'Math.random()' method.
 * $length: number of characters to be generated.
 */
exports.makeRandInt = function(length) {
  var chars = '123456789';
  var str = '';
  for (var i = 0; i < length; ++i) {
    str += chars[ Math.floor( Math.random() * 9 ) ];
  }
  return parseInt(str, 10);
}

