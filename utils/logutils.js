var log4js = require('log4js');
var std = require('./stdutils');
var pid = process.pid;

/**
 * logger
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name.
 * @param nam {string} - file/category name.
 * @param flv {string} - filter level.
 * @param mlv {string} - message level.
 * @param mss {object|string} - message object/string.
 */
var logger = function(apd, lyt, nam, flv, mlv, msg)  {
  var _msg = [];
  for(var i=5; i<arguments.length; i++) {
    if(typeof arguments[i] === 'object') {
      _msg.push(JSON.stringify(arguments[i], null, 4));
    } else {
      _msg.push(arguments[i]);
    }
  }
  msg = _msg.join(' ');
  config(apd, lyt, nam, flv);
  log(nam, mlv, msg);
};
module.exports.logger = logger;

/**
 * config
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name.
 * @param nam {string} - file/category name.
 * @param lvl {string} - filter level.
 */
var config = function(apd, lyt, nam, lvl)  {
  var appenders = addAppender(apd, lyt, nam);
  var categories = addCategory(nam, lvl);
  log4js.configure({ appenders, categories });
};

/**
 * log
 *
 * @param nam {string} - category name.
 * @param lvl {string} - message level.
 * @param mss {string} - message string.
 */
var log = function(nam, lvl, mss) {
  var lvls = { 
    'FATAL':  'fatal'
    , 'ERROR':  'error'
    , 'WARN':   'warn'
    , 'INFO':   'info'
    , 'DEBUG':  'debug'
    , 'TRACE':  'trace'
    , 'MARK':   'mark'
  };
  var logger = log4js.getLogger(nam);
  logger.log(lvls[lvl], mss);
}

/**
 * exit
 *
 * @param callback {function} - log4js is shutdown by callback function.
 */
var exit = function(callback) {
  return log4js.shutdown(callback);
};
module.exports.exit = exit;

/**
 * addAppender
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name.
 * @param nam {string} - file/category/appender name.
 * @returns {object} - appender object.
 */
var addAppender = function(apd, lyt, nam)  {
  var apds = { 
    'console':  { type: 'console' }
    , 'file':   { type: 'dateFile', filename: 'logs/' + nam  }
    , 'server': { type: 'multiprocess', mode: 'master'
                      , appender: nam, loggerHost: '0.0.0.0' }
    , 'client': { type: 'multiprocess', mode: 'worker'
                                     , loggerHost: '0.0.0.0' }
  };
  var lyts = {
    'color':      { type: 'coloured' }
    , 'basic':    { type: 'basic' }
    , 'json':     { type: 'json', separator: ',' }
  };
  addLayout(lyt);
  var appenders   = {};
  var layout      = lyts[lyt];
  switch(apd) {
    case 'console':
    case 'file':
      appenders[nam] = std.merge(apds[apd], { layout });
      break;
    case 'server':
      appenders[nam] = std.merge(apds['file'], { layout });
      appenders[apd] = apds[apd];
      break
    case 'client':
      appenders[nam] = apds[apd];
      break;
    default:
      throw new Error(
        'Appender not found in "utils/logutils.js".');
      break;
  }
  return appenders;
};

/**
 * addLayout
 *
 * @param lyt {string} - custom layout name.
 */
var addLayout = function(lyt) {
  switch(lyt) {
    case 'json':
      log4js.addLayout(lyt, function(cfg) {
        return function(evt) {
          return JSON.stringify(evt) + cfg.separator;
        }
      });
      break;
    default:
      break;
  }
};

/**
 * addCategory
 *
 * @param nam {string} - category name.
 * @param lvl {string} - filter level.
 * @returns {object} - category object.
 */
var addCategory =function(nam, lvl) {
  var categories  = {};
  var lvls = { 
    'ALL':      'all'
    , 'FATAL':  'fatal'
    , 'ERROR':  'error'
    , 'WARN':   'warn'
    , 'INFO':   'info'
    , 'DEBUG':  'debug'
    , 'TRACE':  'trace'
    , 'MARK':   'mark'
    , 'OFF':    'off'
  };
  var level       = lvls[lvl];
  categories['default'] = { appenders: [nam], level };
  return categories;
};

var _counter = (function(){
  var _s = 'count';
  var _n = {};
  return {
    count: function(s) {
      _s = s || _s;
      return _n[_s]++;
    },
    reset: function(s) {
      _s = s || _s;
      _n[_s] = 0;
    },
    stop: function(s) {
      var _s = s || _s;
      var msg =  `${_s}: ${_n[_s]}`;
      return msg;
    }
  }
})();

var counter = function(apd, lyt, nam, flv, mlv, msg) {
  return {
    count: function(msg) {
      _counter.count(msg);
    },
    reset: function(msg) {
      _counter.reset(msg);
    },
    stop: function(apd, lyt, nam, flv, mlv, msg) {
      config(apd, lyt, nam, flv);
      log(nam, mlv, _counter.stop(msg));
    }
  }
};
module.exports.counter = counter;

