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
          xhr.get(url, { user: this.getName() }
          , function(data) {
            notes = data; resolve(notes); });
        });
      case 'post/starred':
        return new Promise(resolve => {
          xhr.postJSON(url, response
            , function() { resolve(response.id); });
        });
      case 'post/options':
        return new Promise(resolve => {
          xhr.postJSON(url, response
            , function() { resolve(response); });
        });
      case 'post/create':
      case 'post/delete':
      case 'post/search':
        return new Promise(resolve => {
          const uri = url + '/' + func;
          xhr.postJSON(uri, response
            , function() { resolve(response); });
        });
      case 'get/username':
      case 'get/starred':
      case 'get/note':
      default:
        return new Promise(resolve => {
          setTimeout(() => resolve(response), LATENCY);
        });
    }
  },

  getName() {
    const memory = window.localStorage ||
      (window.UserDataStorage && new app.UserDataStorage()) ||
      new app.CookieStorage();
    return memory.getItem("username");
  },

  getUsername() {
    return this.request('get/username', this.getName());
  },
  // １．自分のノートをデータベースから全件取得する
  fetchMyNotes() {
    return this.request('get'
      , notes.filter(note => note.user === this.getName()));
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
    const note = {
      user:       this.getName()
      , id:       std.makeRandInt(8)
      , title:    'Untitled'
      , category: ''
      , starred:  false
      , body:     ''
      , updated:  std.getTimeStamp()
    };
    notes.unshift(note);
    return this.request('post/create', note);
  },
  // ５．特定のノートをアップデートする
  updateNote(id, { title, body, category }) {
    notes = notes.map(note => {
      if (note.id === id) {
        return Object.assign( {}, note, {
          title
          , body
          , category
          , updated: std.getTimeStamp()
        });
      } else { return note; }
    });
    const note = notes.find(note => note.id === id);
    return this.request('post/search', note);
  },
  //
  updateOptions(id, options) {
    notes = notes.map(note => {
      if (note.id === id) {
        return Object.assign( {}, note, options);
      } else { return note; }
    });
    const note = notes.find(note => note.id === id);
    return this.request('post/options', note);
  },
  // ６．特定のノートを削除する
  deleteNote(id) {
    const note = notes.find(note => note.id === id);
    notes = notes.filter(note => note.id !== id);
    return this.request('post/delete', note);
  },
  // ７．特定のノートをお気に入りにする
  createStar(id) {
    const note = notes.find(note => note.id === id);
    note.starred = Boolean(1);
    return this.request('post/starred', note);
  },
  // ８．特定のノートのお気に入りを外す
  deleteStar(id) {
    const note = notes.find(note => note.id === id);
    note.starred = Boolean(0);
    return this.request('post/starred', note);
  },
};
