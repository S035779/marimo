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
    console.log(`%s [INFO] find Users done.`, std.getTimeStamp());
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
    console.log(`%s [INFO] find Notes done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { notes }));
  });
};

/*
 * Find Notes Object from collection.
**/
exports.findHistorys = function(req, res, callback) {
  var historys=[];
  async.forEachOf(res.note.historyid, function(historyid, idx, cbk) {
    History.find({ _id: ObjectId(historyid) })
    .exec(function(err, docs) {
      if(err) {
        console.error(err.message);
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
      console.error(err.message);
      throw err;
    }
    //console.log(historys);
    console.log(`%s [INFO] find Historys done.`, std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { historys }));
  });
};;

/*
 *  Get the 'YAHOO! Search Pages',
 *  using 'YAHOO! Search' utility.
**/
exports.getResultSet = function(req, res, callback) {
  app.YHsearch({ appid: req.appid, query: res.note.search, sort: 'bids', order: 'a' }
    , function(err, ids, obj, str){
    if (err) {
      console.error(err.message);
      throw err;
    }
    var pages = [];
    var opt = obj.body.ResultSet.root;
    for(var i=0; i<Math.ceil(opt.totalResultsAvailable / opt.totalResultsReturned); i++){
      pages[i]=i+1;
    }
    //console.log(`%s [INFO] Number of pages : %s`, std.getTimeStamp(), pages.length);
    //console.log(`%s [INFO] Avail: %s, Return: %s, position: %s`
    //  , std.getTimeStamp()
    //  , opt.totalResultsAvailable
    //  , opt.totalResultsReturned
    //  , opt.firstResultPosition
    //);
    console.log(`%s [INFO] get ResultSet done.`, std.getTimeStamp());
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
    //console.log(`%s [INFO] page: %s, idx: %s`, std.getTimeStamp(), page, idx);
    app.YHsearch({ appid: req.appid, query: res.note.search, sort: 'gids', order: 'a', page: page }
      , function(err, ids, obj, str){
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
    var nowDay = new Date();
    var oldDay = nowDay.setDate(nowDay.getDate()-1);
    nowIds.forEach(function(id, idx, arr){
      Ids.push({ id, status: 0, updated: Date.now() });
    });
    addIds.forEach(function(id, idx, arr){
      Ids.push({ id, status: 1, updated: Date.now() });
    });
    delIds.forEach(function(id, idx, arr){
      if(res.historys[id].updated > oldDay)
        Ids.push({ id, status: 2, updated: res.historys[id].updated });
    });
    //console.dir(Ids);
    console.log(`%s [INFO] get AuctionIDs done.`, std.getTimeStamp());
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
    //console.log(`%s [INFO] auction_id: %s, status: %s, idx: %s`
    //  , std.getTimeStamp()
    //  , auction.id
    //  , auction.status
    //  , idx
    //);
    app.YHauctionItem({ appid: req.appid, auctionID: auction.id }
      , function(err, obj, str){
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
    //console.log(`%s [INFO] auction_id: %s, status: %s, idx: %s`
    //  , std.getTimeStamp()
    //  , auction.id
    //  , auction.status
    //  , idx
    //);
    app.YHbidHistory({ appid: req.appid, auctionID: auction.id }
      , function(err, obj, str){
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
exports.updateHistorys = function(req, res, callback) {
  var where = {};
  var values = {};
  var set = {};
  var opt = {};
  var historyIds = res.note.historyid;
  async.forEachOf(res.Ids, function(auction,idx,cbk) {
    if(auction.status === 0) { // When the status is '0:now'.
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
    } else if(auction.status === 1) { // When the status is '1:add'.
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
    } else if(auction.status === 2) { // When the status is '2:del'.
      where = { userid: res.note.userid, auctionID: auction.id };
      set = {$set: {
        item:         res.Items[auction.id].item
        , bids:       res.Bids[auction.id].bids
        , status:     2
        //, updated:    Date.now()
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
    console.log(`%s [INFO] update Historys done.`, std.getTimeStamp());
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
    console.log(`%s [INFO] update Note done`, std.getTimeStamp());
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
    console.log(`%s [INFO] post Note done`, std.getTimeStamp());
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
    console.log(`%s [INFO] get Notes done`, std.getTimeStamp());
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
    console.log(`%s [INFO] find User done.`, std.getTimeStamp());
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
    console.log(`%s [INFO] find Note done.`, std.getIimeStamp());
    if(callback) callback(err, req, std.extend(res, { note }));
  });
};

