var mongoose = require('mongoose');
var async = require('async');
var std = require('../utils/stdutils');
var app = require('../utils/apputils');
var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;

var ObjectId = mongoose.Types.ObjectId;

/**
 * Find User Object from user collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findUser = function(req, res, callback) {
  User.findOne({ 
    username: req.body.user 
  }).exec(function(err, user) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(user);
    console.log(`%s [INFO] find User done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { user }));
  });
};
module.exports.findUser = findUser;

/**
 * Get Notes Object from note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getNotes = function(req, res, callback){
  Note.find({ 
    userid: ObjectId(res.user._id) 
  }).populate('historyid').exec(function (err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    var newNotes = [];
    docs.forEach(function(doc) {
      //console.log(JSON.stringify(doc, null, 4));
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
    console.log(`%s [INFO] get Notes done.`, std.getTimeStamp());
    if(callback) 
      callback(err, req, std.extend(res, { newNotes }));
  });
};
module.exports.getNotes = getNotes;

/**
 * Find Note Object from note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var findNote = function(req, res, callback) {
  Note.findOne({ 
    userid: ObjectId(res.user._id)
    , id:   req.body.id
  }).exec(function (err, note) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(note);
    console.log(`%s [INFO] find Note done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { note }));
  });
};
module.exports.findNote = findNote;

/**
 * Remove Note Object from note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var removeNote = function(req, res, callback) {
  Note.remove({
    userid: ObjectId(res.user._id)
    , id: req.body.id
  }, function(err) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] remove Note done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, res);
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
      console.error(err.message);
      throw err;
    }
    if(callback) callback(err, req, res);
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
      console.error(err.message);
      throw err;
    }
    var users=[];
    docs.forEach(function(doc) {
      users.push(doc);
    });
    //console.log(users);
    console.log(`%s [INFO] find Users done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { users }));
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
  var notes=[];
  async.forEach(res.users, function(user, cbk) {
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
    console.log(`%s [INFO] find Notes done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { notes }));
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
  var historys=[];
  async.forEach(res.note.historyid, function(historyid, cbk) {
    History.find({ 
      _id: ObjectId(historyid) 
    }).exec(function(err, docs) {
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
    console.log(`%s [INFO] find Historys done.`
      , std.getTimeStamp());
    if(callback) 
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
  var query = req.hasOwnProperty('body') 
    ? req.body.body : res.note.search;
  var page = req.hasOwnProperty('body') ? 1 : 5;

  var c = std.counter();
  var t = std.timer();
  var m = std.heapused();
  var p = std.cpuused();

  app.YHsearch({ 
    appid:    req.appid
    , query
    , sort:   'bids'
    , order:  'a' 
  }, function(err, ids, obj){
    if (err) {
      console.error(err.message);
      throw err;
    }
    var opt = obj.body.ResultSet.root;
    var pages = [];
    for(var i=0; i<Math.ceil(
      opt.totalResultsAvailable / opt.totalResultsReturned); i++){
      if(i>=page) break;
      pages[i]=i+1;
    }
    //console.log(`%s [INFO] Number of pages : %s`
    //  , std.getTimeStamp(), pages.length);
    //console.log(`%s [INFO] Avail: %s, Return: %s, position: %s`
    //  , std.getTimeStamp()
    //  , opt.totalResultsAvailable
    //  , opt.totalResultsReturned
    //  , opt.firstResultPosition
    //);
    
    c.count();  c.print();
    t.count();  t.print();
    m.count();  m.print();
    p.count();  p.print();

    console.log(`%s [INFO] get ResultSet done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { pages }));
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
var getAuctionIds = function( req, res, callback) {
  var oldIds = res.note.items;
  var newIds = [];
  var Ids = [];
  var query = req.hasOwnProperty('body') 
    ? req.body.body : res.note.search;
  var historys = (res.historys !== undefined)
    ? res.history : null;

  var c = std.counter();
  var t = std.timer();
  var m = std.heapused();
  var p = std.cpuused();

  async.forEachSeries(res.pages, function(page, cbk) {
    //console.log(`%s [INFO] page: %s, std.getTimeStamp(), page);
    app.YHsearch({ 
      appid:    req.appid
      , query
      , sort:   'bids'
      , order:  'a'
      , page:   page 
    }, function(err, ids, obj){
      if (err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        if (ids.length > 0) newIds=newIds.concat(ids);
        //console.dir(ids);
      } catch(e) {
        return cbk(e);
      }
      c.count();
      cbk();
    });
  }, function(err) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.dir(oldIds);
    //console.dir(newIds);
    var nowIds = std.and(oldIds, newIds);
    var addIds = std.add(oldIds, newIds);
    var delIds = std.del(oldIds, newIds);
    var date = new Date();
    var nowDay = date.getTime();
    var oldDay = date.setDate(date.getDate()-1);
    nowIds.forEach(function(id){
      Ids.push({ id, status: 0, updated: nowDay });
    });
    addIds.forEach(function(id){
      Ids.push({ id, status: 1, updated: nowDay });
    });
    delIds.forEach(function(id){
      if( historys && historys[id].updated > oldDay) {
        Ids.push({ id, status: 2
          , updated: res.historys[id].updated });
      }
    });
    //console.log('now: %d(msec), old: %d(msec), int: %d(msec)'
    //  , nowDay, oldDay, (nowDay-oldDay));
    //console.dir(Ids);
    
    c.print();
    t.count();  t.print();
    m.count();  m.print();
    p.count();  p.print();

    console.log(`%s [INFO] get AuctionIDs done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Ids }));
  });
};
module.exports.getAuctionIds = getAuctionIds;

/**
 * Get the 'YAHOO! Auction Items', 
 * using 'YAHOO! Auction item' utility.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var getAuctionItems = function(req, res, callback) {
  var Items=[];

  var c = std.counter();
  var t = std.timer();
  var m = std.heapused();
  var p = std.cpuused();

  async.forEachSeries(res.Ids, function(Id, cbk) {
    //console.log(`%s [INFO] auction_id: %s, status: %s`
    //  , std.getTimeStamp()
    //  , Id.id
    //  , Id.status
    //);
    app.YHauctionItem({ appid: req.appid, auctionID: Id.id }
    , function(err, obj){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      Items[Id.id]={ item: obj, status: Id.status };
      //console.dir(Items[Id.id]);
      c.count();
      cbk();
    });
  }, function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    //console.dir(Items);
    
    c.print();
    t.count();  t.print();
    m.count();  m.print();
    p.count();  p.print();

    console.log(`%s [INFO] get AuctionItems done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Items }));
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
  var Bids=[];

  var c = std.counter();
  var t = std.timer();
  var m = std.heapused();
  var p = std.cpuused();

  async.forEachSeries(res.Ids, function(Id, cbk) {
    //console.log(`%s [INFO] auction_id: %s, status: %s`
    //  , std.getTimeStamp()
    //  , Id.id
    //  , Id.status
    //);
    app.YHbidHistory({ appid: req.appid, auctionID: Id.id }
    , function(err, obj){
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      Bids[Id.id]={ bids: obj, status: Id.status };
      //console.dir(Bids[Id.id]);
      c.count();
      cbk();
    });
  },function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    //console.dir(Bids);
    
    c.print();
    t.count();  t.print();
    m.count();  m.print();
    p.count();  p.print();

    console.log(`%s [INFO] get BidsHistorys done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Bids }));
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
  var where = {};
  var values = {};
  var set = {};
  var opt = {};
  var historyIds = res.note.historyid;
  async.forEach(res.Ids, function(Id, cbk) {
    if(Id.status === 0) { // When the status is '0:now'.
      where = { userid: res.note.userid, auctionID: Id.id };
      set = {$set: {
        item:         res.Items[Id.id].item
        , bids:       res.Bids[Id.id].bids
        , status:     Id.status
        , updated:    Id.updated
      }};
      opt = { upsert: false, multi: true };
      History.update(where, set, opt, function(err, docs) {
        if(err) {
          console.error(err.message);
          return cbk(err);
        }
        cbk();
      });
    } else if(Id.status === 1) { // When the status is '1:add'.
      historyId = new ObjectId;
      values = {
        _id: historyId
        , userid:     res.note.userid
        , auctionID:  Id.id
        , item:       res.Items[Id.id].item
        , bids:       res.Bids[Id.id].bids
        , status:     Id.status
        , updated:    Id.updated
      }; 
      historyIds.push(historyId);
      History.create(values, function(err, docs) {
        if(err) {
          console.error(err.message);
          return cbk(err);
        }
        cbk();
      });
    } else if(Id.status === 2) { // When the status is '2:del'.
      where = { userid: res.note.userid, auctionID: Id.id };
      set = {$set: {
        item:         res.Items[Id.id].item
        , bids:       res.Bids[Id.id].bids
        , status:     Id.status
        , updated:    Id.updated
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
  }, function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] update Historys done.`
      , std.getTimeStamp());
    if(callback) 
      callback(err, req, std.extend(res, { historyIds }));
  });
};
module.exports.updateHistorys = updateHistorys;

/**
 * Update Note Object to note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var updateNote = function( req, res, callback) {
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
    console.log(`%s [INFO] update Note done`
      , std.getTimeStamp());
    if(callback) callback(err, req, res);
  });
};
module.exports.updateNote = updateNote;

/**
 *  Post Note Object to note collection.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var postNote = function(req, res, callback) {
  var userid = req.hasOwnProperty('note') 
    ? res.note.userid : ObjectId(res.user._id);
  var id = req.hasOwnProperty('note') 
    ? res.note.id : req.body.id;
  var starred = req.body.starred 
    ? Boolean(1) : Boolean(0);
  var historyid = res.hasOwnProperty('historyIds') 
    ? res.historyIds : null;
  var items = res.hasOwnProperty('Ids') 
    ? function() { 
      var array = [];
      res.Ids.forEach(function(Id){ array.push(Id.id); });
      return array; } 
    : null;

  var where = { userid, id };
  var set = (historyid && items) 
    ? {$set: {
        title:        req.body.title
        , category:   req.body.category
        , search:     req.body.body
        , starred:    starred
        , updated:    req.body.updated
        , historyid
        , items
      }}
    : {$set: {
        title:        req.body.title
        , category:   req.body.category
        , search:     req.body.body
        , starred:    starred
        , updated:    req.body.updated
      }};
  var opt = { upsert: false, multi: true };
  Note.update(where, set, opt, function(err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] post Note done.`, std.getTimeStamp());
    if(callback) callback(err, req, res);
  });
};
module.exports.postNote = postNote;

