var fs = require('fs');
var path = require('path');
var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');

//var e = require('../utils/encutils');
var app = require('../utils/apputils');
var std = require('../utils/stdutils');

var User = require('../models/models').User;
var Note = require('../models/models').Note;
var History = require('../models/models').History;
var ObjectId = mongoose.Types.ObjectId;

/*
 *  First set 'YAHOO! Web Service's Application ID' & initial values.
**/
var appid = process.env.app_id;

var TEST_FILE = path.join(__dirname, 'note.json');

var router = express.Router();

// passport start.
router.get('/auth', function(request, response, next) {
  response.render('index.jade', { user: request.user });
});

router.get('/register', function(request, response) {
  response.render('register.jade', { });
});

router.post('/register', function(request, response) {
  User.register(
    new User({ username : request.body.username }),
    request.body.password, function(err, account) {
        if (err) { return response.render('register', { account : account }); }
        passport.authenticate('local')(request, response, function () {
          response.redirect('/auth'); });
    });
});

router.get('/login', function(request, response) {
  response.render('login.jade', { user : request.user });
});

router.post('/login', passport.authenticate('local'), function(request, response) {
  response.redirect('/auth');
});

router.get('/logout', function(request, response) {
  request.logout();
  response.redirect('/auth');
});
// passport end.

// File version start.
router.get('/api/ping', function(request, response){
  response.status(200).send("pong!");
});

router.get('/api/file', function(request, response) {
  fs.readFile(TEST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var notes = JSON.parse(data);
    var newNotes=[];
    //console.log(request.body);
    notes.forEach(function(value){
      //console.log(`%s  :  %s`,request.body.id,value.id);
      if( value.user === request.query.user ) {
       newNotes.push(value);
      }
    },this);
    response.json(newNotes);
  });
});

router.post('/api/file/update', function(request, response) {
  fs.readFile(TEST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var notes = JSON.parse(data);
    var starred=Boolean(0);
    if (request.body.starred === 'true') starred=Boolean(1);
    var addNote = {
      id: Number(request.body.id),
      user: request.body.user,
      title: request.body.title,
      body: request.body.body,
      starred: starred,
      updated: request.body.updated
    };
    var newNotes=[];
    notes.forEach(function(value){
      //console.log(`%s  :  %s`,request.body.id,value.id);
      if( value.id !== Number(request.body.id) ) {
       newNotes.push(value);
      }  
    },this);
    newNotes.push(addNote);
    fs.writeFile(TEST_FILE, JSON.stringify(newNotes, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      response.json(newNotes);
    });
  });
});

router.post('/api/file/create', function(request, response) {
  fs.readFile(TEST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var notes = JSON.parse(data);
    var starred=Boolean(0);
    if (request.body.starred === 'true') starred=Boolean(1);
    var addNote = {
      id: Number(request.body.id),
      user: request.body.user,
      title: request.body.title,
      body: request.body.body,
      starred: starred,
      updated: request.body.updated
    };
    var newNotes=[];
    for(var i=0;i<notes.length;i++)  newNotes[i]=notes[i];
    newNotes.push(addNote);
    fs.writeFile(TEST_FILE, JSON.stringify(newNotes, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      response.json(newNotes);
    });
  });
});

router.post('/api/file/delete', function(request, response) {
  fs.readFile(TEST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var notes = JSON.parse(data);
    var newNotes=[];
    //console.log(request.body);
    notes.forEach(function(value){
      //console.log(`%s  :  %s`,request.body.id,value.id);
      if( value.id !== Number(request.body.id) ) {
       newNotes.push(value);
      }  
    },this);
    fs.writeFile(TEST_FILE, JSON.stringify(newNotes, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      response.json(newNotes);
    });
  });
});
// File version end.

