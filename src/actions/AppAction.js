import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';

export default {
  getusername() {
    return NoteApiClient.getUsername().then(username => {
      //console.dir(username);
      dispatch({ type: 'app/username', username: username});
    });
  }
};
