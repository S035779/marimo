var R = require('ramda');
var log4js = require('log4js');
var std = require('./stdutils');
var pid = process.pid;

/**
 * logger
 *
 * @param apd
 * @param lyt
 * @param nam
 * @param lvl
 * @param mss
 */
var logger = function(apd, lyt, nam, lvl, mss)  {
  // init
  var apds = { 
    'console':  { type: 'console' }
    , 'file':   { type: 'dateFile', filename: 'logs/' + nam  }
    , 'server': { type: 'multiprocess', mode: 'master'
                      , appender: nam, loggerHost: '0.0.0.0' }
    , 'client': { type: 'multiprocess', mode: 'worker'
                                     , loggerHost: '0.0.0.0' }
  };
  var lyts = {
    'color':   { type: 'coloured' }
    , 'basic': { type: 'basic' }
    , 'json':  { type: 'json', separator: ',' }
  };
  var lvls = { 
    'ALL':      'all'
    , 'TRACE':  'trace'
    , 'DEBUG':  'debug'
    , 'INFO':   'info'
    , 'WARN':   'warn'
    , 'ERROR': 'error'
    , 'FATAL':  'fatal'
    , 'MARK':   'mark'
    , 'OFF':    'off'
  };

  var appenders   = {};
  var categories  = {};
  var layout      = lyts[lyt];
  var level       = lvls[lvl];

  switch(apd) {
    case 'file': case 'console':
      appenders[nam] = std.merge(apds[apd], { layout });
      break;
    case 'server':
      appenders[nam] = std.merge(apds['file'], { layout });
      appenders[apd] = apds[apd];
      break
    case 'client':
      appenders[nam] = apds[apd];
      break;
  }

  categories['default'] = { appenders: [nam], level };

  log4js.addLayout('json', function(cfg) {
    return function(evt) {
      return JSON.stringify(evt) + cfg.separator;
    }
  });

  // main
  log4js.configure({ appenders, categories });
  var logger = log4js.getLogger(nam);
  logger.log(lvl, mss);
};
module.exports.logger = logger;

/**
 * shutdown
 *
 * @param callback
 * @returns {undefined}
 */
var shutdown = function(callback) {
  log4js.shutdown(callback);
};
module.exports.shutdown = shutdown;

var logServer = R.curry(logger)('server', 'json');
module.exports.logServer = logServer;

var logClient = R.curry(logger)('client', 'json');
module.exports.logClient = logClient;

var logFile = R.curry(logger)('file', 'json');
module.exports.logFile = logFile;

var logTrace = 
  R.curry(logger)('console', 'color', `[${pid}]`, 'TRACE');
module.exports.logTrace = logTrace;

var logDebug = 
  R.curry(logger)('console', 'color', `[${pid}]`, 'DEBUG');
module.exports.logDebug = logDebug;

var logInfo = 
  R.curry(logger)('console', 'color', `[${pid}]`, 'INFO');
module.exports.logInfo = logInfo;

var logWarn = 
  R.curry(logger)('console', 'color', `[${pid}]`, 'WARN');
module.exports.logWarn = logWarn;

var logError = 
  R.curry(logger)('console', 'color', `[${pid}]`, 'ERROR');
module.exports.logError = logError;

var logFatal = 
  R.curry(logger)('console', 'color', `[${pid}]`, 'FATAL');
module.exports.logFatal = logFatal;