// DB version start.
router.get('/api/note', function(request, response){
  console.log('%s [INFO] ===getNotes===', std.getTimeStamp());
  var username = request.query.user;
  User.findOne({ username: username}).then(function(user) {
    Note.find({userid: ObjectId(user._id)}).populate('historyid').exec(function (err, notes) {
      if (err) response.status(404).send(err.message);
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
      console.log('all done.');
    });
  });
});

router.post('/api/note', function(request, response){
  console.log('%s [INFO] ===postNote===', std.getTimeStamp());
  var username = request.body.user;
  var key = request.body.id;
  async.waterfall( // async start.
    [
      function(callback) {
        User.findOne({ username: username })
        .exec(function(err, user) {
          if (err) {
            console.error(err.message);
            throw err;
          }
          //console.log(user);
          var userId = ObjectId(user._id);
          console.log('find user object done.');
          callback(null, userId);
        });
      }, function(userId, callback) {
        //console.log(`starredNote : userid=%s`, userId);
        //console.log(`starredId : id=%s`,key);
        var where = {};
        var set = {};
        var opt = {};
        var starred = Boolean(0);

        if(request.body.starred) starred=Boolean(1);
        where = { userid: userId, id: key };
        set = {$set: {
          title:      request.body.title
          , category: request.body.category
          , search:   request.body.body
          , starred:  starred
          , updated:  request.body.updated
        }};
        opt = { upsert: false, multi: true };
        Note.update(where, set, opt, function(err, docs) {
          if (err) {
            console.error(err.message);
            throw err;
          }
          console.log('update note done.');
          if(callback) callback(null, userId);
        });
      }, function(userId, callback) {
        console.log(`findNotes : userid=%s`, userId);
        Note.find({userid: userId}).populate('historyid').exec(function (err, docs) {
          if (err) {
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
              , items:    doc.hostoryid
              , updated:  doc.updated
            });
          });
          response.json(newNotes); 
          console.log('find notes done.');
          if(callback) callback(null);
        });
      }
    ], function(err, result) {
      if (err) response.status(404).send(err.message);
      console.log('all done.');
    }
  );
});

