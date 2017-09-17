var mongoose = require('mongoose');
var async = require('async');
var std = require('../utils/stdutils');
var app = require('../utils/apputils');
var log = require('../utils/logutils').logs;
var User = require('../models').User;
var Note = require('../models').Note;
var History = require('../models').History;

var ObjectId = mongoose.Types.ObjectId;
var pspid = `common(${process.pid})`;

/**
 * Find User Object from user collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findUser = function(req, res, callback) {
  var username = req.body.user;
  User.findOne({ username }).exec(function(err, user) {
    if (err) {
      log.error(err.message);
      return callback(err);
    }
    //log.trace(user);
    log.info(`${pspid}> find User done.`);
    callback(err, req, std.extend(res, { user }));
  });
};
module.exports.findUser = findUser;

/**
 * Find Note Object from note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findNote = function(req, res, callback) {
  var userid = ObjectId(res.user._id);
  var id = req.body.id;
  Note.findOne({ userid, id }).exec(function (err, note) {
    if (err) {
      log.error(err.message);
      return callback(err);
    }
    //log.trace(note);
    log.info(`${pspid}> find Note done.`);
    callback(err, req, std.extend(res, { note }));
  });
};
module.exports.findNote = findNote;

/**
 * Remove Historys Object from history collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var removeHistorys = function(req, res, callback) {
  var noteid = ObjectId(res.note._id);
  History.remove({ noteid }).exec(function(err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    log.info(`${pspid}> remove Historys done.`);
    callback(err, req, res);
  });
};
module.exports.removeHistorys = removeHistorys;

/**
 * Remove Note Object from note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var removeNote = function(req, res, callback) {
  var userid = ObjectId(res.user._id);
  var id = req.body.id;
  Note.remove({ userid, id }, function(err) {
    if (err) {
      log.error(err.message);
      return callback(err);
    }
    log.info(`${pspid}> remove Note done.`);
    callback(err, req, res);
  });
};
module.exports.removeNote = removeNote;

/**
 * Create Note Object to note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var createNote = function(req, res, callback){
  Note.create({ 
    _id: new ObjectId
    , userid:    ObjectId(res.user._id)
    , id:        req.body.id
    , title:     req.body.title
    , category:  req.body.category
    , starred:   req.body.starred
    , search:    req.body.body
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
  }, function(err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    callback(err, req, res);
  });
};
module.exports.createNote = createNote;

/**
 * Find Users Object from collection.
 * 
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findUsers = function(req, res, callback) {
  User.find()
  .exec(function(err, docs) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    var users=[];
    docs.forEach(function(doc) {
      users.push(doc);
    });
    //log.trace(users);
    log.info(`${pspid}> find Users done.`);
    callback(err, req, std.extend(res, { users }));
  });
};
module.exports.findUsers = findUsers;

/**
 * Find Notes Object from collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findNotes = function(req, res, callback) {
  var int = req.hasOwnProperty('intvl') ? req.intvl : 24;
  var mon = req.hasOwnProperty('monit') ? req.monit : 5;
  var users = res.users;

  var int = int*1000*60*60;
  var mon = mon*1000*60;
  var date = new Date();
  var now = date.getTime();

  var notes=[];
  async.forEach(users, function(user, cbk) {
    Note.find({ 
      userid: ObjectId(user._id) 
    }).exec(function(err, docs) {
      if(err) {
        return cbk(err);
      }
      try {
        docs.forEach(function(doc) {
          var isMon = ((now - doc.updated) % int) < mon;
          //log.trace('updated? :'
          //, updated, nowMon, (nowMon-updated)%int, mon);
          log.debug(doc.id, isMon);
          if (isMon) notes.push(doc);
        });
      } catch(e) {
        return cbk(e);
      }
      cbk();
    });
  }, function (err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    //log.trace(notes);
    log.info(`${pspid}> find Notes done.`);
    callback(err, req, std.extend(res, { notes }));
  });
};
module.exports.findNotes = findNotes;

/**
 * Find Historys Object from collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findHistorys = function(req, res, callback) {
  var historyids = res.note.historyid;
  var historys=[];
  async.forEach(historyids, function(historyid, cbk) {
    History.find({
      _id: ObjectId(historyid)
      , status: { $in: [ 0, 1, 2 ] }
    }).exec(function(err, docs) {
      if(err) {
        return cbk(err);
      }
      try {
        docs.forEach(function(doc) {
          historys[doc.auctionID] = doc;
        });
      } catch(e) {
        return cbk(e);
      }
      cbk();
    });
  }, function (err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    //log.trace(historys);
    log.info(`${pspid}> find Historys done.`);
    callback(err, req, std.extend(res, { historys }));
  });
};
module.exports.findHistorys = findHistorys;

/**
 * Get the 'YAHOO! Search Pages', using 'YAHOO! Search' utility.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getResultSet = function(req, res, callback) {
  var maxPage = req.hasOwnProperty('pages') ? req.pages : 5;
  var query = req.hasOwnProperty('body') 
    ? req.body.body : res.note.search;
  var page = req.hasOwnProperty('body') ? 1 : maxPage;

  log.count();
  log.time();
  log.profile();

  app.YHsearch({ 
    appid:    req.appid
    , query
    , sort:   'bids'
    , order:  'a' 
  }, function(err, ids, obj){
    if (err) {
      log.error(err.message);
      return callback(err);
    }
    var opt = obj.body.ResultSet.root;
    var pages = [];
    for(var i=0; i<Math.ceil(
      opt.totalResultsAvailable/opt.totalResultsReturned); i++){
      if(i>=page) break;
      pages[i]=i+1;
    }
    log.debug(`Number of pages: ${pages.length}`);
    //log.trace(`Avail, Return, position :`
    //  , opt.totalResultsAvailable
    //  , opt.totalResultsReturned
    //  , opt.firstResultPosition
    //);
    
    log.countEnd();
    log.timeEnd();
    log.profileEnd();

    log.info(`${pspid}> get ResultSet done.`);
    callback(err, req, std.extend(res, { pages }));
  });
};
module.exports.getResultSet = getResultSet;

/**
 * Get the 'YAHOO! Auction IDs', using 'YAHOO! Search' utility.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getAuctionIds = function(req, res, callback) {
  var int = req.hasOwnProperty('intvl') ? req.intvl : 24;
  var query = req.hasOwnProperty('body') 
    ? req.body.body : res.note.search;
  var historys = res.hasOwnProperty('historys')
    ? res.historys : null;

  log.time();
  log.profile();

  var newIds = [];
  var Ids = [];
  async.forEachSeries(res.pages, function(page, cbk) {
    //log.trace(`page:`, page);
    app.YHsearch({ 
      appid:    req.appid
      , query
      , sort:   'bids'
      , order:  'a'
      , page:   page 
    }, function(err, ids, obj){
      if (err) {
        return cbk(err);
      }
      try {
        if (ids.length > 0) newIds=newIds.concat(ids);
        //log.trace(ids);
      } catch(e) {
        return cbk(e);
      }
      log.count();
      cbk();
    });
  }, function(err) {
    if (err) {
      log.error(err.message);
      return callback(err);
    }
    try {
      //log.trace(newIds);
      Ids = helperIds(historys, newIds, int);
    } catch(err) {
      return callback(err);
    }
    
    log.countEnd();
    log.timeEnd();
    log.profileEnd();

    log.info(`${pspid}> get AuctionIDs done.`);
    callback(err, req, std.extend(res, { Ids }));
  });
};
module.exports.getAuctionIds = getAuctionIds;

/**
 * helperIds
 *
 * @param o {object} - Now History Objects.
 * @param p {array} - New AuctionID's Array.
 * @param q {number} - Interval times of Monitoring.
 * @returns {array} - AuctionIDs Array.
 */
