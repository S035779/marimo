import React from 'react';
import { Container } from 'flux/utils';
import NoteAction from '../../actions/NoteAction';
import starredNotesStore from '../../stores/starredNotesStore';
import StarredNoteList from '../../components/StarredNoteList/StarredNoteList';

class Starred extends React.Component {
  static getStores() {
    return [starredNotesStore];
  }

  static calculateState() {
    return starredNotesStore.getState();
  }

  componentDidMount() {
    NoteAction.fetchStarred();
  }

  render() {
    return <div className="page-Stars">
      <h1>Starred Notes</h1>
      <StarredNoteList notes={this.state.notes} />
    </div>;
  }
}

export default Container.create(Starred);
