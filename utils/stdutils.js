/*
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is 
 * overwritten.
 * This function does not handle getters and setters or copy 
 *attributes.
 */
exports.extend = function(o, p) {
  for(prop in p) {            // For all props in p.
    o[prop] = p[prop];        // Add the property to o.
  }
  return o;
}

/*
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is 
 * left alone.
 * This function does not handle getters and setters or copy 
 * attributes.
 */
exports.merge = function(o, p) {
  for(prop in p) {            // For all props in p.
    if (o.hasOwnProperty[prop]) continue;
                              // Except those already in o.
    o[prop] = p[prop];        // Add the property to o.
  }
  return o;
}

/*
 * Remove properties from o if there is not a property with the 
 * same name in p.
 * Return o.
 */
exports.restrict = function(o, p) {
  for(prop in o) {            // For all props in o
    if (!(prop in p)) delete o[prop];
                              // Delete if not in p
  }
  return o;
}

/*
 * For each property of p, delete the property with the same name 
 * from o.
 * Return o.
 */
exports.subtract = function(o, p) {
  for(prop in p) {            // For all props in p
    delete o[prop];           // Delete from o (deleting a
                              // nonexistent prop is harmless)
  }
  return o;
}

/*
 * Return a new object that holds the properties of both o and p.
 * If o and p have properties by the same name, the values 
 * from o are used.
 */
exports.union = function(o,p) { return extend(extend({},o), p); }

/*
 * Return a new object that holds only the properties of o that 
 * also appear
 * in p. This is something like the intersection of o and p, but 
 * the values of
 * the properties in p are discarded
 */
exports.intersection = function(o,p) { 
  return restrict(extend({}, o), p); 
}

/*
 * Return an array that holds the names of the enumerable own 
 * properties of o.
 */
exports.keys = function(o) {
  if (typeof o !== "object") throw TypeError();
                              // Object argument required
  var result = [];            // The array we will return
  for(var prop in o) {        // For all enumerable properties
    if (o.hasOwnProperty(prop)) 
                              // If it is an own property
      result.push(prop);      // add it to the array.
  }
  return result;              // Return the array.
}

/**
 * and
 *
 * @param o {array}
 * @param p {array}
 * @returns {array}
 */
exports.and = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result = _o.concat(_p)
   .filter(function(x, i, y){ 
     return y.indexOf(x) !== y.lastIndexOf(x); })
   .filter(function(x, i, y){ 
     return y.indexOf(x) === i; });
  return result;
}

/**
 * del
 *
 * @param o {array}
 * @param p {array}
 * @returns {array}
 */
exports.del = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result =
   _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; });
  return result;
}

/**
 * add
 *
 * @param o {array}
 * @param p {array}
 * @returns {array}
 */
exports.add = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result =
   _p.filter(function(x, i, y) { return _o.indexOf(x) === -1; });
  return result;
}

/**
 * dif
 *
 * @param o {array}
 * @param p {array}
 * @returns {array}
 */
exports.dif = function(o, p) {
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
}

/**
 * dup
 *
 * @param o {array}
 * @param p {array}
 * @returns {array}
 */
exports.dup = function(o, p) {
  if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
  var _o = o.filter(function(x){ return x });
  var _p = p.filter(function(x){ return x });
  var result = _o.concat(_p)
   .filter(function(x, i, y){ return y.indexOf(x) === i; });
  return result;
}

/**
 * dst
 *
 * @param o {array}
 * @returns {array}
 */
exports.dst = function(o) { 
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
}

/**
 * getTimeStamp
 *
 * @returns {string}
 */
exports.getTimeStamp = function() {
  var dt = new Date();
  return dt.toISOString();
};

/**
 * getLocalTimeStamp
 *
 * @param s
 * @returns {string}
 */
exports.getLocalTimeStamp = function (s) {
  var dt = new Date(s);
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.toTimeString().split(' ')[0]}`;
};

exports.counter = function(){
  var n=0;
  return {
    count: function() { return n++; },
    reset: function() { n = 0; },
    toString: function() { return console.log(n); }
  }
};

exports.timer = function() {
  var date = new Date();
  var start = date.getTime();
  var stop;
  return {
    count: function() { 
      stop = date.getTime(); 
      return stop - start;
    },
    reset: function() { 
      start = date.getTime(); 
    },
    toString: function() {
      return console.log(stop-start);
    }
  }
};
