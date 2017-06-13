import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';

export default {
  fetchMyNotes() {
    return NoteApiClient.fetchMyNotes().then(notes => {
      dispatch({ type: 'note/fetch/my', notes });
    });
  },

  fetchStarred() {
    return NoteApiClient.fetchStarredNotes().then(notes => {
      dispatch({ type: 'note/fetch/starred', notes });
    });
  },

  fetch(id) {
    dispatch({ type: 'note/fetch/before' });
    return NoteApiClient.fetchNote(id).then(note => {
      dispatch({ type: 'note/fetch', note });
    });
  },

  create() {
    return NoteApiClient.createNote().then(note => {
      dispatch({ type: 'note/create', note });
    });
  },

  update(id, { title, body, category }) {
    return NoteApiClient.updateNote(id, { title, body, category }).then(() => {
      dispatch({ type: 'note/update', id, note: { title, body, category } });
    });
  },

  delete(id) {
    return NoteApiClient.deleteNote(id).then(() => {
      dispatch({ type: 'note/delete', id });
    });
  },

  getusername() {
    return NoteApiClient.getUsername().then(username => {
      //console.dir(username);
      dispatch({ type: 'note/username', username: username});
    });
  }
};
