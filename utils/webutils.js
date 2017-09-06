var R = require('ramda');
var log = require('./logutils');

/**
 * Log4js functions Object.
 *
 */
var apd = 'console';
var lyt = 'color';
var app = 'note-web';
var flv = 'DEBUG';

log.config(apd, lyt, app, flv);

var logs = {
  connect:      function() { return log.connect( app,'AUTO'); }
  , fatal:      R.curry(log.logger)(    app, 'FATAL'  )
  , error:      R.curry(log.logger)(    app, 'ERROR'  )
  , warn:       R.curry(log.logger)(    app, 'WARN'   )
  , info:       R.curry(log.logger)(    app, 'INFO'   )
  , debug:      R.curry(log.logger)(    app, 'DEBUG'  )
  , trace:      R.curry(log.logger)(    app, 'TRACE'  )
  , mark:       R.curry(log.logger)(    app, 'MARK'   )
  , count:      R.curry(log.counter)(   app, 'INFO', 'count'  )
  , countEnd:   R.curry(log.counter)(   app, 'INFO', 'print'  )
  , time:       R.curry(log.timer)(     app, 'INFO', 'count'  )
  , timeEnd:    R.curry(log.timer)(     app, 'INFO', 'print'  )
  , profile:    R.curry(log.profiler)(  app, 'INFO', 'count'  )
  , profileEnd: R.curry(log.profiler)(  app, 'INFO', 'print'  )
  , exit:       function(cb) { return log.exit(cb); }
};
module.exports.logs = logs;
