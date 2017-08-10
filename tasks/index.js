require('dotenv').config();
var dburl = process.env.mongodb;
var appid = process.env.app_id;

var async = require('async');
var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');

// DB Connection
mongoose.Promise = global.Promise;
mongoose.connect(dburl,{
  useMongoClient: true
  , promiseLibrary: global.Promise
});

mongoose.connection.on('error', function () {
  console.error('%s [ERR] sub > connection error', std.getTimeStamp(), arguments)
});

mongoose.connection.once('open', function() {
  console.log('%s [INFO] sub > mongoose Version: v%s', std.getTimeStamp(), mongoose.version);
});

console.log('%s [INFO] sub > nodejs Version: %s', std.getTimeStamp(), process.version);
init();

function init() {
  process.on('exit', function(code, signal) {
    console.log('%s [INFO] sub > Terminated child pid: %d', std.getTimeStamp(), process.pid);
    console.log('%s [INFO] sub >  child process terminated due to receipt of code/signal ', std.getTimeStamp(), signal || code);
  });
  process.on('message', function(req) {
    //console.log('%s [INFO] sub >  child got message: ', std.getTimeStamp(), req);
    queue.push(req, function() {
      console.log('%s [INFO] sub > finished processing note object.', std.getTimeStamp());
    });
  });
};

var queue = async.queue(function (req, callback) {
  async.waterfall([
    async.apply(dbs.getResultSet, { appid }, { note: req })
    , dbs.getIds
    , dbs.getAuctionItems
    , dbs.getBidHistorys
    , dbs.updateHistory
    , dbs.updateNote
  ], function(err, req, res) {
    if (err) {
      console.error('%s [ERR] sub > ', std.getTimeStamp(), err.stack);
      throw err;
    }
    //console.log('%s [INFO] sub > results: ', std.getTimeStamp(), res);
    process.send({ request: req, pid: process.pid });
    if(callback) callback();
  });
}, 1);

queue.drain = function() {
  console.log('%s [INFO] sub > all items have been processed.', std.getTimeStamp());
};
