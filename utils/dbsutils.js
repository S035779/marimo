var mongoose = require('mongoose');
var async = require('async');
var std = require('../utils/stdutils');
var log = require('../utils/logutils');
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
  var username = req.body.user;
  User.findOne({ username }).exec(function(err, user) {
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
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] remove Historys done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, res);
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
  var int = req.hasOwnProperty('intvl') ? req.intvl : 24;
  var mon = req.hasOwnProperty('monit') ? req.monit : 5;
  var users = res.users;

  var int = int*1000*60*60;
  var mon = mon*1000*60;
  var date = new Date();
  var nowMon = date.getTime();
  var pstMon = date.setTime(nowMon - int)

  var notes=[];
  async.forEach(users, function(user, cbk) {
    Note.find({ 
      userid: ObjectId(user._id) 
    }).exec(function(err, docs) {
      if(err) {
        console.error(err.message);
        return cbk(err);
      }
      try {
        docs.forEach(function(doc) {
          var updated = doc.updated;
          var isMon = ((nowMon - updated) % int) < mon;
          //console.log('updated? : %d, %d, %d, %d'
          //  , updated, now, (now-updated)%int, mon);
          //console.log(isMon);
          if (isMon 
            && ((updated < nowMon) || (updated < pstMon))
          ) notes.push(doc);
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
  var int = req.hasOwnProperty('intvl') ? req.intvl : 24;
  var historyids = res.note.historyid;

  var date = new Date();
  var nowDay = date.getTime();
  var oldDay = date.setHours(date.getHours()-int);

  var historys=[];
  async.forEach(historyids, function(historyid, cbk) {
    History.find({
      _id: ObjectId(historyid)
      , updated: { $gte: oldDay, $lt: nowDay } 
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
  var maxPage = req.hasOwnProperty('pages') ? req.pages : 5;
  var query = req.hasOwnProperty('body') 
    ? req.body.body : res.note.search;
  var page = req.hasOwnProperty('body') ? 1 : maxPage;

  var c = log.counter();
  var t = log.timer();
  var m = log.heapused();
  var p = log.cpuused();

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
      opt.totalResultsAvailable/opt.totalResultsReturned); i++){
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
var getAuctionIds = function(req, res, callback) {
  var oldIds = res.note.items;
  var newIds = [];
  var Ids = [];
  var query = req.hasOwnProperty('body') 
    ? req.body.body : res.note.search;
  var historys = res.hasOwnProperty('historys')
    ? res.historys : null;

  var c = log.counter();
  var t = log.timer();
  var m = log.heapused();
  var p = log.cpuused();

  async.forEachSeries(res.pages, function(page, cbk) {
    //console.log(`%s [INFO] page: %s`
    //, std.getTimeStamp(), page);
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
    //console.dir(newIds);
    Ids = helperIds(oldIds, newIds);
    
    c.print();
    t.count();  t.print();
    m.count();  m.print();
    p.count();  p.print();

    console.log(`%s [INFO] get AuctionIDs done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, std.extend(res, { Ids }));
  });
};

var helperIds = function(o, p) {
  var ret = [];
  var n = std.and(o, p);
  n.forEach(function(id){ ret.push({ id, status: 0 }); });
  var a = std.add(o, p);
  a.forEach(function(id){ ret.push({ id, status: 1 }); });
  var d = std.del(o, p);
  d.forEach(function(id){ ret.push({ id, status: 2 }); });
  //console.dir(ret);
  return ret;
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

  var c = log.counter();
  var t = log.timer();
  var m = log.heapused();
  var p = log.cpuused();

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

  var c = log.counter();
  var t = log.timer();
  var m = log.heapused();
  var p = log.cpuused();

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
  var userid = res.note.userid;
  var noteid = ObjectId(res.note._id);
  var historyIds = res.note.historyid;
  var where = {};
  var set = {};
  var opt = {};
  var obj = {};
  async.forEach(res.Ids, function(Id, cbk) {
    obj = {
      item:      res.Items[Id.id].item
      , bids:    res.Bids[Id.id].bids
      , status:  Id.status
      , updated: Date.now()
    };
    if(Id.status === 0 || Id.status === 2) { 
      // When the status is '0:now'.
      // When the status is '2:del'.
      where = { noteid, auctionID: Id.id };
      set   = { $set: obj };
      opt   = { upsert: false, multi: true };
      History.update(where, set, opt, function(err) {
        if(err) {
          console.error(err.message);
          return cbk(err);
        }
        cbk();
      });
    } else if(Id.status === 1) { 
      // When the status is '1:add'.
      historyId = new ObjectId;
      obj = std.merge(obj, {
        _id: historyId
        , userid
        , noteid
        , auctionID: Id.id
      }); 
      historyIds.push(historyId);
      History.create(obj, function(err) {
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
 *  Update Note Object to note collection at Web Only.
 *
 * @param req {object}
 * @param res {object}
 * @param callback {function}
 */
var updateNote = function(req, res, callback) {
  var userid,id,starred,historyid,items;
  var where = {};
  var set = {};
  var opt = {};
  var obj = {};

  if (req.hasOwnProperty('body')) { 
    // isBody
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
  } else if (res.hasOwnProperty('note')) { 
    // isNote
    userid = res.note.userid;
    id = res.note.id;
  }

  if (res.hasOwnProperty('historyIds') 
    && res.hasOwnProperty('Ids')) { 
    // isItem
    historyid = res.historyIds;
    items = res.Ids.map(function(Id){ return Id.id; });
    obj = std.merge(obj, { historyid, items });
  }

  where = { userid, id };
  set   = { $set: obj };
  opt   = { upsert: false, multi: true };
  Note.update(where, set, opt, function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log(`%s [INFO] update Note done.`
      , std.getTimeStamp());
    if(callback) callback(err, req, res);
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

