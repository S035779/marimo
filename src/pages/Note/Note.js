import React from 'react';
import { Container } from 'flux/utils';
import NoteHeader from '../../components/NoteHeader/NoteHeader';
import NoteBody from '../../components/NoteBody/NoteBody';
import NoteAction from '../../actions/NoteAction';
import StarAction from '../../actions/StarAction';
import noteStore from '../../stores/noteStore';

class Note extends React.Component {
  static getStores() {
    return [noteStore];
  }

  static calculateState() {
    return noteStore.getState();
  }

  componentDidMount() {
    NoteAction.fetch(Number(this.props.params.id));
  }

  handleChangeStar(starred) {
    const note = Object.assign({}, this.state.note, { starred });
    this.setState({ note });

    if (starred) {
      StarAction.create(note.id);
    }
    else {
      StarAction.delete(note.id);
    }
  }

  handleChangeSearch(search) {
    const items = this.state.note.items.filter(item => { 
      if(bids > 0) return true; 
      return false;
    });
    this.setState({ note });
  }

  render() {
    const note = this.state.note;
    if (!note || !note.id) return null;

    return <div className="page-Note">
      <NoteHeader note={note} onChangeStar={this.handleChangeStar.bind(this)} onChangeSearch={this.handleChangeSearch.bind(this)} />
      <NoteBody items={note.items}/>
    </div>;
  }
}

export default Container.create(Note);
