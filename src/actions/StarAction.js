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
      console.log(`[StarredAction] Response: note/fetch/my`);
    });
  },
  create(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.createStar(id)
    .then(note => { // -> noteStore.js
      spinner.stop();
      dispatch({ type: 'star/update'
        , id: note.id, starred: note.starred });
      console.log(`[StarredAction] Response: star/update`);
    }).then(() => this.fetchMyNotes());
  },
  delete(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.deleteStar(id)
    .then(note => { // -> noteStore.js
      spinner.stop();
      dispatch({ type: 'star/update'
        , id: note.id, starred: note.starred });
      console.log(`[StarredAction] Response: star/update`);
    }).then(() => this.fetchMyNotes());
  },
};
