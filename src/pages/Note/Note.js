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

  handleSearch(options) {
    const note = Object.assign({}, this.state.note, { options });
    this.setState({ note });
  }

  render() {
    const note = this.state.note;
    if (!note || !note.id) return null;
    if (!note.hasOwnProperty('items')) null;

    const items = note.items.filter(item => { 
      if(!item.item.body.hasOwnProperty('ResultSet')) 
        return false;
      const obj = item.item.body.ResultSet.Result;
      if(note.hasOwnProperty('options')) {
        if(!obj.Title.match(note.options.searchString)
          && note.options.searchString !== '') 
          return false;
        if(note.options.bids 
          && Number(obj.Bids) === 0) 
          return false;
        if(note.options.status
          && obj.Status !== 'open') 
          return false;
        if(!note.options.categoryPath.some(path => { 
          return path === obj.CategoryPath; })
          && note.options.categoryPath.length !== 0 )
          return false;
      }
      return true;
    });

    return <div className="page-Note">
      <NoteHeader
        note={note} 
        onChangeStar={this.handleChangeStar.bind(this)} 
        onSearch={this.handleSearch.bind(this)} />
      <NoteBody items={items}/>
    </div>;
  }
}

export default Container.create(Note);
