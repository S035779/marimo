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
    updated:  { type: Date,     default: Date.now}
}, { collection: 'history'});
exports.History = mongoose.model('History', historySchema);

var noteSchema = new Schema({
    userid:   { type: Schema.Types.ObjectId, ref: 'User' },
    historyid:[{type: Schema.Types.ObjectId, ref: 'History'}],
    id:       { type: Number,   unique: true },
    title:      String,
    category:   String,
    search:     String,
    items:    [ String ],
    options:  { category:       Number,
                page:           Number,
                sort:           String,
                order:          String,
                store:          String,
                aucminprice:    Number,
                aucmaxprice:    Number,
                aucmin_bidorbuy_price: Number,
                aucmax_bidorbuy_price: Number,
                loc_cd:         Number,
                easypayment:    Number,
                new:            Number,
                freeshipping:   Number,
                wrappingicon:   Number,
                buynow:         Number,
                thumbnail:      Number,
                attn:           Number,
                point:          Number,
                gift_icon:      Number,
                item_status:    Number,
                offer:          Number,
                adf:            Number,
                min_charity:    Number,
                max_charity:    Number,
                min_affiliate:  Number,
                max_affiliate:  Number,
                timebuf:        Number,
                ranking:        String,
                seller:         String,
                f:              String  },
    starred:  { type: Boolean,  default: false },
    created:  { type: Date,     default: Date.now },
    updated:  { type: Date,     default: Date.now }
}, { collection: 'note'});
exports.Note = mongoose.model('Note', noteSchema);
