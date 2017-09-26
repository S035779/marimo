import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';

class NoteStore extends ReduceStore {
  getInitialState() {
    return { note: null };
  }

  reduce(state, action) {
    console.log(`[noteStore] ActionType: ${action.type}`)
    console.log(state);
    console.log(action);
    switch (action.type) {
      case 'note/fetch/before':
        return {
          note: null
        };
      case 'note/fetch':
        return {
          note: action.note
        };
      case 'star/update':
        if (state.note.id === action.id) {
          return {
            note: Object.assign({}, state.note
              , { starred: action.starred })
          };
        } else {
          return state
        }
      case 'note/update/options':
        if (state.note.id === action.id) {
          return {
            note: Object.assign({}, state.note
              , { options: action.options })
          };
        } else {
          return state;
        }
      default:
        return state;
    }
  }
}

export default new NoteStore(dispatcher);
