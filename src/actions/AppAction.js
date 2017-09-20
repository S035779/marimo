import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import app from '../../utils/webutils';

export default {
  target(elm) {
    return document.getElementById(elm);
  },
  getusername() {
    const spinner = app.spinner();
    spinner.spin(this.target('app'));
    return NoteApiClient.getUsername().then(username => {
      spinner.stop();
      dispatch({ type: 'app/username', username: username});
    });
  }
};
