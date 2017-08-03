require('dotenv').config();

var async = require('async');
var mongoose = require('mongoose');

var dbs = require('../utils/dbsutils');

var dburl = process.env.mongodb;
var options = {
  useMongoClient: true
  , promiseLibrary: global.Promise
};

process.on('message', function(req) {
  //console.log('> Message child pid: %d', process.pid);
  console.log('>  child got message:', req);

  // DB Connection
  mongoose.connect(dburl, options);
  var db = mongoose.connection;

  db.on('error', function () {
    console.error('connection error', arguments)
  });

  /*
   *  main function.
  **/
  db.on('open', function () {
    async.waterfall(
      [
        dbs.findUser(req)
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
        mongoose.connection.close();
        console.log('all done.');
      }
    );
  });


  process.send( { message: 'from child.  pid:' + process.pid } );
});

process.on('exit', function(code, signal) {
  console.log('> Terminated child pid: %d', process.pid);
  console.log('>  parent process terminated due to receipt of code/signal ', signal || code);
});

