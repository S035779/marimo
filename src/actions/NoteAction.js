import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import Spinner from '../../utils/spin';

export default {
  spinner() {
    //設定
    const opts = {
        lines: 13 // The number of lines to draw
      , length: 28 // The length of each line
      , width: 14 // The line thickness
      , radius: 42 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#000' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as
                // a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner'  // The CSS class to assign to the
                              //  spinner
      , top: '49%' // Top position relative to parent
      , left: '49%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
    };
    //スピナーオブジェクト
    return new Spinner(opts);
  },

  target(elm) {
    return document.getElementById(elm);
  },

  fetchMyNotes() {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.fetchMyNotes().then(notes => {
      spinner.stop();
      dispatch({ type: 'note/fetch/my', notes });
    });
  },

  fetchStarred() {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.fetchStarredNotes().then(notes => {
      spinner.stop();
      dispatch({ type: 'note/fetch/starred', notes });
    });
  },

  fetch(id) {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    dispatch({ type: 'note/fetch/before' });
    return NoteApiClient.fetchNote(id).then(note => {
      spinner.stop();
      dispatch({ type: 'note/fetch', note });
    });
  },

  create() {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.createNote().then(note => {
      spinner.stop();
      dispatch({ type: 'note/create', note });
    });
  },

  update(id, { title, body, category }) {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    return
      NoteApiClient.updateNote(id, { title, body, category })
      .then(() => {
        spinner.stop();
        dispatch({ type: 'note/update', id
          , note: { title, body, category } });
    });
  },

  delete(id) {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.deleteNote(id).then(() => {
      spinner.stop();
      dispatch({ type: 'note/delete', id });
    });
  },

  getusername() {
    const spinner = this.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.getUsername().then(username => {
      spinner.stop();
      dispatch({ type: 'note/username', username: username});
    });
  }
};
