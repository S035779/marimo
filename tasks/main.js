var async = require('async');
var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var app = require('../utils/apputils');

// Mongoose Schema
var Schema = mongoose.Schema;

//Query Execution`
var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;
var ObjectId = mongoose.Types.ObjectId;

// DB Connection
mongoose.connect(process.env.mongodb);
mongoose.connection.on('error', function () {
    console.error('connection error', arguments);
});
mongoose.connection.once('open', function() {
    console.log('\n===========');
    console.log('    mongoose version: %s', mongoose.version);
    console.log('========\n\n');
});

/*
 *  First set 'YAHOO! Web Service's Application ID' & initial values.
**/
var appid = process.env.app_id;
var username = 'test';
var key = 81748924;

/*
 * Find User Object from user collection.
**/
var findUser = function(callback) {
  User.findOne({ username: username })
  .exec(function(err, user) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(user);
    console.log('find user object done.')
    callback(null, user);
  });
};


/*
 * Find Note Object from note collection.
**/
var findNote = function(user, callback) {
  var userId = ObjectId(user._id);
  Note.findOne({userid: userId, id: key })
  .exec(function (err, note) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    //console.log(note);
    console.log('find note object done.')
    if(callback) callback(null, note);
  });
};

/*
 *  Get the 'YAHOO! Search Pages',
 *  using 'YAHOO! Search' utility.
**/
var getResultSet = function(note, callback) {
  app.YHsearch({ appid: appid, query: note.search }, function(err, ids, obj, str, opt){
    if (err) {
      console.error(err.message);
      throw err;
    }
    var pages=[];
    for(var i=0; i<Math.ceil(opt.resAvailable / opt.resReturned); i++){
      pages[i]=i+1;
    }
    console.log(`Number of pages : %s`, pages.length);
    console.log(`Avail: %s, Return: %s, position: %s`, opt.resAvailable, opt.resReturned, opt.resPosition)
    console.log('get getResultSet done.')
    if(callback) callback(null, pages, note);
  });
};

/*
 *  Get the 'YAHOO! Auction IDs',
 *  using 'YAHOO! Search' utility.
**/
var getIds = function( pages, note, callback) {
  var oldIds = note.items;
  var newIds=[];
  var Ids = [];
  async.forEachOf(pages, function(page, idx, cbk) {
    console.log(`page: %s, idx: %s`, page, idx);
    app.YHsearch({ appid: appid, query: note.search, page: page }, function(err, ids, obj, str, opt){
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
    console.log('get NewIds done.')
    if(callback) callback(null, Ids, note);
  });
};

/*
 *  Get the 'YAHOO! Auction Items',
 *  using 'YAHOO! Auction item' utility.
**/
var getAuctionItems = function(Ids, note, callback) {
  var Items=[];
  async.forEachOf(Ids, function(item, idx, cbk) {
    console.log(`id: %s, status: %s, idx: %s`, item.id, item.status, idx);
    app.YHauctionItem({ appid: appid, auctionID: item.id }, function(err, obj, str, opt){
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
    console.log('get AuctionItems done.')
    if(callback) callback(null, Items, Ids, note);
  });
};

/*
 *  Get the 'YAHOO! Bids Historys',
 *  using 'YAHOO! Bids History' utility.
**/
var getBidHistorys = function(Items, Ids, note, callback) {
  var Bids=[];
  async.forEachOf(Ids, function(bids,idx,cbk) {
    console.log(`id: %s, status: %s, idx: %s`, bids.id, bids.status, idx);
    app.YHbidHistory({ appid: appid, auctionID: bids.id}, function(err, obj, str, opt){
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
    console.log('get BidsHistorys done.');
    if(callback) callback(null, Bids, Items, Ids, note);
  });
};

/*
 *  Update 'YAHOO! Auction Items History',
 *  to 'YAHOO! Web Application' datadase.
**/
var updateHistory = function(Bids, Items, Ids, note, callback) {
  var where = {};
  var values = {};
  var set = {};
  var opt = {};
  var historyIds = note.historyid;
  async.forEachOf(Ids, function(id,idx,cbk) {
    if(id.status === 0) {
      history = { userid: note.userid, auctionID: id.id };
      set = {$set: {
        item:         Items[id.id].item
        , bids:       Bids[id.id].bids
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
      historyId = [new ObjectId];
      values = {
        _id: historyId
        , userid:     note.userid
        , auctionID:  id.id
        , item:       Items[id.id].item
        , bids:       Bids[id.id].bids
        , status:     1
        , updated: Date.now()
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
      where = { userid: note.userid, auctionID: id.id };
      set = {$set: {
        item:         Items[id.id].item
        , bids:       Bids[id.id].bids
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
    } else {
      cbk();
    }
  },function(err) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log('update history done.');
    if(callback) callback(null, historyIds, Ids, note);
  });
};

/*
 *  Update the 'YAHOO! Auction Items History',
 *  to 'YAHOO! Web Application' datadase.
**/
var updateNote = function( historyIds, Ids, note, callback) {
  var where = {};
  var set = {};
  var opt = {};
  var items = [];
  for(var i=0; i<Ids.length; i++) {
    items.push(Ids[i].id);
    console.dir(Ids[i].id);
  }
  where = { userid: note.userid, id: note.id };
  set = {$set: {
    historyid:  historyIds
    , items:    items }};
  opt = { upsert: false, multi: true };
  Note.update(where, set, opt, function(err, docs) {
    if(err) {
      console.error(err.message);
      throw err;
    }
    console.log('update note done');
    if(callback) callback(null, note);
  });
};

/*
 *  Find the 'YAHOO! Auction Items History',
 *  from 'YAHOO! Web Application' datadase.
**/
var findUpdateNote = function(note, callback){
  User.findOne({userid: note.userid})
  .then(function(user){
    Note.find({ id: note.id }).populate('historyid').exec(function (err, docs) {
      if(err) {
        console.error(err.message);
        throw err;
      }
      docs.forEach(function(doc) {
        console.log(JSON.stringify(doc, null, 4));
      });
      console.log('find notes done');
      if(callback) callback(null);
    });
  });
};

/*
 *  main function.
**/
mongoose.connection.on('open', function () {
  async.waterfall(
    [
      findUser
      , findNote
      , getResultSet
      , getIds
      , getAuctionItems
      , getBidHistorys
      , updateHistory
      , updateNote
      , findUpdateNote
    ], function(err, results) {
      if (err) {
        console.error(err.stack);
        throw err;
      }
      console.log('all done.');
      mongoose.connection.close();
    }
  );
});
