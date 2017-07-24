import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';

class NoteStore extends ReduceStore {
  getInitialState() {
    return { note: null, items: null };
  }

  reduce(state, action) {
    switch (action.type) {
      case 'note/fetch/before':
        return { note: null, items: null };
      case 'note/fetch':
        return { note: action.note, items: action.note.items };
      case 'star/create':
        if (state.id === action.noteId) {
          return { note: Object.assign({}, state.note, { starred: true }), items: state.note.items };
        }
        else {
          return state;
        }
      case 'star/delete':
        if (state.id === action.noteId) {
          return { note: Object.assign({}, state.note, { starred: false }), items: state.note.items };
        }
        else {
          return state;
        }
      default:
        return state;
    }
  }
}

export default new NoteStore(dispatcher);
