import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import str from '../../utils/strutils';

class AppStore extends ReduceStore {
  getInitialState() {
    var memory = window.localStorage ||
      (window.UserDataStorage && new str.UserDataStorage()) ||
      new str.CookieStorage();
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
