import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import app from '../../utils/webutils';

export default {
  target(elm) {
    return document.getElementById(elm);
  },
  fetchMyNotes() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.fetchMyNotes()
    .then(notes => { // -> dashboardStore.js
      spinner.stop();
      dispatch({ type: 'note/fetch/my', notes });
      console.log(`[NoteAction] Response: note/fetch/my`);
    });
  },
  fetchStarred() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.fetchStarredNotes()
    .then(notes => { // -> starredNoteStore.js
      spinner.stop();
      dispatch({ type: 'note/fetch/starred', notes });
      console.log(`[NoteAction] Response: note/fetch/starred`);
    });
  },
  fetch(id) { // -> noteStore.js
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    dispatch({ type: 'note/fetch/before' });
    console.log(`[NoteAction] Response: note/fetch/before`);
    return NoteApiClient.fetchNote(id)
    .then(note => { //  -> noteStore.js
      spinner.stop();
      dispatch({ type: 'note/fetch', note });
      console.log(`[NoteAction] Response: note/fetch`);
    });
  },
  create() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.createNote()
    .then(note => { // -> dashboardStore.js
      spinner.stop();
      dispatch({ type: 'note/create', note });
      console.log(`[NoteAction] Response: note/create`);
    }).then(() => this.fetchMyNotes());
  },
  update(id, { title, body, category }) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.updateNote(id
      , { title, body, category })
    .then(() => { // -> dashboardStore.js
      spinner.stop();
      dispatch({ type: 'note/update', id
        , note: { title, body, category } });
      console.log(`[NoteAction] Response: note/update`);
    }).then(() => this.fetchMyNotes());
  },
  updateOptions(id, options) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.updateOptions(id, options)
    .then(() => { // -> noteStore.js
      spinner.stop();
      dispatch({ type: 'note/update/options', id
        , options });
      console.log(`[NoteAction] Response: note/update/options`);
    }).then(() => this.fetchMyNotes());
  },
  delete(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.deleteNote(id)
    .then(() => { // -> dashboardStore.js
      spinner.stop();
      dispatch({ type: 'note/delete', id });
      console.log(`[NoteAction] Response: note/delete`);
    });
  },
  getusername() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.fetchUser()
    .then(username => { // -> dashboardStore.js
      spinner.stop();
      dispatch({ type: 'note/fetch/username'
        , username: username });
      console.log(`[NoteAction] Response: note/fetch/username`);
    });
  }
};
