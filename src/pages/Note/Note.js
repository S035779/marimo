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
    const items = this.state.items.filter(item => { 
      const isResult = item.item.body.hasOwnProperty('ResultSet');
      if(!isResult) return false;
      const obj = item.item.body.ResultSet.Result;
      if(obj.Title.match(search)) return true; 
      return false;
    });
    const note = search ? Object.assign({}, this.state.note, {items}) : Object.assign({}, this.state.note, this.state.items);
    this.setState({ note });
    //console.log(`search string.. : %s`,search);
    //console.log('item length : %s / %s', this.state.note.items.length, this.state.items.length);
  }

  handleChangeCheckbox(checked) {
    const items = this.state.items.filter(item => { 
      const isResult = item.item.body.hasOwnProperty('ResultSet');
      if(!isResult) return false;
      const obj = item.item.body.ResultSet.Result;
      if(Number(obj.Bids) > 0) return true; 
      return false;
    });
    const note = checked ? Object.assign({}, this.state.note, {items}) : Object.assign({}, this.state.note, this.state.items);
    this.setState({ note });
  }

  handleChangeSelect(checked) {
    const items = this.state.items.filter(item => { 
      const isResult = item.item.body.hasOwnProperty('ResultSet');
      if(!isResult) return false;
      const obj = item.item.body.ResultSet.Result;
      return checked.some(opt => {
        return opt === obj.CategoryPath;
      });
    });
    const note = checked ? Object.assign({}, this.state.note, {items}) : Object.assign({}, this.state.note, this.state.items);
    this.setState({ note });
  }

  render() {
    const note = this.state.note;
    if (!note || !note.id) return null;
    return <div className="page-Note">
      <NoteHeader
        note={note} 
        onChangeStar={this.handleChangeStar.bind(this)} 
        onChangeSearch={this.handleChangeSearch.bind(this)} 
        onChangeCheckbox={this.handleChangeCheckbox.bind(this)}
        onChangeSelect={this.handleChangeSelect.bind(this)} />
      <NoteBody items={note.items}/>
    </div>;
  }
}

export default Container.create(Note);
