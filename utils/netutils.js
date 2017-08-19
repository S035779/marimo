/*
 * An "netutils" module for Node.
 */

/*
 * Simple HTTP GET request
 */
exports.get = function(url, callback) {  
  url = require('url').parse(url);
  var hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname
    , query     = url.query;
  if (query) path += "?" + query;

  var callee = arguments.callee;
  var client = require("http");
  var req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    var stat = res.statusCode;
    var head = res.headers;
    if(stat !== 200){
      switch (stat) {
        case 400: case 401: case 403: case 404:
          console.error('HTTP Request Failed. ' 
            + `Status Code: ${stat}`);
          res.resume();
          return; 
        default:
          process.stdout.write('x');
          setTimeout(callee, 1000);
          break;
      }
    }
    res.setEncoding("utf8");
    var body = "";
    res.on("data", function(chunk) { body += chunk; });
    res.on("end", function() {
      process.stdout.write('-');
      if (callback) callback(stat, head, body);
    });
  });

  req.on('error', function(err) {
    console.error('Problem with HTTP Request. '
      + `${err.code}: ${err.message}`);
  });
};

/*
 * Simple HTTP POST request with data as the request body
 */
exports.post = function(url, data, callback) {
  url = require('url').parse(url);
  var hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname
    , query     = url.query;
  if (query) path += "?" + query;

  var type;
  if (data == null) data = "";
  if (data instanceof Buffer)
    type = "application/octet-stream";
  else if (typeof data === "string")
    type = "text/plain; charset=UTF-8";
  else if (typeof data === "object") {
    data = require("querystring").stringify(data);
    type = "application/x-www-form-urlencoded";
  }

  var callee = arguments.callee;
  var client = require("http");
  var req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': type,
      'Content-Length': Buffer.byteLength(data)
    }
  },function(res) {
    var stat = res.statusCode;
    var head = res.headers;
    if(stat !== 200){
      switch (stat) {
        case 400: case 401: case 403: case 404:
          console.error('HTTP Request Failed. ' 
            + `Status Code: ${stat}`);
          res.resume();
          return; 
        default:
          process.stdout.write('x');
          setTimeout(callee, 1000);
          break;
      }
    }
    res.setEncoding("utf8");
    var body = "";
    res.on("data", function(chunk) { body += chunk; });
    res.on("end", function() {
      process.stdout.write('-');
      if (callback) callback(stat, head, body);
    });
  });

  req.on('error', function(err) {
    console.error('Problem with HTTP Request. '
      + `${err.code}: ${err.message}`);
  });
  req.write(data);
  req.end();
};
