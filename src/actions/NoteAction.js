import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';

export default {
  spinner() {
    //設定
    const opts = {
      lines: 13, //線の数
      length: 33, //線の長さ
      width: 11, //線の幅
      radius: 16, //スピナーの内側の広さ
      corners: 1, //角の丸み
      rotate: 74, //向き(あんまり意味が無い・・)
      direction: 1, //1：時計回り -1：反時計回り
      color: '#000', // 色
      speed: 1.5, // 一秒間に回転する回数
      trail: 71, //残像の長さ
      shadow: true, // 影
      hwaccel: true, // ？
      className: 'spinner', // クラス名
      zIndex: 2e9, // Z-index
      top: '50%', // relative TOP
      left: '30%', // relative LEFT
      opacity: .25, //透明度
      fps: 20 //fps
    };
    //スピナーオブジェクト
    return new Spinner(opts);
  },

  target() {
    return document.getElementById('app');
  },

  fetchMyNotes() {
    var spinner = this.spinner();
    spinner.spin(this.target());
    return NoteApiClient.fetchMyNotes().then(notes => {
      dispatch({ type: 'note/fetch/my', notes });
      spinner.spin();
    });
  },

  fetchStarred() {
    var spinner = this.spinner();
    spinner.spin(this.target());
    return NoteApiClient.fetchStarredNotes().then(notes => {
      dispatch({ type: 'note/fetch/starred', notes });
      spinner.spin();
    });
  },

  fetch(id) {
    var spinner = this.spinner();
    spinner.spin(this.target());
    dispatch({ type: 'note/fetch/before' });
    return NoteApiClient.fetchNote(id).then(note => {
      dispatch({ type: 'note/fetch', note });
      spinner.spin();
    });
  },

  create() {
    var spinner = this.spinner();
    spinner.spin(this.target());
    return NoteApiClient.createNote().then(note => {
      dispatch({ type: 'note/create', note });
      spinner.spin();
    });
  },

  update(id, { title, body, category }) {
    var spinner = this.spinner();
    spinner.spin(this.target());
    return NoteApiClient.updateNote(id, { title, body, category }).then(() => {
      dispatch({ type: 'note/update', id, note: { title, body, category } });
      spinner.spin();
    });
  },

  delete(id) {
    var spinner = this.spinner();
    spinner.spin(this.target());
    return NoteApiClient.deleteNote(id).then(() => {
      dispatch({ type: 'note/delete', id });
      spinner.spin();
    });
  },

  getusername() {
    var spinner = this.spinner();
    spinner.spin(this.target());
    return NoteApiClient.getUsername().then(username => {
      //console.dir(username);
      dispatch({ type: 'note/username', username: username});
      spinner.spin();
    });
  }
};
