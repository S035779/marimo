import React from 'react';
import StarButton from '../StarButton/StarButton';
import Button from '../Button/Button';
import { browserHistory } from 'react-router';
import date from '../../../utils/stdutils';

export default class NoteHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { search: '' };
  }

  isOwn() {
    const user = this.props.user;
    return this.props.note.user === user;
  }

  handleClickEdit() {
    browserHistory.push(`/notes/${this.props.note.id}/edit`);
  }

  handleClickDelete() {
    if (window.confirm('Are you sure?')) {
      this.props.onDeleteNote();
    }
  }

  handleChangeSearch(e) {
    var search = e.target.value;
    this.setState({search: search});
    if(search) {
      this.props.onChangeSearch(search);
    }
  }

  render() {
    const note = this.props.note;
    const updated = date.getLocalTimeStamp(note.updated);

    return <div className="NoteHeader">
      <h1 className="NoteHeader-title">
        {note.title}
      </h1>
      <h3 className="NoteHeader-category">
        {note.category}
      </h3>
      <div className="NoteHeader-meta">
        <span className="NoteHeader-author">
        <img src="/assets/user.svg" width="24" height="24" /> {note.user} </span>
        <span className="NoteHeader-updated"> {updated} </span>
      </div>
      <div className="NoteHeader-search">
        <span><input ref="search" value={this.state.search} type="text" placeholder="search strings..." onChange={this.handleChangeSearch} /></span>
      </div>
      <div className="NoteHeader-buttons">
        <Button hidden={!this.isOwn()} onClick={() => this.handleClickEdit()}>Edit</Button>
        <StarButton starred={note.starred} onChange={this.props.onChangeStar} />
      </div>
    </div>;
  }
}
