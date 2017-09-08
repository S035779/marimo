var log4js = require('log4js');
var std = require('./stdutils');
/**
 * Log4js functions Object.
 *
 */
var logs = {
  app: '',
  config: function(apd, lyt, nam, flv) {
    this.app = nam;
    config(apd, lyt, nam, flv);
  },
  connect: function() {
    return connect(this.app, 'AUTO');
  },
  close: function(cb) {
    close(cb);
  },
  fatal: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'FATAL', args);
  },
  error: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'ERROR', args);
  },
  warn: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'WARN', args);
  },
  info: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'INFO', args);
  },
  debug: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'DEBUG', args);
  },
  trace: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'TRACE', args); 
  },
  mark: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    logger(this.app, 'MARK', args);
  },
  count: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    counter(this.app, 'INFO', 'count', args);
  },
  countEnd: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    counter(this.app, 'INFO', 'print', args);
  },
  time: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    timer(this.app, 'INFO', 'count', args);
  },
  timeEnd: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    timer(this.app, 'INFO', 'print', args);
  },
  profile: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    profiler(this.app, 'INFO', 'count', args);
  },
  profileEnd: function(msg) {
    var args = Array.prototype.slice.call(arguments);
    profiler(this.app, 'INFO', 'print', args);
  }
};
module.exports.logs = logs;

var lvls = { 
  'ALL':      'all'
  , 'AUTO':   'auto'
  , 'OFF':    'off'
  , 'FATAL':  'fatal'
  , 'ERROR':  'error'
  , 'WARN':   'warn'
  , 'INFO':   'info'
  , 'DEBUG':  'debug'
  , 'TRACE':  'trace'
  , 'MARK':   'mark'
};

/**
 * logger
 *
 * @param nam {string} - file/category name.
 * @param mlv {string} - message level.
 * @param msg {object|string|array}
 *                     - message object/string/array.
 */
var logger = function(nam, mlv, msg)  {
  var _msg = msg.map(function(val) {
    if(typeof val === 'object') {
      return JSON.stringify(val, null, 4);
    } else if(val == null) {
      return '?';
    } else {
      return val;
    }
  });
  log(nam, mlv, _msg.join(' '));
};

/**
 * counter
 *
 * @param nam {string} - file/category name.
 * @param mlv {string} - message level.
 * @param cmd {string} - function command.
 * @param msg {string} - message title.
 * @returns {function}
 */
var counter = function(nam, mlv, cmd, ttl) {
  var _fn = {
    count: function() {
      _counter.count(ttl);
    },
    print: function() {
      var _cnt = _counter.stop(ttl)
      log(nam, mlv, _cnt);
    }
  }
  return _fn[cmd];
};

/**
 * timer
 *
 * @param nam {string} - file/category name.
 * @param mlv {string} - message level.
 * @param cmd {string} - function command.
 * @param ttl {string} - message title.
 * @returns {function}
 */
var timer = function(nam, mlv, cmd, ttl) {
  var _fn = {
    count: function() {
      _timer.count(ttl);
    },
    print: function() {
      var _tim = _timer.stop(ttl);
      log(nam, mlv, _tim);
    }
  }
  return _fn[cmd];
};

/**
 * profiler
 *
 * @param nam {string} - file/category name.
 * @param mlv {string} - message level.
 * @param cmd {string} - function command.
 * @param msg {string} - message title.
 * @returns {function}
 */
var profiler = function(nam, mlv, cmd, ttl) {
  var _fn = {
    count: function() {
      _heapusage.count(ttl);
      _cpuusage.count(ttl);
    },
    stop: function() {
      var _mem = _heapusage.stop(ttl);
      var _cpu = _cpuusage.stop(ttl);
      log(nam, mlv, _cpu + ',' + _mem);
    }
  }
  return _fn[cmd];
};

/**
 * config
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name or server(apd=client only).
 * @param nam {string} - file/category name.
 * @param flv {string} - filter level.
 */
var config = function(apd, lyt, nam, flv)  {
  var appenders = _appender(apd, lyt, nam);
  var categories = _category(nam, flv);
  _layout(lyt);
  log4js.configure({ appenders, categories });
};

/**
 * log
 *
 * @param nam {string} - category name.
 * @param mlv {string} - message level.
 * @param msg {string} - message string.
 */
var log = function(nam, mlv, msg) {
  var logger = log4js.getLogger(nam);
  logger.log(lvls[mlv], msg);
}

