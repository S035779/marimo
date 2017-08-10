var mongoose = require('mongoose');
var async = require('async');
var std = require('../utils/stdutils');
var app = require('../utils/apputils');
var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;

var ObjectId = mongoose.Types.ObjectId;

/*
 * Find Users Object from collection.
**/
exports.findUsers = function(req, res, callback) {
  User.find()
  .exec(function(err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    var users=[];
    docs.forEach(function(doc) {
      users.push(doc);
    });
    //console.log(users);
    if(callback) callback(err, req, std.extend(res, { users }));
  });
};

/*
 * Find Notes Object from collection.
**/
exports.findNotes = function(req, res, callback) {
  var notes=[];
  async.forEachOf(res.users, function(user, idx, cbk) {
    Note.find({ userid: ObjectId(user._id) })
    .exec(function(err, docs) {
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        docs.forEach(function(doc) {
          notes.push(doc);
        });
      } catch(e) {
        return cbk(e);
      }
      cbk();
    });
  }, function (err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    //console.log(notes);
    if(callback) callback(err, req, std.extend(res, { notes }));
  });
};

/*
 *  Get the 'YAHOO! Search Pages',
 *  using 'YAHOO! Search' utility.
**/
exports.getResultSet = function(req, res, callback) {
  app.YHsearch({ appid: req.appid, query: res.note.search, sort: 'bids', order: 'a' },
    function(err, ids, obj, str){
    if (err) {
      console.error(err.message);
      throw err;
    }
    var pages = [];
    var opt = obj.body.ResultSet.root;
    for(var i=0; i<Math.ceil(opt.totalResultsAvailable / opt.totalResultsReturned); i++){
      pages[i]=i+1;
    }
    console.log(`%s [INFO] Number of pages : %s`, std.getTimeStamp(), pages.length);
    console.log(`%s [INFO] Avail: %s, Return: %s, position: %s`, std.getTimeStamp(), opt.totalResultsAvailable, opt.totalResultsReturned, opt.firstResultPosition);
    console.log(`%s [INFO] get getResultSet done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { pages }));
  });
};

/*
 *  Get the 'YAHOO! Auction IDs',
 *  using 'YAHOO! Search' utility.
**/
exports.getAuctionIds = function( req, res, callback) {
  var oldIds = res.note.items;
  var newIds=[];
  var Ids = [];
  async.forEachOf(res.pages, function(page, idx, cbk) {
    console.log(`%s [INFO] page: %s, idx: %s`, std.getTimeStamp(), page, idx);
    app.YHsearch({ appid: req.appid, query: res.note.search, sort: 'gids', order: 'a', page: page }, 
      function(err, ids, obj, str){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        newIds=newIds.concat(ids);
        //console.dir(newIds);
      } catch(e) {
        return cbk(e);
      }
      cbk();
    });
  }, function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    //console.dir(newIds);
    var nowIds = std.and(oldIds, newIds);
    var addIds = std.add(oldIds, newIds);
    var delIds = std.del(oldIds, newIds);
    nowIds.forEach(function(id, idx, arr){
      Ids.push({ id, status: 0 });
    });
    addIds.forEach(function(id, idx, arr){
      Ids.push({ id, status: 1 });
    });
    delIds.forEach(function(id, idx, arr){
      Ids.push({ id, status: 2 });
    });
    //console.dir(Ids);
    console.log(`%s [INFO] get NewIds done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Ids }));
  });
};

/*
 *  Get the 'YAHOO! Auction Items',
 *  using 'YAHOO! Auction item' utility.
**/
exports.getAuctionItems = function( req, res, callback) {
  var Items=[];
  async.forEachOf(res.Ids, function(auction, idx, cbk) {
    console.log(`%s [INFO] auction_id: %s, status: %s, idx: %s`, std.getTimeStamp(), auction.id, auction.status, idx);
    app.YHauctionItem({ appid: req.appid, auctionID: auction.id }, function(err, obj, str){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        Items[auction.id]={ item: obj, status: auction.status };
      } catch(e) {
        return cbk(e);
      }
      cbk();
    });
  },function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    //console.dir(Items);
    console.log(`%s [INFO] get AuctionItems done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Items }));
  });
};

/*
 *  Get the 'YAHOO! Bids Historys',
 *  using 'YAHOO! Bids History' utility.
**/
exports.getBidHistorys = function(req, res, callback) {
  var Bids=[];
  async.forEachOf(res.Ids, function(auction,idx,cbk) {
    console.log(`%s [INFO] auction_id: %s, status: %s, idx: %s`, std.getTimeStamp(), auction.id, auction.status, idx);
    app.YHbidHistory({ appid: req.appid, auctionID: auction.id }, function(err, obj, str){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        Bids[auction.id]={ bids: obj, status: auction.status };
      } catch(e) {
        return cbk(e);
      }
      cbk();
    });
  },function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    //console.dir(Bids);
    console.log(`%s [INFO] get BidsHistorys done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Bids }));
  });
};

