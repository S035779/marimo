import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import { log, spn } from '../../utils/webutils';

const pspid = `StarAction`;

export default {
  fetchMyNotes() {
    return NoteApiClient.fetchMyNotes()
    .then(notes => { // -> dashboardStore.js
      dispatch({ type: 'note/fetch/my', notes });
      log.info(`${pspid}> Response: note/fetch/my`);
      spn.stop();
    });
  },
  create(id) {
    return NoteApiClient.createStar(id)
    .then(note => { // -> noteStore.js
      dispatch({ type: 'star/update'
        , id: note.id, starred: note.starred });
      log.info(`${pspid}> Response: star/update`);
    }).then(() => this.fetchMyNotes());
  },
  delete(id) {
    return NoteApiClient.deleteStar(id)
    .then(note => { // -> noteStore.js
      dispatch({ type: 'star/update'
        , id: note.id, starred: note.starred });
      log.info(`${pspid}> Response: star/update`);
    }).then(() => this.fetchMyNotes());
  },
};
