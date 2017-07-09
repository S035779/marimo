/*
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is overwritten.
 * This function does not handle getters and setters or copy attributes.
 */
exports.extend = function(o, p) {
    for(prop in p) {                         // For all props in p.
        o[prop] = p[prop];                   // Add the property to o.
    }
    return o;
}

/*
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is left alone.
 * This function does not handle getters and setters or copy attributes.
 */
exports.merge = function(o, p) {
    for(prop in p) {                           // For all props in p.
        if (o.hasOwnProperty[prop]) continue;  // Except those already in o.
        o[prop] = p[prop];                     // Add the property to o.
    }
    return o;
}

/*
 * Remove properties from o if there is not a property with the same name in p.
 * Return o.
 */
exports.restrict = function(o, p) {
    for(prop in o) {                         // For all props in o
        if (!(prop in p)) delete o[prop];    // Delete if not in p
    }
    return o;
}

/*
 * For each property of p, delete the property with the same name from o.
 * Return o.
 */
exports.subtract = function(o, p) {
    for(prop in p) {                         // For all props in p
        delete o[prop];                      // Delete from o (deleting a
                                             // nonexistent prop is harmless)
    }
    return o;
}

/*
 * Return a new object that holds the properties of both o and p.
 * If o and p have properties by the same name, the values from o are used.
 */
exports.union = function(o,p) { return extend(extend({},o), p); }

/*
 * Return a new object that holds only the properties of o that also appear
 * in p. This is something like the intersection of o and p, but the values of
 * the properties in p are discarded
 */
exports.intersection = function(o,p) { return restrict(extend({}, o), p); }

/*
 * Return an array that holds the names of the enumerable own properties of o.
 */
exports.keys = function(o) {
    if (typeof o !== "object") throw TypeError();  // Object argument required
    var result = [];                 // The array we will return
    for(var prop in o) {             // For all enumerable properties
        if (o.hasOwnProperty(prop))  // If it is an own property
            result.push(prop);       // add it to the array.
    }
    return result;                   // Return the array.
}

exports.and = function(o, p) {
    var result = o.concat(p)
     .filter(function(x, i, y){ return y.indexOf(x) !== y.lastIndexOf(x); })
     .filter(function(x, i, y){ return y.indexOf(x) === i; });
    return result;
}

exports.del = function(o, p) {
    var result =
     o.filter(function(x, i, y) { return p.indexOf(x) === -1; });
    return result;
}

exports.add = function(o, p) {
    var result =
     p.filter(function(x, i, y) { return o.indexOf(x) === -1; });
    return result;
}

exports.dif = function(o, p) {
    var result =
      o.filter(function(x, i, y) { return p.indexOf(x) === -1; })
     .concat(
      p.filter(function(x, i, y) { return o.indexOf(x) === -1; })
     );
    return result;
}

exports.dup = function(o, p) {
    var result = o.concat(p)
     .filter(function(x, i, y){ return y.indexOf(x) === i; });
    return result;
}

exports.getTimeStamp = function() {
  var dt = new Date();
  return dt.toISOString();
};

exports.getLocalTimeStamp = function (s) {
  var dt = new Date(s);
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.toTimeString().split(' ')[0]}`;
};
