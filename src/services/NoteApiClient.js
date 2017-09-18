import enc from '../../utils/encutils';
import std from '../../utils/stdutils';
import xhr from '../../utils/xhrutils';
import app from '../../utils/webutils';

let notes = [];

export default {
  request(func, response) {
    const url="/api/note";
    const LATENCY = 200;
    switch(func) {
      case 'get':
        return new Promise(resolve => {
          console.log(response);
          const username = this.getName();
          const query = { user: username }
          const uri = url;
          xhr.get(uri, query, function(data) {
            notes = data;
            resolve(notes);
          });
        });
      case 'create':
      case 'delete':
      case 'search':
        return new Promise(resolve => {
          console.log(response);
          const uri = url + '/' + func;
          xhr.postJSON(uri, response, function(data) {
            resolve(response);
          });
        });
      case 'post':
        return new Promise(resolve => {
          console.log(response);
          const uri = url;
          xhr.postJSON(uri, response, function(data) {
            resolve(response.id);
          });
        });
      default:
        return new Promise(resolve => {
          console.log(response);
          setTimeout(() => resolve(response), LATENCY);
        });
    }
  },
  // 更新日付を生成
  getUpdated() {
    return std.getTimeStamp();
  },

  getName() {
    const memory = window.localStorage ||
      (window.UserDataStorage && new app.UserDataStorage()) ||
      new app.CookieStorage();
    return memory.getItem("username");
  },
  // ユーザ名からノートを特定する
  myNotes() {
    return notes.filter(note => note.user === this.getName());
  },

  getUsername() {
    return this.request('getUser', this.getName());
  },
  // １．自分のノートをデータベースから全件取得する
  fetchMyNotes() {
    return this.request('get', this.myNotes());
  },
  // ２．お気に入りノートのみを表示
  fetchStarredNotes() {
    const starredNotes = notes.filter(note =>
      note.starred === true)
    return this.request('fetchStar', starredNotes);
  },
  // ３．特定のノートをデータベースから取得
  fetchNote(id) {
    const note = notes.find(note => note.id === id);
    return this.request('fetch', note);
  },
  // ４．新規のノートを作成する
  createNote() {
    const note = {
      user:       this.getName()
      , id:       enc.makeRandInt(8)
      , title:    'Untitled'
      , category: ''
      , starred:  false
      , body:     ''
      , updated:  this.getUpdated()
    };
    notes.unshift(note);
    return this.request('create', note);
  },
  // ５．特定のノートをアップデートする
  updateNote(id, { title, body, category, options }) {
    notes = notes.map(note => {
      if (note.id === id) {
        return Object.assign( {}, note, {
          title
          , body
          , category
          , options
          , updated: this.getUpdated()
        });
      } else {
        return note;
      }
    });
    const note = notes.find(note => note.id === id);
    return this.request('search', note);
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
