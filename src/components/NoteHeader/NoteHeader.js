import React from 'react';
import StarButton from '../StarButton/StarButton';
import Button from '../Button/Button';
import { browserHistory } from 'react-router';
import std from '../../../utils/stdutils';

export default class NoteHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      searchString: '' 
      , highestPrice: ''
      , lowestPrice: ''
      , bids: false
      , status: false
      , categoryPath: []
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
    this.setState({ searchString: e.target.value });
  }

  handleChangePrice(name, e) {
    let newState = {};
    newState[name] = e.target.value;
    this.setState(newState);
  }

  handleChangeCheckbox(name, e) {
    let newState = {};
    newState[name] = e.target.checked;
    this.setState(newState);
  }

  handleChangeSelect(e) {
    let options = e.target.options;
    let values = [];
    for(let i=0; i<options.length; i++){
      if(options[i].selected) {
        values.push(options[i].value);
      }
    }
    this.setState({ categoryPath: values })
  }

  handleSearch(e) {
    e.preventDefault();
    this.props.onSearch(this.state)
  }

  renderOptions() {
    const array = this.props.note.items.map(function(item,i) {
      if(!item.item.body.hasOwnProperty('ResultSet')) return null;
      const obj = item.item.body.ResultSet.Result;
      return obj.CategoryPath;
    });
    const categoryPaths = std.dst(array);
    const options = categoryPaths.map(function(path,i) {
      return <option
        key={"choice-" + i} value={path} >{path}</option>;
    })

    return <table width="100%"><tbody>
      <tr><td width="10%"><span>
        <label htmlFor="search_string">Title :</label>
      </span></td>
      <td><span>
        <input ref="search" 
          value={this.state.searchString} 
          type="text" 
          placeholder="Search string..." 
          onChange={this.handleChangeSearch.bind(this)} />
      </span></td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_select">Category :</label></span>
      </td>
      <td><span>
        <select multiple={true}
          value={this.state.categoryPath}
          onChange={this.handleChangeSelect.bind(this)}>
          {options}
        </select>
      </span></td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_string">Price :</label>
      </span></td>
      <td><span>
        <input ref="lowestPrice" 
          value={this.state.lowestPrice} 
          type="text" 
          placeholder="Lowest price" 
          onChange={this.handleChangePrice.bind(this, 'lowestPrice')} />yen ~&nbsp;
        <input ref="highestPrice" 
          value={this.state.highestPrice} 
          type="text" 
          placeholder="Highest price" 
          onChange={this.handleChangePrice.bind(this, 'highestPrice')} />yen
      </span></td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_checks">Bids :</label>
      </span></td>
      <td><span>
        <input type="checkbox" 
          value="bids" 
          checked={this.state.bids} 
          onChange={this.handleChangeCheckbox.bind(this, 'bids')} />
      </span></td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_checks">Open :</label>
      </span></td>
      <td><span>
        <input type="checkbox" 
          value="status" 
          checked={this.state.status} 
          onChange={this.handleChangeCheckbox.bind(this, 'status')} />
      </span></td></tr>
      </tbody></table>;
  }

  render() {
    const note = this.props.note;
    const updated = std.getLocalTimeStamp(note.updated);

    return <div className="NoteHeader">
      <div className="NoteHeader-title">
        <span className="NoteHeader-titlename">{note.title}</span>
        <span className="NoteHeader-category">{note.category}</span>
      </div>
      <div className="NoteHeader-meta">
        <span className="NoteHeader-author">
        <img src="/assets/user.svg" width="24" height="24" /> {note.user}</span>
        <span className="NoteHeader-updated">{updated}</span>
      </div>
      <div className="NoteHeader-buttons">
        <span><Button
          onClick={this.handleSearch.bind(this)}>Search</Button> 
        </span>
        <span><Button hidden={!this.isOwn()}
          onClick={() => this.handleClickEdit()}>Edit</Button>
        </span>
        <StarButton
          starred={note.starred}
          onChange={this.props.onChangeStar} />
      </div>
      <div className="NoteHeader-searchs">
        {this.renderOptions()}
      </div>
    </div>;
  }
}
