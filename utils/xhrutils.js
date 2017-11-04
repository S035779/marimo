/**
 * encodeFormData
 *
 * @param data {object}
 * @returns {string}
 */
var encodeFormData = function(data) {
    if (!data) return ""
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
};

/**
 * get
 *
 * @param url {string}
 * @param data {object}
 * @param callback {function}
 */
var get = function(url, data, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url +
                 "?" + encodeFormData(data));
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader("Content-Type");
            if (type.indexOf("xml") !== -1
              && request.responseXML) {
                callback(request.responseXML);
            } else
            if (type === "application/json; charset=utf-8") {
                callback(JSON.parse(request.responseText));
            } else {
                callback(request.responseText);
            }
        }
    };
    request.send(null);
};
module.exports.get = get;

/**
 * getData
 *
 * @param url {string}
 * @param data {object}
 * @param callback {function}
 */
var getData = function(url, data, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url +
                 "?" + encodeFormData(data));
    request.onreadystatechange = function() {
        if (request.readyState === 4
          && callback) callback(request);
    };
    request.send(null);
};
module.exports.getData = getData;

/**
 * postData
 *
 * @param url {string}
 * @param data {object}
 * @param callback {function}
 */
var postData = function(url, data, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && callback)
            callback(request);
    };
    request.setRequestHeader("Content-Type",
                            "application/x-www-form-urlencoded");
    request.send(encodeFormData(data));
};
module.exports.postData = postData;

/**
 * postJSON
 *
 * @param url {string}
 * @param data {object}
 * @param callback {function}
 */
var postJSON = function(url, data, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && callback)
            callback(request);
    };
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(data));
};
module.exports.postJSON = postJSON;

/**
 * JSONP.request
 *
 * @param url {string}
 * @param data {object}
 * @param callback {string}
 */
var JSONP = {
  index: 0,
  callbacks: {},
  request: function(url, data, callback) {
    var idx = '_' + JSONP.index++;
    var elm = document.createElement('script');
    elm.type = 'text/javascript';
    elm.charset = 'utf-8';
    elm.src = url
      + "?" + encodeFormData(data)
      + '&' + 'callback=JSONP.callbacks.' + idx;
    JSONP.callbacks[idx] = function(res) {
      elm.parentNode.removeChild(elm);
      delete JSONP.callbacks[idx];
      callback(res);
    };
    document.getElementsByTagName('head')[0].appendChild(elm);
  }
};
module.exports.JSONP = JSONP;
