import React from 'react';
import StarButton from '../StarButton/StarButton';
import Button from '../Button/Button';
import { browserHistory } from 'react-router';
import date from '../../../utils/stdutils';

export default class NoteHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      search: '' 
      , checked: true
      , options: []
    };
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
    this.setState({search: e.target.value});
    this.props.onChangeSearch(e.target.value);
  }

  handleChangeCheckbox(e) {
    this.setState({ checked: e.target.checked });
    this.props.onChangeCheckbox(e.target.checked);
  }

  handleChangeSelect(e) {
    let checked = [];
    let sel = e.target;
    for(let i=0; i<sel.length; i++){
      let option = sel.options[i];
      if(option.selected) {
        checked.push(option.value);
      }
    }
    this.setState({ options: checked })
    this.props.onChangeSelect(checked);
  }

  handleSearch(e) {
    e.preventDefault();
  }

  renderOptions() {
    return this.props.note.items.map( function(item,i) {
      const isResult = item.item.body.hasOwnProperty('ResultSet');
      if(!isResult) return null;
      const obj = item.item.body.ResultSet.Result;
      return <option
        key={"choice" + i}
        value={item.item.body.ResultSet.Result.CategoryPath}
        >{obj.CategoryPath}</option>
    }, this);
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
        <span>
          <label htmlFor="search_string">search string: </label>
          <input ref="search" 
            value={this.state.search} 
            type="text" 
            placeholder="search string" 
            onChange={this.handleChangeSearch.bind(this)} />
        </span>
        <span>
          <br />
          <label htmlFor="search_checks"> with bidding: </label>
          <input type="checkbox" 
            value="bids" 
            checked={this.state.checked} 
            onChange={this.handleChangeCheckbox.bind(this)} />
        </span>
        <span>
          <br />
          <label htmlFor="search_select">category selection: </label>
          <select multiple="true" 
            value={this.state.options}
            onChange={this.handleChangeSelect.bind(this)}>
            {this.renderOptions()}
          </select>
        </span>
      </div>
      <div className="NoteHeader-buttons">
        <span><Button
          onClick={this.handleSearch}>Search</Button> 
        </span>
        <span><Button hidden={!this.isOwn()}
          onClick={() => this.handleClickEdit()}>Edit</Button>
        </span>
        <StarButton
          starred={note.starred}
          onChange={this.props.onChangeStar} />
      </div>
    </div>;
  }
}
