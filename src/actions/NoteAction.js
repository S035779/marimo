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
    .then(notes => {
      spinner.stop();
      dispatch({
        type: 'note/fetch/my'
        , notes
      });
    });
  },
  fetchStarred() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.fetchStarredNotes()
    .then(notes => {
      spinner.stop();
      dispatch({
        type: 'note/fetch/starred'
        , notes
      });
    });
  },
  fetch(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    dispatch({ type: 'note/fetch/before' });
    return NoteApiClient.fetchNote(id)
    .then(note => {
      spinner.stop();
      dispatch({
        type: 'note/fetch'
        , note
      });
    });
  },
  create() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.createNote()
    .then(note => {
      spinner.stop();
      dispatch({
        type: 'note/create'
        , note
      });
    });
  },
  update(id, { title, body, category, options }) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.updateNote( id, {
      title, body, category, options })
    .then(() => {
      spinner.stop();
      dispatch({
        type: 'note/update'
        , id
        , note: { title, body, category, options }
      });
    })
    .then(() => this.fetchMyNotes());
  },
  delete(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.deleteNote(id)
    .then(() => {
      spinner.stop();
      dispatch({
        type: 'note/delete'
        , id
      });
    });
  },
  getusername() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.getUsername()
    .then(username => {
      spinner.stop();
      dispatch({
        type: 'note/username'
        , username: username
      });
    });
  }
};