/**
 * connect
 *
 * @param nam {string} - category name.
 * @param mlv {string} - message level.
 * @return {object}
 */
var connect = function(nam, mlv) {
  var logger = log4js.getLogger(nam);
  var level = lvls[mlv];
  var format = ':method :url';
  var nolog = '\\.(gif\|jpe?g\|png)$';
  return log4js.connectLogger(logger, { level, format, nolog });
}

/**
 * exit
 *
 * @param callback {function} - log4js is shutdown by callback
 *                              function.
 */
var close = function(callback) {
  log4js.shutdown(function() {
    if(callback) callback();
  });
};

/**
 * _appender
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name or server(apd=client only).
 * @param nam {string} - file/category/appender name.
 * @returns {object} - appender object.
 */
var _appender = function(apd, lyt, nam)  {
  var apds = { 
    'console':  { type: 'console' }
    , 'file':   { type: 'dateFile', filename: 'logs/' + nam  }
    , 'server': { type: 'multiprocess', mode: 'master'
                      , appender: nam, loggerHost: '0.0.0.0' }
    , 'client': { type: 'multiprocess', mode: 'worker'
                                     , loggerHost: lyt }
  };
  var lyts = {
    'color':      { type: 'coloured' }
    , 'basic':    { type: 'basic' }
    , 'json':     { type: 'json', separator: ',' }
  };
  var appenders   = {};
  var layout      = lyts[lyt];
  switch(apd) {
    case 'console':
    case 'file':
      appenders[nam] = std.merge(apds[apd], { layout });
      break;
    case 'server':
      appenders[nam] = std.merge(apds['file'], { layout });
      appenders['_'+nam] = apds[apd];
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
 * _category
 *
 * @param nam {string} - category name.
 * @param flv {string} - filter level.
 * @returns {object} - category object.
 */
var _category =function(nam, flv) {
  var categories  = {};
  var level = lvls[flv];
  categories['default'] = { appenders: [nam], level };
  return categories;
};

/**
 * _layout
 *
 * @param lyt {string} - custom layout name.
 */
var _layout = function(lyt) {
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
 * _counter
 *
 * @returns {function}
 */
var _counter = (function(){
  var _s = 'count';
  var _n = {};
  return {
    count: function(s) {
      _s = s || _s;
      if(_n.hasOwnProperty(_s))  _n[_s] = 0;
      return _n[_s]++;
    },
    print: function(s) {
      var _s = s || _s;
      var msg =  `${_s}: ${_n[_s]}`;
      delete _n[_s];
      return msg;
    }
  }
})();

/**
 * _timer
 *
 * @returns {function}
 */
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
    count: function(s) { 
      _s = s || _s;
      if(_b.hasOwnProperty(_s))  _b[_s] = Date.now();
      _e[_s] = Date.now(); 
      _r[_s].push(size(_b[_s], _e[_s])); 
      return _r[_s].join();
    },
    print: function(s) {
      _s = s || _s;
      var msg =  `${_s}: ${_r[_s].join()}`;
      delete _b[_s], _e[_s], _r[_s];
      return msg;
    }
  }
})();

/**
 * _heapusage
 *
 * @returns {function}
 */
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
    count: function(s) {
      _s = s || _s;
      if(_b.hasOwnProperty(_s))
        _b[_s] = process.memoryUsage().heapUsed;
      _e[_s] = process.memoryUsage().heapUsed
      _r[_s].push(size(_e[_s], 3));
      return _r[_s].join();
    },
    print: function(s) {
      _s = s || _s;
      var msg =  `${_s}: ${size(_b[_s], 3)} ${_r[_s].join()}`;
      delete _b[_s], _e[_s], _r[_s];
      return msg;
    }
  }
})();

/**
 * _cpuusage
 *
 * @returns {function}
 */
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
    count: function(s) {
      _s = s || _s;
      if(_b.hasOwnProperty(_s)) {
        _b[_s] = process.cpuUsage();
        _t[_s] = Date.now();
      }
      _e[_s] = process.cpuUsage(_b[_s]);
      _r[_s].push(size(_e[_s].user, Date.now()-_t[_s], 2));
      return _r[_s].join();
    },
    print: function(s) {
      _s = s || _s;
      var msg =  `${_s}: ${_r[_s].join()}`;
      delete _b[_s], _e[_s], _r[_s], _t[_s];
      return msg;
    }
  }
})();

