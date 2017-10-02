import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import { log, spn } from '../../utils/webutils';

const pspid = `NoteAction`;

export default {
  fetchMyNotes() {
    return NoteApiClient.fetchMyNotes()
    .then(notes => { // -> dashboardStore.js
      dispatch({ type: 'note/fetch/my', notes });
      log.info(`${pspid}> Response: note/fetch/my`);
      spn.stop();
    });
  },
  fetchStarred() {
    return NoteApiClient.fetchStarredNotes()
    .then(notes => { // -> starredNoteStore.js
      dispatch({ type: 'note/fetch/starred', notes });
      log.info(`${pspid}> Response: note/fetch/starred`);
    });
  },
  fetch(id) { // -> noteStore.js
    dispatch({ type: 'note/fetch/before' });
    log.info(`${pspid}> Response: note/fetch/before`);
    return NoteApiClient.fetchNote(id)
    .then(note => { //  -> noteStore.js
      dispatch({ type: 'note/fetch', note });
      log.info(`${pspid}> Response: note/fetch`);
    });
  },
  create() {
    return NoteApiClient.createNote()
    .then(note => { // -> dashboardStore.js
      dispatch({ type: 'note/create', note });
      log.info(`${pspid}> Response: note/create`);
    }).then(() => this.fetchMyNotes());
  },
  update(id, { title, body, category }) {
    return NoteApiClient.updateNote(id, { title, body, category })
    .then(() => { // -> dashboardStore.js
      dispatch({ type: 'note/update', id
        , note: { title, body, category } });
      log.info(`${pspid}> Response: note/update`);
    }).then(() => this.fetchMyNotes());
  },
  updateOptions(id, options) {
    return NoteApiClient.updateOptions(id, options)
    .then(() => { // -> noteStore.js
      dispatch({ type: 'note/update/options', id, options });
      log.info(`${pspid}> Response: note/update/options`);
    }).then(() => this.fetchMyNotes());
  },
  delete(id) {
    return NoteApiClient.deleteNote(id)
    .then(() => { // -> dashboardStore.js
      dispatch({ type: 'note/delete', id });
      log.info(`${pspid}> Response: note/delete`);
      spn.stop();
    });
  },
  getusername() {
    return NoteApiClient.fetchUser()
    .then(username => { // -> dashboardStore.js
      dispatch({ type: 'note/fetch/username', username });
      log.info(`${pspid}> Response: note/fetch/username`);
    });
  }
};
