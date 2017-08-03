var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var app = require('../utils/apputils');

//Query Execution
var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;
var ObjectId = mongoose.Types.ObjectId;

/*
 * Find User Object from user collection.
**/
exports.findUser = function(req) {
  User.findOne({ username: req.user })
  .exec(function(err, user) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(user);
    console.log(`%s [INFO] find user object done.`, std.getTimeStamp());
    callback(null, req, std.extend( {}, { userId: ObjectId(user._id) });
  });
};


/*
 * Find Note Object from note collection.
**/
exports.findNote = function(req, res, callback) {
  Note.findOne({userid: res.userId, id: req.key })
  .exec(function (err, note) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(note);
    console.log(`%s [INFO] find note object done.`, std.getIimeStamp());
    if(callback) callback(null, req, std.extend(res, { note: note });
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
    var page = Math.ceil(opt.resAvailable / opt.resReturned);
    for(var i=0; i<page; i++){
      pages[i]=i+1;
    }
    console.log(`%s [INFO] Number of pages : %s`, std.getTimeStamp(), pages.length);
    console.log(`%s [INFO] Avail: %s, Return: %s, position: %s`, std.getTimeStamp(), opt.resAvailable, opt.resReturned, opt.resPosition);
    console.log(`%s [INFO] get getResultSet done.`, std.getTimeStamp());
    if(callback) callback(null, req, std.extend(res, { pages: pages });
  });
};

/*
 *  Get the 'YAHOO! Auction IDs',
 *  using 'YAHOO! Search' utility.
**/
exports.getIds = function( req, res, callback) {
  var oldIds = res.note.items;
  var newIds=[];
  var Ids = [];
  async.forEachOf(pages, function(page, idx, cbk) {
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
      Ids.push({ id: id, status: 0 });
    });
    addIds.forEach(function(id, idx, arr){
      Ids.push({ id: id, status: 1 });
    });
    delIds.forEach(function(id, idx, arr){
      Ids.push({ id: id, status: 2 });
    });
    //console.dir(Ids);
    console.log(`%s [INFO] get NewIds done.`, std.getTimeStamp());
    if(callback) callback(null, req, std.extend(res, { Ids: Ids });
  });
};

/*
 *  Get the 'YAHOO! Auction Items',
 *  using 'YAHOO! Auction item' utility.
**/
exports.getAuctionItems = function( req, res, callback) {
  var Items=[];
  async.forEachOf(res.Ids, function(item, idx, cbk) {
    console.log(`%s [INFO] id: %s, status: %s, idx: %s`, std.getTimeStamp(), item.id, item.status, idx);
    app.YHauctionItem({ appid: req.appid, auctionID: item.id }, function(err, obj, str){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        Items[item.id]={ item: obj, status: item.status };
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
    if(callback) callback(null, req, std.extend(res, { Items: Items });
  });
};

/*
 *  Get the 'YAHOO! Bids Historys',
 *  using 'YAHOO! Bids History' utility.
**/
exports.getBidHistorys = function(req, res, callback) {
  var Bids=[];
  async.forEachOf(res.Ids, function(bids,idx,cbk) {
    console.log(`%s [INFO] id: %s, status: %s, idx: %s`, std.getTimeStamp(), bids.id, bids.status, idx);
    app.YHbidHistory({ appid: req.eppid, auctionID: bids.id}, function(err, obj, str){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        Bids[bids.id]={ bids: obj, status: bids.status };
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
    if(callback) callback(null, req, std.extend(res, { Bids: Bids });
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
  async.forEachOf(res.Ids, function(id,idx,cbk) {
    if(id.status === 0) {
      where = { userid: res.userId, auctionID: id.id };
      set = {$set: {
        item:         res.Items[id.id].item
        , bids:       res.Bids[id.id].bids
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
    } else if(id.status === 1) {
      historyId = new ObjectId;
      values = {
        _id: historyId
        , userid:     res.userId
        , auctionID:  id.id
        , item:       res.Items[id.id].item
        , bids:       res.Bids[id.id].bids
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
    } else if(id.status === 2) {
      where = { userid: res.userId, auctionID: id.id };
      set = {$set: {
        item:         res.Items[id.id].item
        , bids:       res.Bids[id.id].bids
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
    if(callback) callback(null, req, std.extend(res, { historyIds: historyIds });
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
  var starred = Boolean(0);

  for(var i=0; i<res.Ids.length; i++) {
    items.push(res.Ids[i].id);
  }
  if(req.starred) starred=Boolean(1);

  where = { userid: res.userId, id: res.note.id };
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
    if(callback) callback(null, req, res);
  });
};

/*
 *  Find the 'YAHOO! Auction Items History',
 *  from 'YAHOO! Web Application' datadase.
**/
exports.findUpdateNote = function( req, res, callback){
  Note.find({ id: res.userId }).populate('historyid').exec(function (err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    var newNotes = [];
    docs.forEach(function(doc) {
      //console.log(JSON.stringify(doc, null, 4));
      newNotes.push({
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
    if(callback) callback(null, newNotes);
  });
};

