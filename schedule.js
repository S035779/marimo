require('dotenv').config();
var dburl = process.env.mongodb;
var hour = process.env.interval;

var mongoose = require('mongoose');
var async = require('async');
var mps = require('child_process');
var std = require('./utils/stdutils');
var dbs = require('./utils/dbsutils');

init();
main();

function init(){
  console.log('%s [INFO] main> nodejs Version: %s'
    , std.getTimeStamp()
    , process.version
  );

  // DB Connection
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    console.error('%s [ERR] connection error'
      , std.getTimeStamp()
      , arguments
    );
  });

  mongoose.connection.once('open', function() {
    console.log('%s [INFO] main> mongoose Version: v%s'
      , std.getTimeStamp()
      , mongoose.version
    );
  });
};

function main() {
  var cps = [];
  var mod = __dirname + '/tasks/index.js';
  //var cpu = require('os').cpus().length;
  var cpu = 1;

  for (var i=0; i<cpu; i++) {
    cps[i] = mps.fork(mod);
    cps[i].on('message', function(req) {
      console.log('%s [INFO] main> parent got message: '
        , std.getTimeStamp()
        , req
      );
    });
    cps[i].on('exit', function(code, signal) {
      console.log(
        '%s [INFO] main> child process terminated. code/signal: %s'
        , std.getTimeStamp()
        , signal || code
      );
    });
    cps[i].on('disconnect', function() {
      console.log('%s [INFO] main> child process disconnected.'
        , std.getTimeStamp()
      );
    });
    console.log('%s [INFO] main> Forked child pid: %d'
      , std.getTimeStamp(), cps[i].pid
    );
  }

  var index=0;
  var queue = async.queue(function (req, callback) {
    if(index >= cps.length) index=0;
    if(!cps[index].connected) {
      console.log(
        '%s [INFO] main> child.connnected proparty is [%s].'
        , std.getTimeStamp()
        , cps[index].connected 
      );
      init(index);
    }
    cps[index].send(req);
    index++;
    if(callback) callback();
  }, cps.length);

  queue.drain = function() {
    console.log('%s [INFO] main> all items have been processed.'
      , std.getTimeStamp()
    );
  };

  std.invoke(function() {
    async.waterfall([
      async.apply(
        dbs.findUsers, {}, {})
      , dbs.findNotes
    ], function(err, req, res) {
      if(err) {
        console.error('%s [ERR] main> '
          , std.getTimeStamp()
          , err.stack
        );
        throw err;
      }
      //console.log('%s [INFO] main> results: '
      //, std.getTimeStamp(), res);
      res.notes.forEach( function(note) {
        queue.push(note, function() {
          console.log('%s [INFO] main> finished processing.'
            , std.getTimeStamp()
          );
        });
      });
      console.log('%s [INFO] main> %d hours interval...'
        , std.getTimeStamp()
        , hour 
      );
    });
  }, 1000*5, 1000*60*10, 1000*60*60);
};

