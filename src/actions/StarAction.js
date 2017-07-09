import { dispatch } from '../dispatcher';
import NoteApiClient from '../services/NoteApiClient';

export default {
  create(noteId) {
    return NoteApiClient.createStar(noteId).then(() => {
      dispatch({ type: 'star/create', noteId });
    });
  },

  delete(noteId) {
    return NoteApiClient.deleteStar(noteId).then(noteId => {
      dispatch({ type: 'star/delete', noteId });
    });
  },
};
