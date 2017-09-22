var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:  { type: String, unique: true },
    expireDay: { type: Date,   default: Date.now },
    expireFlg: { type: Boolean,default: false },
}, { collection: 'user'});
userSchema.plugin(passportLocalMongoose);
exports.User = mongoose.model('User', userSchema);

var historySchema = new Schema({
    userid:   { type: Schema.Types.ObjectId, ref: 'User' },
    noteid:   { type: Schema.Types.ObjectId, ref: 'Note' },
    auctionID:  String,
    item:     { auctionID:              String,
                request:                String,
                head:                   Object,
                status:                 Number,
                body:                   Object  },
    bids:     { auctionID:              String,
                request:                String,
                head:                   Object,
                status:                 Number,
                body:                   Object  },
    status:     Number,
    updated:  { type: Date,     default: Date.now }
}, { collection: 'history'});
exports.History = mongoose.model('History', historySchema);

var noteSchema = new Schema({
  userid:     { type: Schema.Types.ObjectId, ref: 'User'        }
  , historyid:[{type: Schema.Types.ObjectId, ref: 'History'    }]
  , id:       { type: Number, unique: true }
  , title:      String
  , category:   String
  , search:     String
  , items:    [ String ]
  , options:  { searchString: { type: String,   default: ''     }
              , highestPrice: { type: String,   default: ''     }
              , lowestPrice:  { type: String,   default: ''     }
              , bids:         { type: Boolean,  default: false  }
              , condition:    { type: String,   default: 'all'  }
              , status:       { type: Boolean,  default: false  }
              , AuctionID:    [ String ]
              , categoryPath: [ String ]
              , seller:       [ String ] }
  , starred:  { type: Boolean,  default: false    }
  , created:  { type: Date,     default: Date.now }
  , updated:  { type: Date,     default: Date.now }
}, { collection: 'note'});
exports.Note = mongoose.model('Note', noteSchema);
