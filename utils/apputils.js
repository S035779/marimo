var xml = require('xml2js');
var std = require('../utils/stdutils');
var enc = require('../utils/encutils');
var htp = require('../utils/netutils');

// YAHOO! Auction WebAPI.
var v1 = 'htps://auctions.yahooapis.jp/AuctionWebService/V1/'
var v2 = 'htps://auctions.yahooapis.jp/AuctionWebService/V2/'

/**
 * get result of the 'YAHOO! Search'.
 * options : { appid: String, query: String, page: Integer }
 *
 * @param options {object}
 * @param callback {function}
 */
var YHsearch = function(options, callback) {
  var uri = v2 + 'search?' + enc.encodeFormData(options);
  htp.get(uri, function(stat, head, body) {
    var head = { 
      search: options.query
      , page: options.page
      , request: uri
      , status: stat
      , header: head };

    xml.parseString( body
      , { attrkey: 'root'
        , charkey: 'sub'
        , trim: true
        , explicitArray: false }
      , function(err, result) {
      if (err) {
          logs.error(err.message);
          throw err;
      }

      var obj = std.merge(head, { body: result });
      var str = JSON.stringify(obj);
      var ids = [];
      if (obj.body.hasOwnProperty('ResultSet')) {
        var set = obj.body.ResultSet;
        if (set.Result !== undefined
          && set.Result.hasOwnProperty('Item')) {
          if (Array.isArray(set.Result.Item)) { 
            set.Result.Item.forEach(function(item){
              ids.push(item.AuctionID);
            });
          } else {
            ids.push(set.Result.Item.AuctionID);  
          }
        }
      } else if (obj.body.hasOwnProperty('Error')) {
        logs.error(YHerror(obj));
      }

      if(callback) callback(err, ids, obj, str);
    });
  });
};
module.exports.YHsearch = YHsearch;

/**
 *  get result of the 'YAHOO! Auction item'.
 *  options : { appid: String, auctionID: String }
 *
 * @param options {object}
 * @param callback {function}
 */
var YHauctionItem = function(options, callback) {
  var uri = v2 + 'auctionItem?' + enc.encodeFormData(options);
  htp.get(uri, function(stat, head, body) {
    var head = { auctionID: options.auctionID
      , request: uri
      , status: stat
      , header: head };

    xml.parseString( body
      , { attrkey: 'root'
        , charkey: 'sub'
        , trim: true
        , explicitArray: false } 
      , function(err, result) {
      if (err) {
          logs.error(err.message);
          throw err;
      }

      var obj = std.merge(head, { body: result });
      var str = JSON.stringify(obj);
      if(obj.body.hasOwnProperty('Error')) {
        logs.error(YHerror(obj));
      }

      if(callback) callback(err, obj, str);
    });
  });
};
module.exports.YHauctionItem = YHauctionItem;

/**
 * get result of the 'YAHOO! Bids History'.
 * options : { appid: String, auctionID: String }
 *
 * @param options {object}
 * @param callback {function}
 */
var YHbidHistory = function(options, callback) {
  var uri = v1 + 'BidHistory?' + enc.encodeFormData(options);
  htp.get(uri, function(stat, head, body) {
    var head = { 
      auctionID: options.auctionID
      , request: uri
      , status: stat
      , header: head };

    xml.parseString( body
      , { attrkey: 'root'
        , charkey: 'sub'
        , trim: true
        , explicitArray: false }
      , function(err, result) {
      if (err) {
          logs.error(err.message);
          throw err;
      }

      var obj = std.merge(head, { body: result });
      var str = JSON.stringify(obj);
      if(obj.body.hasOwnProperty('Error')) {
        logs.error(YHerror(obj));
      }

      if(callback) callback(err, obj, str);
    });
  });
};
module.exports.YHbidHistory = YHbidHistory;

/**
 * YAHOO! WebAPI ERROR Code
 *
 * @param obj {object}
 * @return {string}
 */
function YHerror(obj) {
  var err = [];
  err[400] = { 
    code: 400, 
    message: 'Bad request.', 
    description: '渡されたパラメータがWeb APIで期待されたものと一致しない場合に返されます。このメッセージは何が間違っているか、何が正しくないかを伝えます。' 
  };
  err[401] = { 
    code: 401, 
    message: 'Unauthorized.', 
    description: '許可されていないアクセスであった場合に返されます。' 
  };
  err[403] = { 
    code: 403, 
    message: 'Forbidden.', 
    description: 'リソースへのアクセスを許されていないか、利用制限を超えている場合に適用されます。アプリケーションIDが削除された場合にも返されます。' 
  };
  err[404] = { 
    code: 404, 
    message: 'Not Found.', 
    description: '指定されたリソースが見つからない場合に返されます。' 
  };
  err[500] = { 
    code: 500, 
    message: 'Internal Server Error.', 
    description: '内部的な問題によってデータを返すことができない場合に返されます。' 
  };
  err[503] = { 
    code: 503, 
    message: 'Service unavailable.', 
    description: '内部的な問題によってデータを返すことができない場合に返されます。' 
  };

  return ('Yahoo! WebAPI error. '
    + 'Http code is ['      + err[obj.status].code        + ']'
    + ', Your request was ' + err[obj.status].message
    + ' (説明：'            + err[obj.status].description + ')');
}
module.exports.YHerror = YHerror;

