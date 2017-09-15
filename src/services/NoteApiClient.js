import enc from '../../utils/encutils';
import std from '../../utils/stdutils';
import xhr from '../../utils/xhrutils';
import str from '../../utils/strutils';

const LATENCY = 200;
let username = ''
let notes = [];
let url="/api/note";

export default {
  request(func, response) {
    if(func === 'get') {
      console.log(response);
      username = this.getName();
      return new Promise( function(resolve, reject) {
        var query = { user: username }
        var uri = url;
        xhr.get(uri, query, function(data) {
            //console.log(data);
            notes = data;
            resolve(notes);
        });
      });
    } else
    if(func === 'create'
    || func === 'delete'
    || func === 'search') {
      console.log(response);
      return new Promise( function(resolve, reject) {
        var uri = url + '/' + func;
        xhr.postJSON(uri, response, function(data) {
            resolve(response);
        });
      });
    } else
    if(func === 'post') {
      console.log(response);
      return new Promise( function(resolve, reject) {
        var uri = url;
        xhr.postJSON(uri, response, function(data) {
            resolve(response.id);
        });
      });
    } else
    {
      console.log(response);
      return new Promise(resolve => {
        setTimeout(() => resolve(response), LATENCY);
      });
    }
  },

  // 更新日付を生成
  getUpdated() {
    return std.getTimeStamp();
  },

  getName() {
    var memory = window.localStorage ||
      (window.UserDataStorage && new str.UserDataStorage()) ||
      new str.CookieStorage();
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
    const starredNotes = notes.filter(note => note.starred === true)
    return this.request('fetchStar', starredNotes);
  },

  // ３．特定のノートをデータベースから取得
  fetchNote(id) {
    const note = notes.find(note => note.id === id);
    return this.request('fetch', note);
  },

  // ４．新規のノートを作成する
  createNote() {
    const id = enc.makeRandInt(8);
    const updated = this.getUpdated();
    const user = this.getName();
    const note = { user: user, id: id, title: 'Untitled', category: '', starred: false, body: '', updated: updated};
    notes.unshift(note);
    return this.request('create', note);
  },

  // ５．特定のノートをアップデートする
  updateNote(id, { title, body, category }) {
    notes = notes.map(note => {
      if (note.id === id) {
        return Object.assign({}, note, { title, body, category, updated: this.getUpdated() });
      }
      else {
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