/*
 *  Update 'YAHOO! Auction Items History',
 *  to 'YAHOO! Web Application' datadase.
**/
exports.updateHistory = function(req, res, callback) {
  var where = {};
  var values = {};
  var set = {};
  var opt = {};
  var historyIds = res.note.historyid;
  async.forEachOf(res.Ids, function(auction,idx,cbk) {
    if(auction.status === 0) { // Status is 'now'.
      where = { userid: res.note.userid, auctionID: auction.id };
      set = {$set: {
        item:         res.Items[auction.id].item
        , bids:       res.Bids[auction.id].bids
        , status:     0
        , updated:    Date.now()
      }};
      opt = { upsert: false, multi: true };
      History.update(where, set, opt, function(err, docs) {
        if(err) {
          console.error(err.message);
          return cbk(err);
        }
        cbk();
      });
    } else if(auction.status === 1) { // Status is 'add'.
      historyId = new ObjectId;
      values = {
        _id: historyId
        , userid:     res.note.userid
        , auctionID:  auction.id
        , item:       res.Items[auction.id].item
        , bids:       res.Bids[auction.id].bids
        , status:     1
        , updated:    Date.now()
      }; 
      historyIds.push(historyId);
      History.create(values, function(err, docs) {
        if(err) {
          console.error(err.message);
          return cbk(err);
        }
        cbk();
      });
    } else if(auction.status === 2) { // Status is 'del' within 24 hours.
      where = { userid: res.note.userid, auctionID: auction.id, update: {$gte: (Date.now() -1)} };
      set = {$set: {
        item:         res.Items[auction.id].item
        , bids:       res.Bids[auction.id].bids
        , status:     2
        , updated:    Date.now()
      }};
      opt = { upsert: false, multi: true };
      History.update(where, set, opt, function(err, docs) {
        if(err) {
          console.error(err.message);
          return cbk(err);
        }
        cbk();
      });
    }
  },function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] update history done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { historyIds }));
  });
};

/*
 *  Update the 'YAHOO! Auction Items History',
 *  to 'YAHOO! Web Application' datadase.
**/
exports.updateNote = function( req, res, callback) {
  var where = {};
  var set = {};
  var opt = {};
  var items = [];

  for(var i=0; i<res.Ids.length; i++) {
    items.push(res.Ids[i].id);
  }

  where = { userid: res.note.userid, id: res.note.id };
  set = {$set: {
    historyid:  res.historyIds
    , items:    items
  }};
  opt = { upsert: false, multi: true };
  Note.update(where, set, opt, function(err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] update note done`, std.getTimeStamp());
    if(callback) callback(err, req, res);
  });
};

/*
 *  Post Note Object to note collection.
**/
exports.postNote = function( req, res, callback) {
  var where = {};
  var set = {};
  var opt = {};
  var items = [];

  var starred = Boolean(0);
  if(req.starred) starred=Boolean(1);
  for(var i=0; i<res.Ids.length; i++) {
    items.push(res.Ids[i].id);
  }

  where = { userid: res.note.userid, id: res.note.id };
  set = {$set: {
    title:        req.title
    , category:   req.category
    , search:     req.body
    , starred:    starred
    , updated:    req.updated
    , historyid:  res.historyIds
    , items:      items
  }};
  opt = { upsert: false, multi: true };
  Note.update(where, set, opt, function(err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] update note done`, std.getTimeStamp());
    if(callback) callback(err, req, res);
  });
};

/*
 * Get Notes Object from note collection.
**/
exports.getNotes = function(req, res, callback){
  Note.find({ userid: ObjectId(res.user._id) }).populate('historyid')
  .exec(function (err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    var notes = [];
    docs.forEach(function(doc) {
      //console.log(JSON.stringify(doc, null, 4));
      notes.push({
        user:       req.user
        , id:       doc.id
        , title:    doc.title
        , category: doc.cateory
        , body:     doc.search
        , starred:  doc.starred
        , items:    doc.historyid
        , updated:  doc.updated
      });
    });
    console.log(`%s [INFO] find notes done`, std.getTimeStamp());
    if(callback) callback(err, req, notes);
  });
};

/*
 * Find User Object from user collection.
**/
exports.findUser = function(req, res, callback) {
  User.findOne({ username: req.user })
  .exec(function(err, user) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(user);
    console.log(`%s [INFO] find user object done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { user }));
  });
};

/*
 * Find Note Object from note collection.
**/
exports.findNote = function(req, res, callback) {
  Note.findOne({ userid: ObjectId(res.user._id), id: req.key })
  .exec(function (err, note) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(note);
    console.log(`%s [INFO] find note object done.`, std.getIimeStamp());
    if(callback) callback(err, req, std.extend(res, { note }));
  });
};

