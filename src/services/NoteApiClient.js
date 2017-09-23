import std from '../../utils/stdutils';
import xhr from '../../utils/xhrutils';
import app from '../../utils/webutils';

let notes = [];

export default {
  request(func, response) {
    const url="/api/note";
    const LATENCY = 200;
    console.log(`[NoteAPIClient] Request: ${func}`);
    switch(func) {
      case 'get':
        return new Promise(resolve => {
          xhr.get(url, response
          , function(data) {
            notes = data;
            console.log(notes);
            resolve(notes); });
        });
      case 'post':
        return new Promise(resolve => {
          xhr.postJSON(url, response
            , function() { resolve(response); });
        });
      case 'create':
      case 'delete':
      case 'search':
        return new Promise(resolve => {
          const uri = url + '/' + func;
          xhr.postJSON(uri, response
            , function() { resolve(response); });
        });
      case 'storage':
        return new Promise(resolve => {
          const memory = window.localStorage
            || (window.UserDataStorage
            && new app.UserDataStorage()) ||
            new app.CookieStorage();
          resolve(memory.getItem(response));
        });
      case 'get/starred':
      case 'get/note':
      default:
        return new Promise(resolve => {
          setTimeout(() => resolve(response), LATENCY);
        });
    }
  },

  fetchUser() {
    return this.request('storage', 'username');
  },
  // １．自分のノートをデータベースから全件取得する
  fetchMyNotes() {
    const self = this;
    return this.fetchUser()
    .then(username =>  self.request('get', { user: username })
    );
  },
  // ２．お気に入りノートのみを表示
  fetchStarredNotes() {
    const starredNotes =
      notes.filter(note => note.starred === true);
    return this.request('get/starred', starredNotes);
  },
  // ３．特定のノートを取得
  fetchNote(id) {
    const note = notes.find(note => note.id === id);
    return this.request('get/note', note);
  },
  // ４．新規のノートを作成する
  createNote() {
    const self = this;
    return this.fetchUser()
    .then(function(username) {
      const note = {
        user:       username
        , id:       std.makeRandInt(8)
        , title:    'Untitled'
        , category: ''
        , starred:  false
        , body:     ''
        , options: {
          searchString:   ''
          , highestPrice: ''
          , lowestPrice:  ''
          , bids:         false
          , condition:    'all'
          , status:       false
          , AuctionID:    []
          , categoryPath: []
          , seller:       [] }
        , items:     []
        , updated:  std.getTimeStamp()
      };
      return self.request('create', note);
    });
  },
  // ５．特定のノートをアップデートする
  updateNote(id, { title, body, category }) {
    notes = notes.map(note => {
      if (note.id === id) {
        return Object.assign({}, note
        , { title, body, category, updated: std.getTimeStamp()});
      } else {
        return note;
      }
    });
    const note = notes.find(note => note.id === id);
    return this.request('search', note);
  },
  //
  updateOptions(id, options) {
    const note = notes.find(note => note.id === id);
    note.options = options;
    return this.request('post', note);
  },
  // ６．特定のノートを削除する
  deleteNote(id) {
    const note = notes.find(note => note.id === id);
    notes = notes.filter(note => note.id !== id);
    return this.request('delete', note);
  },
  // ７．特定のノートをお気に入りにする
  createStar(id) {
    const note = notes.find(note => note.id === id);
    note.starred = Boolean(1);
    return this.request('post', note);
  },
  // ８．特定のノートのお気に入りを外す
  deleteStar(id) {
    const note = notes.find(note => note.id === id);
    note.starred = Boolean(0);
    return this.request('post', note);
  },
};
