require('dotenv').config();
var dburl = process.env.mongodb;

var async = require('async');
var mongoose = require('mongoose');
var dbs = require('../utils/dbsutils');

console.log('sub > nodejs Version: %s', process.version);
init();

function init() {
  process.on('exit', function(code, signal) {
    console.log('sub > Terminated child pid: %d', process.pid);
    console.log('sub >  child process terminated due to receipt of code/signal ', signal || code);
  });
  process.on('message', function(req) {
    console.log('sub >  child got message: ', req);
    queue.push(req);
  });
};

var queue = async.queue(function (req, callback) {
  // DB Connection
  var opt = {
    useMongoClient: true
    , promiseLibrary: global.Promise
  };
  mongoose.connect(dburl, opt);
  var db = mongoose.connection;
  db.on('error', function () {
    console.error('connection error', arguments)
  });
  db.on('open', function() {
    async.waterfall(
      [
        async.apply(dbs.findUser, req, {})
        , dbs.findNote
        , dbs.getResultSet
        , dbs.getIds
        , dbs.getAuctionItems
        , dbs.getBidHistorys
        , dbs.updateHistory
        , dbs.updateNote
        , dbs.findUpdateNote
      ], function(err, res) {
        if (err) {
          console.error(err.stack);
          throw err;
        }
        console.log('sub > results: ', res);
        process.send({ request: req, result: res, pid: process.pid });
      }
    );
    db.close();
    if(callback) callback();
  });
});

queue.drain = function() {
  console.log('sub > all items have been processed.');
};