router.post('/api/note/search', function(request, response){
  console.log('%s [INFO] ===searchNote===', std.getTimeStamp());
  var username = request.body.user;
  var key = request.body.id;
  var query = request.body.body;
  async.waterfall( // async start.
    [
      function(callback) {
        User.findOne({ username: username })
        .exec(function(err, user) {
          if (err) {
            console.error(err.message);
            throw err;
          }
          //console.log(user);
          var userId = ObjectId(user._id);
          console.log('find user object done.')
          callback(null, userId);
        });
      },function(userId, callback) {
        Note.findOne({userid: userId, id: key })
        .exec(function (err, note) {
          if (err) {
            console.error(err.message);
            throw err;
          }
          //console.log(note);
          console.log('find note object done.')
          if(callback) callback(null, note, userId);
        });
      },function(note, userId, callback) {
        app.YHsearch({ appid: appid, query: query, sort: 'bids', order: 'a' },
         function(err, ids, obj, str, opt){
          if (err) {
            console.error(err.message);
            throw err;
          }
          var pages=[];
          var page = Math.ceil(opt.resAvailable / opt.resReturned);
          //var page = 1;
          for(var i=0; i<page; i++){
            pages[i]=i+1;
          }
          console.log(`Number of pages : %s`, pages.length);
          console.log(`Avail: %s, Return: %s, position: %s`, opt.resAvailable, opt.resReturned, opt.resPosition)
          console.log('get getResultSet done.')
          if(callback) callback(null, pages, note, userId);
        });
      },function( pages, note, userId, callback) {
        var oldIds = note.items;
        var newIds=[];
        var Ids = [];
        async.forEachOf(pages, function(page, idx, cbk) {
          console.log(`page: %s, idx: %s`, page, idx);
          app.YHsearch({ appid: appid, query: query, sort: 'bids', order: 'a', page: page },
           function(err, ids, obj, str, opt){
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
          console.dir(Ids);
          console.log('get NewIds done.')
          if(callback) callback(null, Ids, note, userId);
        });
      },function(Ids, note, userId, callback) {
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
          if(callback) callback(null, Items, Ids, note, userId);
        });
      },function(Items, Ids, note, userId, callback) {
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
          if(callback) callback(null, Bids, Items, Ids, note, userId);
        });
      },function(Bids, Items, Ids, note, userId, callback) {
        var where = {};
        var values = {};
        var set = {};
        var opt = {};
        var historyIds = note.historyid;
        async.forEachOf(Ids, function(id,idx,cbk) {
          if(id.status === 0) {
            where = { userid: userId, auctionID: id.id };
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
            historyId = new ObjectId;
            values = {
              _id: historyId
              , userid:     userId
              , auctionID:  id.id
              , item:       Items[id.id].item
              , bids:       Bids[id.id].bids
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
            where = { userid: userId, auctionID: id.id };
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
          }
        },function(err) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          console.log('update history done.');
          if(callback) callback(null, historyIds, Ids, note, userId);
        });
      },function( historyIds, Ids, note, userId, callback) {
        var where = {};
        var set = {};
        var opt = {};
        var items = [];
        var starred=Boolean(0);

        for(var i=0; i<Ids.length; i++) {
          items.push(Ids[i].id);
        }
        console.log('================================');
        console.dir(items);
        console.log('================================');
        if(request.body.starred)   starred=Boolean(1);

        where = { userid: userId, id: note.id };
        set = {$set: {
          title:        request.body.title
          , category:   request.body.category
          , search:     request.body.body
          , starred:    starred
          , updated:    request.body.updated
          , historyid:  historyIds
          , items:      items
        }};
        opt = { upsert: false, multi: true };
        Note.update(where, set, opt, function(err, docs) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          console.log('update note done');
          if(callback) callback(null, note, userId);
        });
      },function(note, userId, callback){
        Note.find({ userid: userId }).populate('historyid').exec(function (err, docs) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          var newNotes = [];
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
          //console.log(JSON.stringify(newNotes, null, 4));
          console.log('find notes done.');
          if(callback) callback(null);
        });
      }
    ], function(err, results) {
      if (err) response.status(404).send(err.message);
      console.log('all done.');
    }
  );
});

router.post('/api/note/delete', function(request, response){
  console.log('%s [INFO] ===deleteNote===', std.getTimeStamp());
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
          console.log('find user object done.');
          if(callback) callback(null, userId);
        });
      }, function(userId, callback) {
        console.log(`deleteNote : userid=%s`, userId);
        console.log(`deleteId : id=%s`,key);
        var note = { 
          userid: userId
          , id:   key
        };
        Note.remove(note, function(err, docs) {
          if(err) {
            console.error(err.message);
            throw err;
          }
          console.log('delete note done.');
          if(callback) callback(null, userId);
        });
      }, function(userId, callback) {
        console.log(`findNotes : userid=%s`, userId);
        Note.find({userid: userId}).populate('historyid').exec(function (err, notes) {
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
          console.log('find note done.');
          if(callback) callback(null);
        });
      }
    ], function(err, result) {
      if (err) response.status(404).send(err.message);
      console.log('all done.');
    }
  ); // async end.
});

router.post('/api/note/create', function(request, response) {
  console.log('%s [INFO] ===createNote===', std.getTimeStamp());
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
          callback(null, userId);
        });
        console.log('find user object done.');
      },
      function(userId, callback) {
        console.log(`createNotes : userid=%s`, userId);
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
        console.log('create note done.');
      },
      function(userId, callback) {
        console.log(`findNotes : userid=%s`, userId);
        Note.find({userid: userId}).populate('historyid').exec(function (err, docs) {
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
          console.log('find notes done.');
          callback(null);
        });
      }
    ],
    function(err, result) {
      if (err) response.status(404).send(err.message);
      console.log('all done.');
    }
  ); // async end.
});
// DB version end.

module.exports = router;
