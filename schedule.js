require('dotenv').config();
var async = require('async');
var mongoose = require('mongoose');
var mps = require('child_process');
var std = require('./utils/stdutils');
var dbs = require('./utils/dbsutils');
var log = require('./utils/logutils').logs;

var pspid = `main(${process.pid})`;
var psenv = process.env.NODE_ENV;

/**
 * init
 *
 */
var init = function() {
  var psver = process.version;
  if(psenv === 'development')
    log.config('console', 'color', 'note-app', 'TRACE');

  if(psenv === 'staging')
    log.config('server', 'basic', 'note-app', 'DEBUG');

  if(psenv === 'production')
    log.config('server', 'json', 'note-app', 'INFO');

  // Start Log4js.
  log.info(`${pspid}> Nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb;
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function (err) {
    log.error(`${pspid}> Got Mongoose error: ${err.name}`);
    log.error(`${pspid}> ${err.message}`);
    log.error(`${pspid}> ${err.stack}`);
    shutdown(process.exit);
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
    log.error(`${pspid}> Got uncaught exception: ${err.name}`);
    log.error(`${pspid}> ${err.message}`);
    log.error(`${pspid}> ${err.stack}`);
    shutdown(process.exit); 
  });

  process.on('warning', function(err) {
    log.warn(`${pspid}> Got warning!: ${err.name}`);
    log.warn(`${pspid}> ${err.message}`);
    log.warn(`${pspid}> ${err.stack}`);
  });

  process.on('exit', function(code, signal) {
    console.log(`${pspid}> Terminated main pid: ${process.pid}`);
    console.log(
      `${pspid}> about to exit with c/s: ${signal || code}`);
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
    log.trace(`${pspid}> Parent got message:`, req);
  });

  cps.on('error', function(err) {
    log.error(`${pspid}> Got error: ${err.name}`);
    log.error(`${pspid}> ${err.message}`);
    log.error(`${pspid}> ${err.stack}`);
  });

  cps.on('disconnect', function() {
    log.info(`${pspid}> IPC channel disconnected.`);
  });

  cps.on('exit', function(code, signal) {
    log.info(`${pspid}> Child process terminated.`);
    log.info(
      `${pspid}> about to exit with c/s: ${signal || code}`);
  });

  cps.on('close', function(code, signal) {
    log.info(`${pspid}> Child process closed.`);
    log.info(
      `${pspid}> about to close with c/s: ${signal || code}`);
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
  var intvl = process.env.interval;
  var monit = process.env.monitor;
  var cpu = require('os').cpus().length;
  var cps = [];
  var idx=0;
  var queue = async.queue(function (req, callback) {
    idx = (idx < cpu) ? idx : 0;
    if(cps[idx] === undefined || !cps[idx].connected)
      cps[idx] = fork();
    cps[idx].send(req, function(err) {
      if(err) {
        log.error(`${pspid}> Got error: ${err.name}`);
        log.error(`${pspid}> ${err.message}`);
        log.error(`${pspid}> ${err.stack}`);
      }
    });
    idx++;
    callback();
  }, cpu);

  queue.drain = function() {
    log.info(`${pspid}> all items have been processed.`);
  };

  std.invoke(function() {
    async.waterfall([
      async.apply(
        dbs.findUsers, { intvl, monit }, {})
      , dbs.findNotes
    ], function(err, req, res) {
      if(err) {
        log.error(`${pspid}> Got error: ${err.name}`);
        log.error(`${pspid}> ${err.message}`);
        log.error(`${pspid}> ${err.stack}`);
        return;
      }
      try {
        //log.trace(`${pspid}> results:`, res);
        res.notes.forEach( function(note) {
          queue.push(note, function(err) {
            if(err) throw new Error(err);
            log.info(`${pspid}> finished processing.`);
          });
        });
      } catch(err) {
        log.error(`${pspid}> Got error: ${err.name}`);
        log.error(`${pspid}> ${err.message}`);
        log.error(`${pspid}> ${err.stack}`);
        return;
      }
      log.info(`${pspid}> ${monit} min. interval...`);
    });
  }, 0, 1000*60*monit);
})();

