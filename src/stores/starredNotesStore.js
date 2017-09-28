import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import { log } from '../../utils/webutils';

const pspid = `starredStore`;

class StarredNotesStore extends ReduceStore {
  getInitialState() {
    return { notes: [] };
  }

  reduce(state, action) {
    log.info(`${pspid}> Request: ${action.type}`);
    switch (action.type) {
      case 'note/fetch/starred':
        return { notes: action.notes };
      default:
        return state;
    }
  }
}

export default new StarredNotesStore(dispatcher);
