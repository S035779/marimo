import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import { log } from '../../utils/webutils';

const pspid = `appStore`;

class AppStore extends ReduceStore {
  getInitialState() {
    return { username: null };
  }

  reduce(state, action) {
    log.info(`${pspid}> Request: ${action.type}`);
    switch (action.type) {
      case 'app/fetch/username':
        return Object.assign({}, state, {
           username: action.username
        });
      default:
        return state;
    }
  }
}

export default new AppStore(dispatcher);
