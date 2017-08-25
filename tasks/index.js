require('dotenv').config();
var dburl = process.env.mongodb;
var appid = process.env.app_id;

var async = require('async');
var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');

init();
main();

function init() {
  console.log('%s [INFO] sub(%d) > nodejs Version: %s'
    , std.getTimeStamp()
    , process.pid
    , process.version
  );

  // DB Connection
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    console.error('%s [ERR] sub(%d) > connection error'
      , std.getTimeStamp()
      , process.pid
      , arguments
    );
  });

  mongoose.connection.once('open', function() {
    console.log('%s [INFO] sub(%d) > mongoose Version: v%s'
      , std.getTimeStamp()
      , process.pid
      , mongoose.version
    );
  });
};

function main() {
  var queue = async.queue(function (req, callback) {
    async.waterfall([
      async.apply(dbs.findHistorys, { appid }, { note: req })
      , dbs.getResultSet
      , dbs.getAuctionIds
      , dbs.getAuctionItems
      , dbs.getBidHistorys
      , dbs.updateHistorys
      , dbs.updateNote
    ], function(err, req, res) {
      if (err) {
        console.error('%s [ERR] sub(%d) > '
          , std.getTimeStamp()
          , process.pid
          , err.stack
        );
        throw err;
      }
      //console.log('%s [INFO] sub > results: '
      //, std.getTimeStamp(), res);
      process.send({ request: req, pid: process.pid });
      if(callback) callback();
    });
  }, 1);

  process.on('exit', function(code, signal) {
    console.log('%s [INFO] sub(%d) > Terminated child pid: %d'
      , std.getTimeStamp()
      , process.pid
      , process.pid
    );
    console.log('%s [INFO] sub(%d) >  child process terminated. code/signal: %s'
      , std.getTimeStamp()
      , process.pid
      , signal || code
    );
  });

  process.on('message', function(req) {
    //console.log('%s [INFO] sub >  child got message: '
    //  , std.getTimeStamp()
    //  , req
    //);
    queue.push(req, function() {
      console.log(
        '%s [INFO] sub(%d) > finished processing note object.'
        , std.getTimeStamp()
        , process.pid
      );
    });
  });

  queue.drain = function() {
    console.log('%s [INFO] sub(%d) > all items have been processed.'
      , std.getTimeStamp()
      , process.pid
    );
  };
};
