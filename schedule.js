require('dotenv').config();
var async = require('async');
var mongoose = require('mongoose');
var mps = require('child_process');
var std = require('./utils/stdutils');
var dbs = require('./utils/dbsutils');
var log = require('./utils/logutils').logs;
var pspid = `main(${process.pid})`;

/**
 * init
 *
 */
var init = function() {
  var psver = process.version;
  // Start Log4js server.
  log.config('console', 'color', 'note-app', 'DEBUG');
  log.info(`${pspid}> Nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb;
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    log.error(`${pspid}> connection error: ${arguments}`);
  });

  mongoose.connection.once('open', function() {
    var dbver = mongoose.version;
    log.info(`${pspid}> Mongoose Version: v${dbver}`);
  });
  
  // Add Node process Event Listener.
  process.once('SIGUSR2', function() {
    log.info(`${pspid}> Got SIGUSR2!`);
    shutdown(process.exit);
  });

  process.on('SIGINT', function() {
    log.info(`${pspid}> Got Ctrl-C!`);
    shutdown(process.exit);
  });

  process.on('SIGTERM', function() {
    log.info(`${pspid}> Got SIGTERM!`);
    shutdown(process.exit); 
  });

  process.on('uncaughtException', function(err) {
    log.error(`${pspid}> Got uncaught exception: ${err.message}`);
    process.exit(1);
  });

  process.on('exit', function(code, signal) {
    console.log(`${pspid}> Terminated main pid: ${pspid}`);
    console.log(`${pspid}> About to exit with c/s:`
    , signal || code);
  });
};

/**
 * shutdown
 *
 * @param callback
 */
var shutdown = function(callback) {
  mongoose.connection.close(function() {
    log.info(`${pspid}> Mongoose was disconnected.`);
    log.close(function() {
      console.log(`${pspid}> Log4js was terminated.`);
      callback();
    });
  });
};

/**
 * fork
 *
 * @returns {object}
 */
var fork = function() {
  var mod = __dirname + '/tasks/index.js';
  var cps = mps.fork(mod);

  cps.on('message', function(req) {
    log.info(`${pspid}> parent got message:`, req);
  });

  cps.on('exit', function(code, signal) {
    log.info(`${pspid}> child process terminated.`
      , `code/signal: ${signal || code}`);
  });

  cps.on('disconnect', function() {
    log.info(`${pspid}> child process disconnected.`);
  });

  log.info(`${pspid}> Forked child pid: ${cps.pid}`);
  return cps;
};

/**
 * main
 *
 */
var main = (function() {
  init();
  var cpu = require('os').cpus().length;
  var cps = [];
  var idx=0;
  var queue = async.queue(function (req, callback) {
    if(cps.length >= cpu) idx=0;
    if(cps[idx] === undefined
      || !cps[idx].connected) cps[idx] = fork();
    cps[idx].send(req);
    idx++;
    if(callback) callback();
  }, cpu);

  queue.drain = function() {
    log.info(`${pspid}> all items have been processed.`);
  };

  var intvl = process.env.interval;
  var monit = process.env.monitor;
  std.invoke(function() {
    async.waterfall([
      async.apply(
        dbs.findUsers, { intvl, monit }, {})
      , dbs.findNotes
    ], function(err, req, res) {
      if(err) {
        log.error(`${pspid}>`, err.stack);
        throw err;
      }
      //log.trace(`${pspid}> results:`, res);
      res.notes.forEach( function(note) {
        queue.push(note, function() {
          log.info(`${pspid}> finished processing.`);
        });
      });
      log.info(`${pspid}> ${monit} min. interval...`);
    });
  }, 0, 1000*60*monit);
})();

