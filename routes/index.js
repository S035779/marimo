require('dotenv').config();
var appid = process.env.app_id;

var path = require('path');
var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');

var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');
var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;
var ObjectId = mongoose.Types.ObjectId;

var router = express.Router();

router.get('/auth'
  , function(request, response, next) {
  response.render('index.jade', { user: request.user });
});

router.get('/register'
  , function(request, response) {
  response.render('register.jade', { });
});
router.post('/register'
  , function(request, response) {
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

router.get('/login'
  , function(request, response) {
  response.render('login.jade', { user : request.user });
});
router.post('/login'
  , passport.authenticate('local')
  , function(request, response) {
  response.redirect('/auth');
});

router.get('/logout'
  , function(request, response) {
  request.logout();
  response.redirect('/auth');
});

/**
 * Get Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.get('/api/note', function(request, response){
  console.log('%s [INFO] ===getNotes==='
    , std.getTimeStamp());
  var body = request.query;
  async.waterfall([
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      console.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes); 
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

/**
 * Update Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note', function(request, response){
  console.log('%s [INFO] ===postNote==='
    , std.getTimeStamp());
  var body = request.body;
  async.waterfall([ 
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.updateNote
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      console.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes); 
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

/**
 * Update History Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note/search', function(request, response){
  console.log('%s [INFO] ===postSearch==='
    , std.getTimeStamp());
  var body = request.body;
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
    , dbs.updateNote
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      console.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes);
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

/**
 * Delete Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note/delete', function(request, response){
  console.log(`%s [INFO] ===deleteNote===`
    , std.getTimeStamp());
  var body = request.body;
  async.waterfall([
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.findNote
    , dbs.removeHistorys
    , dbs.removeNote
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      console.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes);
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

/**
 * Create Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note/create', function(request, response) {
  console.log('%s [INFO] ===createNote==='
    , std.getTimeStamp());
  var body = request.body;
  async.waterfall([
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.createNote
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      console.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes); 
    console.log(`%s [INFO] all done.`, std.getTimeStamp());
  });
});

module.exports = router;
