require('dotenv').config();
var dburl = process.env.mongodb;
var secnd = process.env.interval;

var mongoose = require('mongoose');
var async = require('async');
var mps = require('child_process');
var std = require('./utils/stdutils');
var dbs = require('./utils/dbsutils');

var cps = [];
var mod = __dirname + '/tasks/index.js';
var cpu = require('os').cpus().length;

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
db.once('open', function() {
  console.log('main> mongoose Version: v%s', mongoose.version);
});

console.log('main> nodejs Version: %s', process.version);
for (var i=0; i<cpu; i++) {
  init(i);
}

function init(idx) {
  cps[idx] = mps.fork(mod);
  cps[idx].on('message', function(req) {
    console.log('main> parent got message: ', req);
  });
  cps[idx].on('exit', function(code, signal) {
    console.log('main> child process terminated due to receipt of code/signal %s', signal || code);
  });
  cps[idx].on('disconnect', function() {
    console.log('main> child process disconnected.');
  });
  console.log('main> Forked child pid: %d', cps[idx].pid);
};

var index=0;
var queue = async.queue(function (req, callback) {
  if(index >= cps.length) index=0;
  if(!cps[index].connected) {
    console.log('main> child.connnected proparty is [%s].', cps[index].connected);
    init(index);
  }
  cps[index].send( req );
  index++;
  if(callback) callback();
}, cps.length);

queue.drain = function() {
  console.log('main> all items have been processed.');
};

setInterval(function() {
  async.waterfall(
  [
    async.apply(dbs.findUsers, {}, {})
    , dbs.findNotes
  ], function(err, res) {
    if(err) {
      console.error(err.stack);
      throw err;
    }
    console.log('main> results: ', res);
    res.notes.forEach(function(note) {
      queue.push(note);
    });
    console.log('%s [INFO] %d sec. interval...', std.getTimeStamp(), secnd);
  });
}, secnd*1000);

