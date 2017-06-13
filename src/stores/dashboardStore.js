import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import str from '../../utils/strutils';

class DashboardStore extends ReduceStore {
  getInitialState() {
    var memory = window.localStorage ||
      (window.UserDataStorage && new str.UserDataStorage()) ||
      new str.CookieStorage();
    var username = memory.getItem("username");
    //console.log(username);
    return { username: username, notes: [], selectedNoteId: null, };
  }

  reduce(state, action) {
    switch (action.type) {
      case 'note/fetch/my':
        return Object.assign({}, state, {
          notes: action.notes,
        });
      case 'note/create':
        return Object.assign({}, state, {
          notes: [action.note, ...state.notes],
        });
      case 'note/update':
        return Object.assign({}, state, {
          notes: state.notes.map(note => {
            return action.id === note.id ? Object.assign({}, note, action.note) : note;
          }),
        });
      case 'note/delete':
        return Object.assign({}, state, {
          notes: state.notes.filter(note => note.id !== action.id),
        });
      case 'note/username':
        return Object.assign({}, state, {
           username: action.username
        });
      default:
        return state;
    }
  }
}

export default new DashboardStore(dispatcher);
