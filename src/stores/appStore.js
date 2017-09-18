import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import app from '../../utils/webutils';

class AppStore extends ReduceStore {
  getInitialState() {
    var memory = window.localStorage ||
      (window.UserDataStorage && new app.UserDataStorage()) ||
      new app.CookieStorage();
    var username = memory.getItem("username");
    //console.log(username);
    return { username: username };
  }

  reduce(state, action) {
    //console.dir(state);
    //console.dir(action);
    switch (action.type) {
      case 'app/username':
        return Object.assign({}, state, {
           username: action.username
        });
      default:
        return state;
    }
  }
}

export default new AppStore(dispatcher);
