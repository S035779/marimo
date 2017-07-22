var xml = require('xml2js');
var std = require('../utils/stdutils');
var enc = require('../utils/encutils');
var http = require('../utils/netutils');

// YAHOO! Auction WebAPI
var v1 = 'https://auctions.yahooapis.jp/AuctionWebService/V1/'
var v2 = 'https://auctions.yahooapis.jp/AuctionWebService/V2/'

/*
 * get result of the 'YAHOO! Search'.
 * options : { appid: String, query: String, page: Integer }
**/
exports.YHsearch = function(options, callback) {
    var uri = v2 + 'search?' + enc.encodeFormData(options);
    http.get(uri, function(stat, head, body) {
        var ids = [];
        var str = [];
        //var opt = {};
        var head = {
          search: options.query
          , page: options.page
          , request: uri
          , status: stat
          , header: head };
        xml.parseString(body,
         { attrkey: 'root', charkey: 'sub', trim: true, explicitArray: false },
          function(err, result) {
            if (err) {
                console.error(err.message);
                throw err;
            }
            var obj = std.merge(head, { body: result });
            //console.dir(obj,{showHidden: false, depth: 10, colors: true});
            str=JSON.stringify(obj);

            //opt.resAvailable = obj.body.ResultSet.root.totalResultsAvailable;
            //opt.resReturned = obj.body.ResultSet.root.totalResultsReturned;
            //opt.resPosition = obj.body.ResultSet.root.firstResultPosition;
            var len = obj.body.ResultSet.Result ? obj.body.ResultSet.Result.Item.length : 0;;
            if(len) {
              obj.body.ResultSet.Result.Item.forEach(function(obj, idx, arr) {
                //console.dir(std.keys(obj),{showHidden: false, depth: 10, colors: true});
                ids[idx] = obj.AuctionID;
              });
            }
            if(callback) callback(err, ids, obj, str);
        });
    });
};

/*
 *  get result of the 'YAHOO! Auction item'.
 *  options : { appid: String, auctionID: String }
**/
exports.YHauctionItem = function(options, callback) {
    var uri = v2 + 'auctionItem?' + enc.encodeFormData(options);
    http.get(uri, function(stat, head, body) {
        var str = [];
        //var opt = {};
        var head = {
          auctionID: options.auctionID
          , request: uri
          , status: stat
          , header: head
        };
        xml.parseString(body,
         { attrkey: 'root', charkey: 'sub', trim: true, explicitArray: false },
          function(err, result) {
            if (err) {
                console.error(err.message);
                throw err;
            }
            var obj = std.merge(head, { body: result });
            //console.dir(obj,{showHidden: false, depth: 10, colors: true});
            str=JSON.stringify(obj);

            //opt.resAvailable = obj.body.ResultSet.root.totalResultsAvailable;
            //opt.resReturned = obj.body.ResultSet.root.totalResultsReturned;
            //opt.resPosition = obj.body.ResultSet.root.firstResultPosition;
            if(callback) callback(err, obj, str);
        });
    });
};

/*
 * get result of the 'YAHOO! Bids History'.
 * options : { appid: String, auctionID: String }
**/
exports.YHbidHistory = function(options, callback) {
    var uri = v1 + 'BidHistory?' + enc.encodeFormData(options);
    http.get(uri, function(stat, head, body) {
        var str = [];
        //var opt = {};
        var head = {
          auctionID: options.auctionID
          , request: uri
          , status: stat
          , header: head };
        xml.parseString(body,
         { attrkey: 'root', charkey: 'sub', trim: true, explicitArray: false },
          function(err, result) {
            if (err) {
                console.error(err.message);
                throw err;
            }
            var obj = std.merge(head, { body: result });
            //console.dir(obj,{showHidden: false, depth: 10, colors: true});
            str=JSON.stringify(obj);

            //opt.resAvailable = obj.body.ResultSet.root.totalResultsAvailable;
            //opt.resReturned = obj.body.ResultSet.root.totalResultsReturned;
            //opt.resPosition = obj.body.ResultSet.root.firstResultPosition;
            if(callback) callback(err, obj, str);
        });
    });
};
