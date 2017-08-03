require('dotenv').config();

var mp = require('child_process');
var async = require('async');
var mongoose = require('mongoose');
var cpu = require('os').cpus().length;

var dbs = require('../utils/dbsutils');

/*
 *  First set 'YAHOO! Web Service's Application ID' & initial values.
**/
var appid = process.env.app_id;
var dburl = process.env.mongodb;
var mod = __dirname + '/tasks/index.js';
var opt = {
  useMongoClient: true
  , promiseLibrary: global.Promise
};

// DB Connection
mongoose.connect(mgurl, opt);
var db = mongoose.connection;

db.on('error', function () {
  console.error('connection error', arguments)
});

db.once('open', function() {
  console.log('\n===========');
  console.log('mongoose version: %s', mongoose.version);
  console.log('========\n\n');
});

var cp = [];
for (var i=0; i<cpu; i++) {
  cp[i] = mp.fork(mod);

  cp[i].on('message', function(req) {
    //console.log('< Message parent pid: %d', process.pid);
    console.log('< parent got message:', req);
  });

  cp[i].on('exit', function(code, signal) {
    console.log('< Terminated child pid: %d', cp[i].pid);
    console.log('< child process terminated due to receipt of code/signal %s', signal || code);
    cp[i].fork(mod);
  });

  console.log('< Forked child pid: %d', cp[i].pid);
}

var min = 5;
setInterval(function() {
  async.waterfall(
  [
    dbs.findUser(req)
    , dbs.findNote
  ], function(err, res) {
    if(err) {
      console.error(err.stack);
      throw err;
    }
    console.log('%s [INFO] %d min. interval...', std.getTimeStamp(), min);
  });

  for(var i=0; i<cp.length; i++) {
    cp[i].send( { message: 'from parent. pid:' + process.pid } );
  }
}, min*1000*60)