var helperIds = function(o, p, q) {
  var date = new Date();
  var oldDate = date.setHours(date.getHours()-q);
  var result = [];

  var _o = std.keys(o);

  // When the status is '0:now'.
  var _x = std.and(_o, p);
  _x.forEach(function(id){
    result.push({ id, _id: o[id]._id, status: 0 });
  });

  // When the status is '1:new'.
  var _y = std.add(_o, p);
  _y.forEach(function(id){
    var historyId = new ObjectId;
    result.push({ id, _id: historyId, status: 1 });
  });

  // When the status is '2:del' or '3:old'.
  var _z = std.del(_o, p);
  _z.forEach(function(id){
    if(o[id].updated > oldDate) {
      result.push({ id, _id: o[id]._id, status: 2 });
    } else {
      result.push({ id, _id: o[id]._id, status: 3 });
    }
  });
  //log.trace(result);
  return result;
};

/**
 * Get the 'YAHOO! Auction Items', 
 * using 'YAHOO! Auction item' utility.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getAuctionItems = function(req, res, callback) {
  var Ids = res.Ids;

  log.time();
  log.profile();

  var Items=[];
  async.forEachSeries(Ids, function(Id, cbk) {
    //log.trace(`auction_id, status :`, Id.id, Id.status);
    switch(Id.status) {
      case 0:
      case 1:
        // When the status is '0:now', '1:add'.
        app.YHauctionItem({ appid: req.appid, auctionID: Id.id }
        , function(err, obj){
          if(err) {
            return cbk(err);
          }
          Items[Id.id]={ item: obj, status: Id.status };
          //log.trace(Items[Id.id]);
          log.count();
          cbk();
        });
        break;
      case 2:
      case 3:
      default:
        // When the status is '2:del', '3:old'.
        cbk();
        break;
    }
  }, function(err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    //log.trace(Items);
    
    log.countEnd();
    log.timeEnd();
    log.profileEnd();

    log.info(`${pspid}> get AuctionItems done.`);
    callback(err, req, std.extend(res, { Items }));
  });
};
module.exports.getAuctionItems = getAuctionItems;

/**
 * Get the 'YAHOO! Bids Historys',
 * using 'YAHOO! Bids History' utility.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getBidHistorys = function(req, res, callback) {
  var Ids = res.Ids;

  log.time();
  log.profile();

  var Bids=[];
  async.forEachSeries(Ids, function(Id, cbk) {
    //log.trace(`auction_id, status :`, Id.id, Id.status);
    switch(Id.status) {
      case 0:
      case 1:
        // When the status is '0:now', '1:add'.
        app.YHbidHistory({ appid: req.appid, auctionID: Id.id }
        , function(err, obj){
          if(err) {
            return cbk(err);
          }
          Bids[Id.id]={ bids: obj, status: Id.status };
          //log.trace(Bids[Id.id]);
          log.count();
          cbk();
        });
        break;
      case 2:
      case 3:
      default:
        // When the status is '2:del', '3:old'.
        cbk();
        break;
    }
  }, function(err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    //log.trace(Bids);
    
    log.countEnd();
    log.timeEnd();
    log.profileEnd();

    log.info(`${pspid}> get BidsHistorys done.`);
    callback(err, req, std.extend(res, { Bids }));
  });
};
module.exports.getBidHistorys = getBidHistorys;

/**
 * Update Historys Object to history collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var updateHistorys = function(req, res, callback) {
  var Ids = res.Ids;
  var userid = res.note.userid;
  var noteid = ObjectId(res.note._id);
  var where = {};
  var set = {};
  var opt = {};
  var obj = {};
  async.forEach(Ids, function(Id, cbk) {
    switch(Id.status) {
      case 0:
        // When the status is '0:now'.
        obj = {
          item:        res.Items[Id.id].item
          , bids:      res.Bids[Id.id].bids
          , status:    Id.status
          , updated:   Date.now()
        };
        where = { noteid, auctionID: Id.id };
        set   = { $set: obj };
        opt   = { upsert: false, multi: true };
        History.update(where, set, opt, function(err) {
          if(err) {
            return cbk(err);
          }
          cbk();
        });
        break;
      case 1:
        // When the status is '1:add'.
        obj = {
          _id: Id._id
          , userid
          , noteid
          , auctionID: Id.id
          , item:      res.Items[Id.id].item
          , bids:      res.Bids[Id.id].bids
          , status:    Id.status
          , updated:   Date.now()
        };
        History.create(obj, function(err) {
          if(err) {
            return cbk(err);
          }
          cbk();
        });
        break;
      case 2:
      case 3:
        // When the status is '2:del', '3:old'.
        obj = {
          status:    Id.status
        };
        where = { noteid, auctionID: Id.id };
        set   = { $set: obj };
        opt   = { upsert: false, multi: true };
        History.update(where, set, opt, function(err) {
          if(err) {
            return cbk(err);
          }
          cbk();
        });
        break;
      default:
        cbk();
        break;
    }
  }, function(err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    log.info(`${pspid}> update Historys done.`);
    callback(err, req, res);
  });
};
module.exports.updateHistorys = updateHistorys;

/**
 *  Update Note Object to note collection at Web Only.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var updateNote = function(req, res, callback) {
  var userid,id,starred;
  var obj = {};
  if (req.hasOwnProperty('body')) { // isBody
    userid = ObjectId(res.user._id);
    id = req.body.id;
    starred = req.body.starred ? Boolean(1) : Boolean(0);
    obj = {
      title:        req.body.title
      , category:   req.body.category
      , search:     req.body.body
      , starred:    starred
      , updated:    req.body.updated
    };
  } else if (res.hasOwnProperty('note')) { // isNote
    userid = res.note.userid;
    id = res.note.id;
  }

  //if (res.hasOwnProperty('historyIds') 
  if(res.hasOwnProperty('Ids')) { // isItem
    var historyid = [];
    var items = [];
    res.Ids.forEach(function(Id){
      switch(Id.status) {
        case 0:
        case 1:
        case 2:
          historyid.push(Id._id);
          items.push(Id.id);
          break;
        case 3:
        default:
          break;
      }
    });
    obj = std.merge(obj, { historyid, items });
  }

  var where = { userid, id };
  var set   = { $set: obj };
  var opt   = { upsert: false, multi: true };
  Note.update(where, set, opt, function(err) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    log.info(`${pspid}> update Note done.`);
    callback(err, req, res);
  });
};
module.exports.updateNote = updateNote;

/**
 * Get Notes Object from note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getNotes = function(req, res, callback){
  var userid = ObjectId(res.user._id);
  Note.find({ userid }).populate('historyid')
  .exec(function (err, docs) {
    if(err) {
      log.error(err.message);
      return callback(err);
    }
    var newNotes = [];
    docs.forEach(function(doc) {
      //log.trace(doc);
      newNotes.push({
        user:       req.body.user
        , id:       doc.id
        , title:    doc.title
        , category: doc.category
        , body:     doc.search
        , starred:  doc.starred
        , items:    doc.historyid
        , updated:  doc.updated
      });
    });
    log.info(`${pspid}> get Notes done.`);
    callback(err, req, std.extend(res, { newNotes }));
  });
};
module.exports.getNotes = getNotes;

