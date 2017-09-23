import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';

class NoteStore extends ReduceStore {
  getInitialState() {
    return { note: null };
  }

  reduce(state, action) {
    switch (action.type) {
      case 'note/fetch/before':
        return { note: null };
      case 'note/fetch':
        return { note: action.note };
      case 'star/update':
        if (state.id === action.id) {
          return {
             note: Object.assign({}, state.note, action.starred )
          };
        } else { return state }
      case 'note/update/options':
        if (state.id === action.id) {
          return {
             note: Object.assign({}
             , state.note, action.options) };
        } else { return state; }
      default:
        return state;
    }
  }
}

export default new NoteStore(dispatcher);
