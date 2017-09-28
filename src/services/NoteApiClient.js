import std from '../../utils/stdutils';
import xhr from '../../utils/xhrutils';
import { str, log, spn } from '../../utils/webutils';

log.config('console', 'basic', 'ALL', 'note-client');
spn.config('app');

const pspid = `NoteAPIClient`;
let notes = [];

export default {
  request(func, response) {
    const url="/api/note";
    const LATENCY = 200;
    spn.spin();
    log.info(`${pspid}> Request: ${func}`);
    switch(func) {
      case 'get':
        return new Promise(resolve => {
          xhr.get(url, response, data => {
            notes = data;
            spn.stop();
            resolve(notes); });
        });
      case 'post':
        return new Promise(resolve => {
          xhr.postJSON(url, response, () => {
            spn.stop();
            resolve(response);
          });
        });
      case 'create':
      case 'delete':
      case 'search':
        return new Promise(resolve => {
          const uri = url + '/' + func;
          xhr.postJSON(uri, response, () => {
            spn.stop();
            resolve(response);
          });
        });
      case 'storage':
        return new Promise(resolve => {
          const memory = window.localStorage
            || (window.UserDataStorage
            && new str.UserDataStorage()) ||
            new str.CookieStorage();
          spn.stop();
          resolve(memory.getItem(response));
        });
      case 'cache/starred':
        return new Promise(resolve => {
          const starredNotes =
            notes.filter(note => note.starred === response)
          spn.stop();
          resolve(starredNotes);
        });
      case 'cache':
        return new Promise(resolve => {
          const note =
            notes.find(note => note.id === response);
          spn.stop();
          resolve(note);
        });
      default:
        return new Promise(resolve => {
          setTimeout(() => resolve(response), LATENCY);
          spn.stop();
        });
    }
  },

  fetchUser() {
    return this.request('storage', 'username');
  },
  // １．自分のノートをデータベースから全件取得する
  fetchMyNotes() {
    const self = this;
    return this.fetchUser().then(username =>
      self.request('get', { user: username }));
  },
  // ２．お気に入りノートのみを表示
  fetchStarredNotes() {
    return this.request('cache/starred', true);
  },
  // ３．特定のノートを取得
  fetchNote(id) {
    return this.request('cache', id);
  },
  // ４．新規のノートを作成する
  createNote() {
    const self = this;
    return this.fetchUser()
    .then(username => {
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
    const self = this;
    return this.fetchNote(id).then(note => {
      note = Object.assign({}, note, {
        title, body, category
        , updated: std.getTimeStamp()
      });
      return self.request('search', note)
    });
  },
  //
  updateOptions(id, options) {
    const self = this;
    return this.fetchNote(id).then(note => {
      note = Object.assign({}, note, {
        options
        , updated: std.getTimeStamp()
      });
      return self.request('post', note);
    });
  },
  // ６．特定のノートを削除する
  deleteNote(id) {
    const self = this;
    return this.fetchNote(id).then(note => {
      return self.request('delete', note)
    });
  },
  // ７．特定のノートをお気に入りにする
  createStar(id) {
    const self = this;
    return this.fetchNote(id).then(note => {
      note = Object.assign({}, note, {
        starred: true
      });
      return self.request('post', note);
    });
  },
  // ８．特定のノートのお気に入りを外す
  deleteStar(id) {
    const self = this;
    return this.fetchNote(id).then(note => {
      note = Object.assign({}, note, {
        starred: false
      });
      return self.request('post', note);
    });
  },
};
