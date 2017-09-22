import React from 'react';
import StarButton from '../StarButton/StarButton';
import Button from '../Button/Button';
import Radio from '../Radio/Radio';
import { browserHistory } from 'react-router';
import std from '../../../utils/stdutils';

export default class NoteHeader extends React.Component {
  constructor(props) {
    super(props);
    const options = {
      searchString:   ''
      , highestPrice: ''
      , lowestPrice:  ''
      , bids:         false
      , condition:    'all'
      , status:       false
      , AuctionID:    []
      , categoryPath: []
      , seller:       []
    };
    this.state = props.note.options != null
      ? Object.assign({}, props.note.options)
      : options;
  }

  isOwn() {
    const user = this.props.user;
    return this.props.note.user === user;
  }

  handleClickEdit() {
    console.log(`[NoteHeaderView] Request: handleClickEdit`);
    this.props.onChangeOptions();
    browserHistory.push(`/notes/${this.props.note.id}/edit`);
  }

  handleClickDelete() {
    console.log(`[NoteHeaderView] Request: handleClickDelete`);
    if (window.confirm('Are you sure?')) {
      this.props.onDeleteNote();
    }
  }

  handleClickSearch(e) {
    console.log(`[NoteHeaderView] Request: handleClickSearch`);
    e.preventDefault();
    this.props.onSearch(this.state);
  }

  handleChangeText(name, e) {
    let newState = {};
    newState[name] = e.target.value;
    this.setState(newState);
  }

  handleChangeCheckbox(name, e) {
    let newState = {};
    newState[name] = e.target.checked;
    this.setState(newState);
  }

  handleChangeRadio(name, e) {
    let newState = {};
    newState[name] = e.target.value;
    this.setState(newState);
  }

  handleChangeSelect(name, e) {
    let newState = {}
    let options = e.target.options;
    let values = [];
    for(var i=0; i<options.length; i++) {
      if(options[i].selected) values.push(options[i].value);
    };
    newState[name] = values;
    this.setState(newState);
  }

  renderOption(objs, prop1, prop2) {
    const len = arguments.length;
    const items = objs.map(function(obj) {
      if(!obj.item.body.hasOwnProperty('ResultSet')) return null;
      return (len === 2)
        ? obj.item.body.ResultSet.Result[prop1]
        : obj.item.body.ResultSet.Result[prop1][prop2];
    });
    const opts = std.dst(items);
    return opts.map(function(opt, idx) {
      return <option
        key={"choice-" + idx} value={opt} >{opt}</option>;
    });
  }

  renderOptions() {
    const optAuIDs = this.renderOption(
      this.props.note.items, 'AuctionID');
    const optPaths = this.renderOption(
      this.props.note.items, 'CategoryPath');
    const optSelrs = this.renderOption(
      this.props.note.items, 'Seller', 'Id');
    return <table width="100%"><tbody>
      <tr><td width="10%">
      <span><label htmlFor="search_string">
      Title :</label></span>
      </td><td>
      <span><input ref="search" 
        value={this.state.searchString} 
        type="text" 
        placeholder="Search string..." 
        onChange={
          this.handleChangeText.bind(this, 'searchString')
        } />
      </span>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_select">
      Category :</label></span>
      </td><td>
      <span><select multiple={true}
        value={this.state.categoryPath}
        onChange={
          this.handleChangeSelect.bind(this, 'categoryPath')
        }>
        {optPaths}
      </select></span>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_select">
      Seller :</label></span>
      </td><td>
      <span><select multiple={true}
        value={this.state.seller}
        onChange={this.handleChangeSelect.bind(this, 'seller')}>
        {optSelrs}
      </select></span>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_select">
      AuctionID :</label></span>
      </td><td>
      <span><select multiple={true}
        value={this.state.AuctionID}
        onChange={
          this.handleChangeSelect.bind(this, 'AuctionID')
        }>
        {optAuIDs}
      </select></span>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_string">
      Price :</label></span>
      </td><td>
      <span><input ref="lowestPrice" 
        value={this.state.lowestPrice} 
        type="text" 
        placeholder="Lowest price" 
        onChange={
          this.handleChangeText.bind(this, 'lowestPrice')
        } /></span>
      <span>yen ~</span>
      <span><input ref="highestPrice" 
        value={this.state.highestPrice} 
        type="text" 
        placeholder="Highest price" 
        onChange={
          this.handleChangeText.bind(this, 'highestPrice')
        } /></span>
      <span>yen</span>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_checks">
      Bids :</label></span>
      </td><td>
      <span><input type="checkbox" 
        value="bids" 
        checked={this.state.bids} 
        onChange={
          this.handleChangeCheckbox.bind(this, 'bids')
        } /></span>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_radios">
      Condition :</label></span>
      </td><td>
      <Radio name="condition"
        value={this.state.condition}
        onChange={
          this.handleChangeRadio.bind(this, 'condition')
        }>
        <option value="all">all</option>
        <option value="new">new</option>
        <option value="used">used</option>
        <option value="other">other</option>
      </Radio>
      </td></tr>
      <tr><td width="10%">
      <span><label htmlFor="search_checks">
      Open :</label></span>
      </td><td>
      <span><input type="checkbox" 
        value="status" 
        checked={this.state.status} 
        onChange={
          this.handleChangeCheckbox.bind(this, 'status')
        } /></span>
      </td></tr>
      </tbody></table>;
  }

  render() {
    const note = this.props.note;
    const updated = std.getLocalTimeStamp(note.updated);

    return <div className="NoteHeader">
      <div className="NoteHeader-title">
      <span className="NoteHeader-titlename">
      {note.title}</span>
      <span className="NoteHeader-category">
      {note.category}</span>
      </div>
      <div className="NoteHeader-meta">
      <span className="NoteHeader-author">
      <img src="/assets/user.svg"
        width="24" height="24" /> {note.user}</span>
      <span className="NoteHeader-updated">{updated}</span>
      </div>
      <div className="NoteHeader-buttons">
      <span><Button onClick={
        this.handleClickSearch.bind(this)
      }>Search</Button></span>
      <span><Button hidden={!this.isOwn()} onClick={
        () => this.handleClickEdit()
      }>Edit</Button></span>
      <StarButton starred={note.starred} onChange={
        this.props.onChangeStar
      } />
      </div>
      <div className="NoteHeader-searchs">{this.renderOptions()}
      </div>
    </div>;
  }
}
