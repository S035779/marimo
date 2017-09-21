import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import app from '../../utils/webutils';

export default {
  target(elm) {
    return document.getElementById(elm);
  },
  create(noteId) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.createStar(noteId).then(() => {
      spinner.stop();
      dispatch({ type: 'star/create', noteId });
      console.log(`[StarredAction] Response: star/create`);
    });
  },
  delete(noteId) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.deleteStar(noteId).then(noteId => {
      spinner.stop();
      dispatch({ type: 'star/delete', noteId });
      console.log(`[StarredAction] Response: star/delete`);
    });
  },
};
