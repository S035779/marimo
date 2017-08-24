require('dotenv').config();

var path = require('path');
var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');

var app = require('../utils/apputils');
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');

var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;
var ObjectId = mongoose.Types.ObjectId;

var appid = process.env.app_id;

var router = express.Router();

router.get('/auth', function(request, response, next) {
  response.render('index.jade', { user: request.user });
});

router.get('/register', function(request, response) {
  response.render('register.jade', { });
});

router.post('/register', function(request, response) {
  User.register(
    new User({ username : request.body.username })
    , request.body.password
    , function(err, account) {
    if (err) { 
      return response.render('register', { account : account });
    }

    passport.authenticate('local')(request, response
    , function () {
      response.redirect('/auth'); 
    });
  });
});

router.get('/login', function(request, response) {
  response.render('login.jade', { user : request.user });
});

router.post('/login', passport.authenticate('local')
, function(request, response) {
  response.redirect('/auth');
});

router.get('/logout', function(request, response) {
  request.logout();
  response.redirect('/auth');
});

/**
 * Get Note Object.
 *
 * @param request
 * @param response
 * @returns {undefined}
 */
router.get('/api/note', function(request, response){
  console.log('%s [INFO] ===getNotes===', std.getTimeStamp());
  var body = request.query;
  async.waterfall([
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.getNotes
  ], function(err, res) {
    if (err) response.status(404).send(err.message);
    response.json(res.newNotes); 
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

/**
 * Post Note Object.
 *
 * @param request
 * @param response
 * @returns {undefined}
 */
router.post('/api/note', function(request, response){
  console.log('%s [INFO] ===postNote===', std.getTimeStamp());
  var body = request.body;
  async.waterfall([ 
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.postNote
    , dbs.getNotes
  ], function(err, res) {
    if (err) response.status(404).send(err.message);
    response.json(res.newNotes); 
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

/**
 * Post Note Object.
 *
 * @param request
 * @param response
 * @returns {undefined}
 */
router.post('/api/note/search', function(request, response){
  var body = request.body;
  console.log('%s [INFO] ===searchNote===', std.getTimeStamp());
  async.waterfall([ 
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.findNote
    , dbs.findHistorys
    , dbs.getResultSet
    , dbs.getAuctionIds
    , dbs.getAuctionItems
    , dbs.getBidHistorys
    , dbs.updateHistorys
    , dbs.postNote
    , dbs.getNotes
  ], function(err, res) {
    if (err) response.status(404).send(err.message);
    response.json(res.newNotes);
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

router.post('/api/note/delete', function(request, response){
  console.log(`%s [INFO] ===deleteNote===`, std.getTimeStamp());
  var username = request.body.user;
  var key = request.body.id;
  async.waterfall( // async start.
    [
      function(callback) {
        User.findOne({ username: username })
        .exec(function(err, user) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          //console.log(user);
          var userId = ObjectId(user._id);
          console.log(`%s [INFO] find user object done.`
            , std.getTimeStamp());
          if(callback) callback(null, userId);
        });
      }, function(userId, callback) {
        console.log(`%s [INFO] deleteNote : userid=%s`
          , std.getTimeStamp(), userId);
        console.log(`%s [INFO] deleteId : id=%s`
          , std.getTimeStamp(), key);
        var note = { 
          userid: userId
          , id:   key
        };
        Note.remove(note, function(err, docs) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          console.log(`%s [INFO] delete note done.`
            , std.getTimeStamp());
          if(callback) callback(null, userId);
        });
      }, function(userId, callback) {
        console.log(`%s [INFO] findNotes : userid=%s`
          , std.getTimeStamp(), userId);
        Note.find({userid: userId})
        .populate('historyid')
        .exec(function (err, notes) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          //console.log(notes);
          var newNotes=[];
          notes.forEach(function(note) {
            //console.log(JSON.stringify(note, null, 4));
            newNotes.push({
              user:       username
              , id:       note.id
              , title:    note.title
              , category: note.category
              , body:     note.search
              , starred:  note.starred
              , items:    note.historyid
              , updated:  note.updated
            });
          });
          response.json(newNotes); 
          console.log(`%s [INFO] find note done.`
            , std.getTimeStamp());
          if(callback) callback(null);
        });
      }
    ], function(err, result) {
      if (err) response.status(404).send(err.message);
      console.log(`%s [INFO] all done.`, std.getTimeStamp());
    }
  ); // async end.
});

router.post('/api/note/create', function(request, response) {
  console.log('%s [INFO] ===createNote===', std.getTimeStamp());
  var username = request.body.user;
  var key = request.body.id;
  async.waterfall( // async start.
    [ function(callback) {
        User.findOne({ username: username })
        .exec(function(err, user) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          //console.log(user);
          var userId = ObjectId(user._id);
          callback(null, userId);
        });
        console.log(`%s [INFO] find user object done.`
          , std.getTimeStamp());
      }, function(userId, callback) {
        console.log(`%s [INFO] createNotes : userid=%s`
          , std.getTimeStamp(), userId);
        var note = { 
          _id: new ObjectId
          , userid:    userId
          , id:        key
          , title:     request.body.title
          , category:  request.body.category
          , starred:   request.body.starred
          , search:    request.body.body
          , options: { category:       0
                     , page:           0
                     , sort:           ""
                     , order:          ""
                     , store:          ""
                     , aucminprice:    0
                     , aucmaxprice:    0
                     , aucmin_bidorbuy_price: 0
                     , aucmax_bidorbuy_price: 0
                     , loc_cd:         0
                     , easypayment:    0
                     , new:            0
                     , freeshipping:   0
                     , wrappingicon:   0
                     , buynow:         0
                     , thumbnail:      0
                     , attn:           0
                     , point:          0
                     , gift_icon:      0
                     , item_status:    0
                     , offer:          0
                     , adf:            0
                     , min_charity:    0
                     , max_charity:    0
                     , min_affiliate:  0
                     , max_affiliate:  0
                     , timebuf:        0
                     , ranking:        ""
                     , seller:         ""
                     , f:              "" 
            }
          , items: []
          , created:   Date.now()
          , updated:   Date.now()
        };
        Note.create(note, function(err, docs) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          callback(null, userId);
        });
        console.log(`%s [INFO] create note done.`
          , std.getTimeStamp());
      }, function(userId, callback) {
        console.log(`%s [INFO] findNotes : userid=%s`
          , std.getTimeStamp(), userId);
        Note.find({userid: userId})
        .populate('historyid')
        .exec(function (err, docs) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          var newNotes=[];
          docs.forEach(function(doc) {
            //console.log(JSON.stringify(doc, null, 4));
            newNotes.push({
              user:       username
              , id:       doc.id
              , title:    doc.title
              , category: doc.category
              , body:     doc.search
              , starred:  doc.starred
              , items:    doc.historyid
              , updated:  doc.updated
            });
          });
          response.json(newNotes); 
          console.log(`%s [INFO] find notes done.`
            , std.getTimeStamp());
          callback(null);
        });
      }
    ], function(err, result) {
      if (err) response.status(404).send(err.message);
      console.log(`%s [INFO] all done.`, std.getTimeStamp());
    }
  ); // async end.
});
// DB version end.

module.exports = router;
