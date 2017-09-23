import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';

class AppStore extends ReduceStore {
  getInitialState() {
    return { username: null };
  }

  reduce(state, action) {
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
