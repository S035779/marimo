/**
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is 
 * overwritten. This function does not handle getters and setters 
 * or copy attributes.
 *
 * @param {object} o
 * @param {object} p
 * @returns {object}
 */
var extend = function(o, p) {
  for(prop in p) {            // For all props in p.
    o[prop] = p[prop];        // Add the property to o.
  }
  return o;
};
module.exports.extend = extend;

/**
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is 
 * left alone. This function does not handle getters and setters 
 * or copy attributes.
 *
 * @param {object} o
 * @param {object} p
 * @returns {object}
 */
var merge = function(o, p) {
  for(prop in p) {            // For all props in p.
    if (o.hasOwnProperty[prop]) continue;
                              // Except those already in o.
    o[prop] = p[prop];        // Add the property to o.
  }
  return o;
};
module.exports.merge = merge;

/**
 * Remove properties from o if there is not a property with the 
 * same name in p. Return o.
 *
 * @param {object} o
 * @param {object} p
 * @returns {object}
 */
var restrict = function(o, p) {
  for(prop in o) {            // For all props in o
    if (!(prop in p)) delete o[prop];
                              // Delete if not in p
  }
  return o;
};
module.exports.restrict = restrict;

/**
 * For each property of p, delete the property with the same name 
 * from o. Return o.
 *
 * @param {object} o
 * @param {object} p
 * @returns {object}
 */
var subtract = function(o, p) {
  for(prop in p) {            // For all props in p
    delete o[prop];           // Delete from o (deleting a
                              // nonexistent prop is harmless)
  }
  return o;
};
module.exports.subtract = subtract;

/**
 * Return a new object that holds the properties of both o and p.
 * If o and p have properties by the same name, the values 
 * from o are used.
 *
 * @param {object} o
 * @param {object} p
 * @returns {object}
 */
var union = function(o,p) { return extend(extend({},o), p); }
module.exports.union = union;

/**
 * Return a new object that holds only the properties of o that 
 * also appear in p. This is something like the intersection of o 
 * and p, but the values of the properties in p are discarded
 *
 * @param {object} o
 * @param {object} p
 * @returns {object}
 */
var intersection = function(o,p) { 
  return restrict(extend({}, o), p); 
};
module.exports.intersection = intersection;

/**
 * Return an array that holds the names of the enumerable own 
 * properties of o.
 *
 * @param {object} o
 * @returns {array}
 */
var keys = function(o) {
  if (typeof o !== "object") throw TypeError();
                              // Object argument required
  var result = [];            // The array we will return
  for(var prop in o) {        // For all enumerable properties
    if (o.hasOwnProperty(prop)) 
                              // If it is an own property
      result.push(prop);      // add it to the array.
  }
  return result;              // Return the array.
};
module.exports.keys = keys;

/**
 * and
 *
 * @param {array} o
 * @param {array} p
 * @returns {array}
 */
var and = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result = _o.concat(_p)
   .filter(function(x, i, y){ 
     return y.indexOf(x) !== y.lastIndexOf(x); })
   .filter(function(x, i, y){ 
     return y.indexOf(x) === i; });
  return result;
};
module.exports.and = and;

/**
 * del
 *
 * @param {array} o
 * @param {array} p
 * @returns {array}
 */
var del = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result =
   _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; });
  return result;
};
module.exports.del = del;

/**
 * add
 *
 * @param {array} o
 * @param {array} p
 * @returns {array}
 */
var add = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result =
   _p.filter(function(x, i, y) { return _o.indexOf(x) === -1; });
  return result;
};
module.exports.add = add;

/**
 * dif
 *
 * @param {array} o
 * @param {array} p
 * @returns {array}
 */
var dif = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result =
    _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; })
   .concat(
      _p.filter(function(x, i, y) { 
        return _o.indexOf(x) === -1; })
    );
  return result;
};
module.exports.dif = dif;

/**
 * dup
 *
 * @param {array} o
 * @param {array} p
 * @returns {array}
 */
var dup = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result = _o.concat(_p)
   .filter(function(x, i, y){ return y.indexOf(x) === i; });
  return result;
};
module.exports.dup = dup;

/**
 * dst
 *
 * @param {array} o
 * @returns {array}
 */
var dst = function(o) { 
  if (!Array.isArray(o)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = _o.sort(function(s, t){
    var a=s.toString().toLowerCase();
    var b=t.toString().toLowerCase();
    if(a<b) return -1;
    if(a>b) return 1;
    return 0;
  });
  var result =  _p.filter(function(x, i, y) {
    if(i===0) return true;
    return x!==y[i-1];
  })
  return result;
};
module.exports.dst = dst;

/**
 * getTimeStamp
 *
 * @returns {string}
 */
var getTimeStamp = function() {
  var dt = new Date();
  return dt.toISOString();
};
module.exports.getTimeStamp = getTimeStamp;

/**
 * getLocalTimeStamp
 *
 * @param {string} s
 * @returns {string}
 */
var getLocalTimeStamp = function (s) {
  var dt = new Date(s);
  var _yr = dt.getFullYear();
  var _mo = dt.getMonth() + 1;
  var _dy = dt.getDate();
  var _tm = dt.toTimeString().split(' ')[0];
  return `${_yr}-${_mo}-${_dy} ${_tm}`;
};
module.exports.getLocalTimeStamp = getLocalTimeStamp;

/**
 * Schedule an invocation or invovations of fn() in the future.
 * Note that the call to invoke() does not block: it returns 
 * right away.
 *
 * @param {function} fn - If interval is specified but end is 
 *                          omited, then never stop invoking fn.
 *                        If interval and end are omited, then 
 *                          just invoke fn once after start ms.
 *                        If only fn is specified, behave as is 
 *                          start was 0.
 * @param {number} s -  Wait start milliseconds, then call fn().
 * @param {number} i -  Call fn() every interval milliseconds.
 * @param {number} e -  Stopping after a total of start+end 
 *                      milliseconds.
 */
var invoke = function(fn, s, i, e) {
  if (!s) s = 0;
  setTimeout(fn, s);
  if (arguments.length >= 3) {
    setTimeout(function() {
      var h = setInterval(fn, i);
      if (e) setTimeout(function() { clearInterval(h); }, e);
    }, s);
  }
}
module.exports.invoke = invoke;

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
  var chars =
'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789';
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

