import Spinner from '../utils/spin';

let Logger = null;
let Spiner = null;
let target = null;

export const log = {
  Logger,
  config(apd, lyt, flv, nam) {
    const apds = {
      'alert':      new Log4js.JSAlertAppender()
      , 'console':  new Log4js.BrowserConsoleAppender()
    };
    const lyts = {
      'basic':      new Log4js.BasicLayout()
      , 'json':     new Log4js.JSONLayout()
      , 'xml':      new Log4js.XMLLayout()
    };
    const flvs = {
      'OFF':        Log4js.Level.OFF
      , 'FATAL':    Log4js.Level.FATAL
      , 'ERROR':    Log4js.Level.ERROR
      , 'WARN':     Log4js.Level.WARN
      , 'INFO':     Log4js.Level.INFO
      , 'DEBUG':    Log4js.Level.DEBUG
      , 'TRACE':    Log4js.Level.TRACE
      , 'ALL':      Log4js.Level.ALL
    };
    const appender = apds[apd];
    appender.setLayout(lyts[lyt]);
    const logger = new Log4js.getLogger(nam);
    logger.addAppender(appender);
    this.Logger = logger;
  },
  logger(mlv, msg) {
    const _msg = msg.map( val => {
      if(typeof val === 'object') {
        return JSON.stringify(val, null, 4);
      } else if(val == null) {
        return '?';
      } else {
        return val;
      }
    });
    this.Logger.log(mlv, _msg.join(' '), null);
  },
  fatal(msg)  {
    const args = Array.prototype.slice.call(arguments);
    this.logger('FATAL',  args);
  },
  error(msg)  {
    const args = Array.prototype.slice.call(arguments);
    this.logger('ERROR',  args);
  },
  warn(msg)   {
    const args = Array.prototype.slice.call(arguments);
    this.logger('WARN',   args);
  },
  info(msg)   {
    const args = Array.prototype.slice.call(arguments);
    this.logger('INFO',   args);
  },
  debug(msg)  {
    const args = Array.prototype.slice.call(arguments);
    this.logger('DEBUG',  args);
  },
  trace(msg)  {
    const args = Array.prototype.slice.call(arguments);
    this.logger('TRACE',  args);
  },
};

export const spn = {
  Spinner,
  target,
  config(target) {
    const opts = {
      lines:        13  // The number of lines to draw
      , length:     28  // The length of each line
      , width:      14  // The line thickness
      , radius:     42  // The radius of the inner circle
      , scale:      1   // Scales overall size of the spinner
      , corners:    1   // Corner roundness (0..1)
      , color:      '#000' // #rgb or #rrggbb or array of colors
      , opacity:    0.25 // Opacity of the lines
      , rotate:     0   // The rotation offset
      , direction:  1   // 1: clockwise, -1: counterclockwise
      , speed:      1   // Rounds per second
      , trail:      60  // Afterglow percentage
      , fps:        20  // Frames per second when using
                        // setTimeout() as
                        // a fallback for CSS
      , zIndex:     2e9 // The z-index (defaults to 2000000000)
      , className:  'spinner'   // The CSS class to assign to the
                                //  spinner
      , top:        '49%' // Top position relative to parent
      , left:       '49%' // Left position relative to parent
      , shadow:     false // Whether to render a shadow
      , hwaccel:    false // Whether to use hardware acceleration
      , position:   'absolute' // Element positioning
    };
    this.Spinner = new Spinner(opts);
    this.target = document.getElementById(target);
  },
  spin() { this.Spinner.spin(this.target); },
  stop()  { this.Spinner.stop(); },
};

export const str = {
  /**
   * setCookies
   *
   * @param name
   * @param value
   * @param daysToLive
   */
  setCookies(name, value, daysToLive) {
    var cookie = name + "=" + encodeURIComponent(value);
    if(typeof daysToLive === "number")
      cookie += "; max-age=" + (daysToLive*60*60*24);
    document.cookie = cookie;
  },

  /**
   * getCookies
   * Return the document's cookies as an object of name/value
   * pairs.Assume that cookie values are encoded with
   * encodeURIComponent().
   *
   * @returns {object} - Store name and value in object.
   */
  getCookies() {
      var cookies = {};
      var all = document.cookie;
      if (all === "")
          return cookies;
      var list = all.split("; ");
      for(var i = 0; i < list.length; i++) {
          var cookie = list[i];
          var p = cookie.indexOf("=");
          var name = cookie.substring(0,p);
          var value = cookie.substring(p+1);
          value = decodeURIComponent(value);
          cookies[name] = value;
      }
      return cookies;
  },

  /**
   * CookieStorage
   * This class implements the Storage API that localStorage and
   * sessionStorage do, but implements it on top of HTTP Cookies.
   *
   * @param maxage {number} - lifetime
   * @param path {string} - scope
   */
  CookieStorage(maxage, path) {
      var cookies = (function() {
          var cookies = {};
          var all = document.cookie;
          if (all === "")
              return cookies;
          var list = all.split("; ");
          for(var i = 0; i < list.length; i++) {
              var cookie = list[i];
              var p = cookie.indexOf("=");
              var name = cookie.substring(0,p);
              var value = cookie.substring(p+1);
              value = decodeURIComponent(value);
              cookies[name] = value;
          }
          return cookies;
      }());
      var keys = [];
      for(var key in cookies) keys.push(key);
      this.length = keys.length;
      this.key = function(n) {
          if (n < 0 || n >= keys.length) return null;
          return keys[n];
      };
      this.getItem = function(name) {
        return cookies[name] || null;
      };
      this.setItem = function(key, value) {
          if (!(key in cookies)) {
              keys.push(key);
              this.length++;
          }
          cookies[key] = value;
          var cookie = key + "=" + encodeURIComponent(value);
          if (maxage) cookie += "; max-age=" + maxage;
          if (path) cookie += "; path=" + path;
          document.cookie = cookie;
      };
      this.removeItem = function(key) {
          if (!(key in cookies)) return;
          delete cookies[key];
          for(var i = 0; i < keys.length; i++) {
              if (keys[i] === key) {
                  keys.splice(i,1);
                  break;
              }
          }
          this.length--;
          document.cookie = key + "=; max-age=0";
      };
      this.clear = function() {
          for(var i = 0; i < keys.length; i++)
              document.cookie = keys[i] + "=; max-age=0";
          cookies = {};
          keys = [];
          this.length = 0;
      };
  },

  /**
   * UserDataStorage
   * Create a document element and install the special userData
   * behavior on it so it gets save() and load() methods.
   *
   * @param {number} maxage - If maxage is specified, expire the
   *                  userData in maxage seconds
   */
  UserDataStorage(maxage)  {
      var memory = document.createElement("div");
      memory.style.display = "none";
      memory.style.behavior = "url('#default#userData')";
      document.body.appendChild(memory);
      if (maxage) {
          var now = new Date().getTime();
          var expires = now + maxage * 1000;
          memory.expires = new Date(expires).toUTCString();
      }
      memory.load("UserDataStorage");
      this.getItem = function(key) {
          return memory.getAttribute(key) || null;
      };
      this.setItem = function(key, value) {
          memory.setAttribute(key,value);
          memory.save("UserDataStorage");
      };
      this.removeItem = function(key) {
          memory.removeAttribute(key);
          memory.save("UserDataStorage");
      };
  }
};
