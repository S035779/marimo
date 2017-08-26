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
      , new: false
      , used: false
      , other: false
      , status: false
      , categoryPath: []
      , seller: []
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

  handleChangeSelect(name, e) {
    let newState = {}
    let options = e.target.options;
    let values = [];
    for(let i=0; i<options.length; i++){
      if(options[i].selected) {
        values.push(options[i].value);
      }
    }
    newState[name] = values;
    this.setState(newState)
  }

  handleChangeSelectSelr(e) {
    let options = e.target.options;
    let values = [];
    for(let i=0; i<options.length; i++){
      if(options[i].selected) {
        values.push(options[i].value);
      }
    }
    this.setState({ seller: values })
  }

  handleSearch(e) {
    e.preventDefault();
    this.props.onSearch(this.state)
  }

  renderOptions() {
    const pathArray = this.props.note.items.map(function(item,i) {
      if(!item.item.body.hasOwnProperty('ResultSet')) return null;
      const obj = item.item.body.ResultSet.Result;
      return obj.CategoryPath;
    });
    const paths = std.dst(pathArray);
    const optPaths = paths.map(function(path,i) {
      return <option
        key={"choice-" + i} value={path} >{path}</option>;
    })

    const selrArray = this.props.note.items.map(function(item,i) {
      if(!item.item.body.hasOwnProperty('ResultSet')) return null;
      const obj = item.item.body.ResultSet.Result;
      return obj.Seller.Id;
    });
    const selrs = std.dst(selrArray);
    const optSelrs = selrs.map(function(seler,i) {
      return <option
        key={"choice-" + i} value={seler} >{seler}</option>;
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
          onChange={this.handleChangeSelect.bind(this, 'categoryPath')}>
          {optPaths}
        </select>
      </span></td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_select">Seller :</label></span>
      </td>
      <td><span>
        <select multiple={true}
          value={this.state.seller}
          onChange={this.handleChangeSelect.bind(this, 'seller')}>
          {optSelrs}
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
          onChange={this.handleChangePrice.bind(this, 'lowestPrice')} /></span>
      <span>yen ~</span>
      <span>
        <input ref="highestPrice" 
          value={this.state.highestPrice} 
          type="text" 
          placeholder="Highest price" 
          onChange={this.handleChangePrice.bind(this, 'highestPrice')} /></span>
      <span>yen</span>
      </td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_checks">Bids :</label>
      </span></td>
      <td>
      <tr><td><span><input type="checkbox" 
          value="bids" 
          checked={this.state.bids} 
          onChange={this.handleChangeCheckbox.bind(this, 'bids')} />
      </span></td></tr>
      </td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_checks">Condition :</label>
      </span></td>
      <td>
      <tr><td><span><input type="checkbox" 
          value="new" 
          checked={this.state.new} 
          onChange={this.handleChangeCheckbox.bind(this, 'new')} />
      </span>
      <span><label htmlFor="condition">new</label></span></td>
      <td><span><input type="checkbox" 
          value="used" 
          checked={this.state.used} 
          onChange={this.handleChangeCheckbox.bind(this, 'used')} />
      </span>
      <span><label htmlFor="condition">used</label></span></td>
      <td><span><input type="checkbox" 
          value="other" 
          checked={this.state.other} 
          onChange={this.handleChangeCheckbox.bind(this, 'other')} />
      </span>
      <span><label htmlFor="condition">other</label></span></td>
      </tr>
      </td></tr>
      <tr><td width="10%"><span>
        <label htmlFor="search_checks">Open :</label>
      </span></td>
      <td>
      <tr><td><span>
        <input type="checkbox" 
          value="status" 
          checked={this.state.status} 
          onChange={this.handleChangeCheckbox.bind(this, 'status')} />
      </span></td></tr>
      </td></tr>
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
