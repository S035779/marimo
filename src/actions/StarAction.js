import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import app from '../../utils/webutils';

export default {
  target(elm) {
    return document.getElementById(elm);
  },
  create(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.createStar(id).then(note => {
      spinner.stop();
      dispatch({ type: 'star/update', note });
      console.log(`[StarredAction] Response: star/update`);
    });
  },
  delete(id) {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.deleteStar(id).then(note => {
      spinner.stop();
      dispatch({ type: 'star/update', note });
      console.log(`[StarredAction] Response: star/update`);
    });
  },
};
