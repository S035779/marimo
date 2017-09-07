require('dotenv').config();
var R = require('ramda');
var mongoose = require('mongoose');
var async = require('async');
var express = require('express');
var path = require('path');
var passport = require('passport');
var User = require('../models').User;
var Note = require('../models').Note;
var History = require('../models').History;
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');
var log = require('../utils/logutils').logs;
var ObjectId = mongoose.Types.ObjectId;
var router = express.Router();

router.get('/auth', function(request, response) {
  log.info('===getAuth===');
  response.render('index.jade', { user: request.user });
  log.info(`getAuth all done.`);
});

router.get('/register', function(request, response) {
  log.info('===getRegister===');
  response.render('register.jade', { });
  log.info(`getRegister all done.`);
});

router.post('/register', function(request, response) {
  log.info('===postRegister===');
  User.register(new User({ username : request.body.username })
  , request.body.password, function(err, account) {
    if (err) { 
      return response.render('register', { account : account });
    }
    passport.authenticate('local')(request, response
    , function () {
      response.redirect('/auth'); 
      log.info(`postRegister all done.`);
    });
  });
});

router.get('/login', function(request, response) {
  log.info('===getLogin===');
  response.render('login.jade', { user : request.user });
    log.info(`getLogin all done.`);
});

router.post('/login', passport.authenticate('local')
, function(request, response) {
  log.info('===postLogin===');
  response.redirect('/auth');
  log.info(`postLogin all done.`);
});

router.get('/logout', function(request, response) {
  log.info('===getLogout===');
  request.logout();
  response.redirect('/auth');
  log.info(`getLogout all done.`);
});

/**
 * Get Note Objects.
 *
 * @param request {object}
 * @param response {object}
 */
router.get('/api/note', function(request, response){
  log.info('===getNotes===');
  var body = request.query;
  var appid = process.env.app_id;
  async.waterfall([
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      log.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes); 
    log.info(`getNotes all done.`);
  });
});

/**
 * Update Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note', function(request, response){
  log.info('===postNote===');
  var body = request.body;
  var appid = process.env.app_id;
  async.waterfall([ 
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.updateNote
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      log.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes); 
    log.info(`postNote all done.`);
  });
});

/**
 * Update History Objects.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note/search', function(request, response){
  log.info('===postHistory===');
  var body = request.body;
  var appid = process.env.app_id;
  var intvl = process.env.interval;
  async.waterfall([ 
    async.apply(
      dbs.findUser, { intvl, appid, body }, {})
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
      log.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes);
    log.info(`postHistory all done.`);
  });
});

/**
 * Delete Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note/delete', function(request, response){
  log.info(`===deleteNote===`);
  var appid = process.env.app_id;
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
      log.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes);
    log.info(`deleteNote all done.`);
  });
});

/**
 * Create Note Object.
 *
 * @param request {object}
 * @param response {object}
 */
router.post('/api/note/create', function(request, response) {
  log.info('===createNote===');
  var appid = process.env.app_id;
  var body = request.body;
  async.waterfall([
    async.apply(
      dbs.findUser, { appid, body }, {})
    , dbs.createNote
    , dbs.getNotes
  ], function(err, req, res) {
    if (err) {
      log.error(err.message);
      response.status(404).send(err.message);
    }
    response.json(res.newNotes); 
    log.info(`createNote all done.`);
  });
});

module.exports = router;
