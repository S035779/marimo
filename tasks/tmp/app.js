var s = require('../utils/stdutils');
var e = require('../utils/encutils');
var http = require('../utils/netutils');
var xml = require('xml2js');
var fs = require('fs');

// YAHOO! Auction WebAPI
var appid = process.env.app_id;
var v1 = 'https://auctions.yahooapis.jp/AuctionWebService/V1/'
var v2 = 'https://auctions.yahooapis.jp/AuctionWebService/V2/'

// nodejs versions.
console.dir(process.versions);

function app() {
    // exp.1 Array sample.
    //var a = [ 0, 1, 2, 3, 4, 5, 'a', 'b', 'c' ];
    //var b = [ 3, 4, 5, 6, 7, 8, 'b', 'c', 'd' ];
    //console.log(s.and(a,b)); // [ 3, 4, 5, 'b', 'c' ]
    //console.log(s.del(a,b)); // [ 0, 1, 2, 'a' ]↲
    //console.log(s.add(a,b)); // [ 6, 7, 8, 'd' ]↲
    //console.log(s.dif(a,b)); // [ 0, 1, 2, 'a' 6, 7, 8, 'd' ]↲
    //console.log(s.dup(a,b)); // [ 0, 1, 2, 3, 4, 5, 'a', 'b', 'c', 6, 7, 8, 'd' ]

    // exp.2 'YAHOO! Auction item' sample.
    //var auid1 = 'b193754812';
    //YHauctionItem('0000', { appid: appid, auctionID: auid1 }, function(err, opt){});

    // exp.3 'YAHOO! Bids History' sample.
    //var auid2 = 'b193754812';
    //YHbidHistory('0000', { appid: appid, auctionID: auid2 }, function(err, opt){});

    // exp.4 'YAHOO! Search' sample.
    var query = 'カバン メンズ レザー';
    var page;
    page = 1;
    YHsearch('0001', { appid: appid, query: query, page: page },
      function(err, ids, opt){
        if (err) {
            console.error(err.message);
            throw err;
        }
        //console.dir(ids);
        //console.dir(opt);
        //console.log(ids.length);
        ids.forEach(function(id) {
            YHauctionItem('0001', { appid: appid, auctionID: id }, function(err, opt){ console.log('item -> ' + id); });
            YHbidHistory('0001', { appid: appid, auctionID: id }, function(err, opt){ console.log('bid -> ' + id); });
        });
        pages = Math.ceil(opt.resAvailable / opt.resReturned);
    });

    page = 2;
    YHsearch('0001', { appid: appid, query: query, page: page },
      function(err, ids, opt){
        if (err) {
            console.error(err.message);
            throw err;
        }
        //console.dir(ids);
        //console.dir(opt);
        //console.log(ids.length);
        ids.forEach(function(id) {
            YHauctionItem('0001', { appid: appid, auctionID: id }, function(err, opt){ console.log('item -> ' + id); });
            YHbidHistory('0001', { appid: appid, auctionID: id }, function(err, opt){ console.log('bid -> ' + id); });
        });
    });
};

// entry function.
app();

// get result of the 'YAHOO! Auction item'.
function YHauctionItem(taskid, options, callback) {
    var uri = v2 + 'auctionItem?' + e.encodeFormData(options);
    var filename = setFilename('AuctionItem_', taskid, '_', options.auctionID, '.json')
    http.get(uri, function(stat, head, body) {
        var a = [];
        var opt = {};
        a.push({ request: uri },{ status: stat },{ header: head });
        xml.parseString(body,
         { attrkey: 'root', trim: true, explicitArray: false },
          function(err, result) {
            if (err) {
                console.error(err.message);
                throw err;
            }
            a.push({ body: result });
            //console.dir(a[0],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[1],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[2],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[3],{showHidden: false, depth: 10, colors: true});
            var b = [];
            for (i=0; i<a.length; i++) b[i]=JSON.stringify(a[i]);
            //fs.writeFile(filename, b.join());
            fs.writeFile(filename, b[3]);
            opt.resAvailable = a[3].body.ResultSet.root.totalResultsAvailable;
            opt.resReturned = a[3].body.ResultSet.root.totalResultsReturned;
            opt.resPosition = a[3].body.ResultSet.root.firstResultPosition;
            if(callback) callback(err, opt);
        });
    });

};

// get result of the 'YAHOO! Search'.
function YHsearch(taskid, options, callback) {
    var uri = v2 + 'search?' + e.encodeFormData(options);
    var filename = setFilename('Search_', taskid, '_', options.page, '.json')

    http.get(uri, function(stat, head, body) {
        var a = [];
        var b = [];
        var auctionIDs = [];
        var opt = {};
        a.push({ request: uri },{ status: stat },{ header: head });
        xml.parseString(body,
         { attrkey: 'root', trim: true, explicitArray: false },
          function(err, result) {
            if (err) {
                console.error(err.message);
                throw err;
            }
            a.push({ body: result });
            //console.dir(a[0],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[1],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[2],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[3],{showHidden: false, depth: 10, colors: true});
            for (var i=0; i<a.length; i++) b[i]=JSON.stringify(a[i]);
            //fs.writeFile(filename, b.join());
            fs.writeFile(filename, b[3]);
            opt.resAvailable = a[3].body.ResultSet.root.totalResultsAvailable;
            opt.resReturned = a[3].body.ResultSet.root.totalResultsReturned;
            opt.resPosition = a[3].body.ResultSet.root.firstResultPosition;
            for (var j=0; j<a[3].body.ResultSet.Result.Item.length; j++) {
                auctionIDs[j] = a[3].body.ResultSet.Result.Item[j].AuctionID
            };
            if(callback) callback(err,auctionIDs,opt);
        });
    });
};

// get result of the 'YAHOO! Bids History'.
function YHbidHistory(taskid, options, callback) {
    var uri = v1 + 'BidHistory?' + e.encodeFormData(options);
    var filename = setFilename('BidHistory_', taskid, '_', options.auctionID, '.json')
    http.get(uri, function(stat, head, body) {
        var a = [];
        var opt = {};
        a.push({ request: uri },{ status: stat },{ header: head });
        xml.parseString(body,
         { attrkey: 'root', trim: true, explicitArray: false },
          function(err, result) {
            if (err) {
                console.error(err.message);
                throw err;
            }
            a.push({ body: result });
            //console.dir(a[0],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[1],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[2],{showHidden: false, depth: 10, colors: true});
            //console.dir(a[3],{showHidden: false, depth: 10, colors: true});
            var b = [];
            for (i=0; i<a.length; i++) b[i]=JSON.stringify(a[i]);
            //fs.writeFile(filename, b.join());
            fs.writeFile(filename, b[3]);
            opt.resAvailable = a[3].body.ResultSet.root.totalResultsAvailable;
            opt.resReturned = a[3].body.ResultSet.root.totalResultsReturned;
            opt.resPosition = a[3].body.ResultSet.root.firstResultPosition;
            if(callback) callback(err, opt);
        });
    });
};

// set result of Json file name.
function setFilename() {
    var dir = process.cwd() + '/json';
    var filename = '';
    for(i=0; i<arguments.length; i++) filename += arguments[i];
    return require('path').join(dir,filename);
};
