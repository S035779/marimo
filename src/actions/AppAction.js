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
    return NoteApiClient.fetchUser()
    .then(username => {
      spinner.stop();
      dispatch({ type: 'app/fetch/username'
        , username: username});
      console.log(`[AppAction] Response: app/fetch/username`);
    });
  }
};
