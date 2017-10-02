import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';
import { log, spn } from '../../utils/webutils';

const pspid = `AppAction`;

export default {
  getusername() {
    return NoteApiClient.fetchUser()
    .then(username => {
      dispatch({ type: 'app/fetch/username', username });
      log.info(`${pspid}> Response: app/fetch/username`);
    });
  }
};