var _timer = (function() {
  var _s = 'rapTime';
  var _b = {};
  var _e = {};
  var _r = {};
  var size = function(a,b){
    var i = b - a;
    var ms = i%1000;  i = (i-ms)/1000;
    var sc = i%60;    i = (i-sc)/60;
    var mn = i%60;    i = (i-mn)/60;
    var hr = i%24;    i = (i-hr)/24;
    var dy = i;
    var ret =
      (dy<10 ? '0' : '') + dy + ' ' + 
      (hr<10 ? '0' : '') + hr + ':' + 
      (mn<10 ? '0' : '') + mn + ':' + 
      (sc<10 ? '0' : '') + sc + '.' + 
      (ms<100 ? '0' : '') + (ms<10 ? '0' : '') + ms;
    return ret;
  };
  return {
    start: function(s) {
      _s = s || _s;
      _b[_s] = Date.now();
      _e[_s] = 0;
    },
    count: function(s) { 
      _s = s || _s;
      _e[_s] = Date.now(); 
      _r[_s].push(size(_b[_s], _e[_s])); 
      return _r[_s].join();
    },
    reset: function(s) {
      _s = s || _s;
      _b[_s] = Date.now();
    },
    result: function(s) {
      _s = s || _s;
      var msg =  `${_s}: ${_r[_s].join()}`;
      return msg;
    }
  }
})();

var timer = function(apd, lyt, nam, flv, mlv, msg) {
  return {
    start: function(msg) {
      _timer.start(msg);
    },
    count: function(msg) {
      _timer.count(msg);
    },
    reset: function(msg) {
      _timer.reset(msg);
    },
    stop: function(apd, lyt, nam, flv, mlv, msg) {
      config(apd, lyt, nam, flv);
      log(nam, mlv, _timer.stop(msg));
    }
  }
};
module.exports.timer = timer;

var _heapusage = (function() {
  var _s = 'heapUsed';
  var _b = {};
  var _e = {};
  var _r = {};
  var size = function (a,b){
    if(0 === a) return "0 Bytes";
    var c = 1024;
    var d = b || 3;
    var e = ["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"];
    var f = Math.floor(Math.log(a)/Math.log(c));
    var ret =
      parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
    return ret; 
  };
  return {
    start: function(s) {
      _s = s || _s;
      _b[_s] = process.memoryUsage().heapUsed;
      _e[_s] = 0;
    },
    count: function(s) {
      _s = s || _s;
      _e[_s] = process.memoryUsage().heapUsed
      _r[_s].push(size(_e[_s], 3));
      return _r[_s].join();
    },
    reset: function(s) {
      _s = s || _s;
      _b[_s] = process.memoryUsage().heapUsed;
    },
    result: function(s) {
      _s = s || _s;
      var msg =  `${_s}: ${size(_b[_s], 3)} ${_r[_s].join()}`;
      return msg;
    }
  }
})();

var _cpuusage = (function() {
  var _s = 'cpuUsed';
  var _b = {}; 
  var _e = {};
  var _r = {};
  var _t = {};
  var size = function(a,b,c) {
    if(0 === a) return "0 %";
    var i = b * 1000;
    var d = c || 2;
    var ret = parseFloat((a / i).toFixed(d))+" "+"%"; 
    return ret;
  };
  return {
    start: function(s) {
      _s = s || _s;
      _b[_s] = process.cpuUsage();
      _e[_s] = 0;
      _t[_s] = Date.now();
    },
    count: function(s) {
      _s = s || _s;
      _e[_s] = process.cpuUsage(_b[_s]);
      _r[_s].push(size(_e[_s].user, Date.now()-_t[_s], 2));
      return _r[_s].join();
    },
    reset: function(s) {
      _s = s || _s;
      _b[_s] = process.cpuUsage();
    },
    result: function(s) {
      _s = s || _s;
      var msg =  `${_s}: ${_r[_s].join()}`;
      return msg;
    }
  }
})();

var profiler = function(apd, lyt, nam, flv, mlv, msg) {
  return {
    start: function(msg) {
      _heapusage.start(msg);
      _cpuusage.start(msg);
    },
    count: function(msg) {
      _heapusage.count(msg);
      _cpuusage.count(msg);
    },
    reset: function(msg) {
      _heapusage.reset(msg);
      _cpuusage.reset(msg);
    },
    stop: function(apd, lyt, nam, flv, mlv, msg) {
      config(apd, lyt, nam, flv);
      var _mem = _heapusage.stop(msg);
      var _cpu = _cpuusage.stop(msg);
      log(nam, mlv, _cpu + ', ' + _mem);
    }
  }
};
module.exports.profiler = profiler;

