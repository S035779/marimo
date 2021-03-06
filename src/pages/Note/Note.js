import React from 'react';
import { Container } from 'flux/utils';
import NoteHeader from '../../components/NoteHeader/NoteHeader';
import NoteBody from '../../components/NoteBody/NoteBody';
import NoteAction from '../../actions/NoteAction';
import StarAction from '../../actions/StarAction';
import noteStore from '../../stores/noteStore';
import { log } from '../../../utils/webutils';

const pspid = `NoteControleView`;

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
    log.info(`${pspid}> Request: handleChangeStar`);
    const note = Object.assign({}, this.state.note, { starred });
    this.setState({ note });
    if (starred) {
      StarAction.create(note.id);
    }
    else {
      StarAction.delete(note.id);
    }
    log.trace(`${pspid}> starred:`, starred);
  }

  handleChangeSearch(options) {
    log.info(`${pspid}> Request: handleChangeSearch`);
    const note = Object.assign({}, this.state.note, { options });
    this.setState({ note });
    log.trace(`${pspid}> `, options);
  }

  handleChangeOptions() {
    log.info(`${pspid}> Request: handleChangeOptions`);
    const { id, options } = this.state.note;
    NoteAction.updateOptions(id, options);
    log.trace(`${pspid}> options:`, options);
  }

  render() {
    const note = this.state.note;
    if (!note || !note.id) return null;
    if (!note.hasOwnProperty('items')) return null;

    const items = note.items.filter(item => { 
      if(!item.item.body.hasOwnProperty('ResultSet')) 
        return false;
      const obj = item.item.body.ResultSet.Result;
      if(note.options != null) {
        if(!obj.Title.match(note.options.searchString)
          && note.options.searchString !== '') 
          return false;
        if(note.options.bids 
          && Number(obj.Bids) === 0) 
          return false;
        if(note.options.condition !== 'all'
          && note.options.condition !== obj.ItemStatus.Condition)
          return false;
        if(note.options.status
          && obj.Status !== 'open') 
          return false;
        if(!note.options.categoryPath.some(path => { 
          return path === obj.CategoryPath; })
          && note.options.categoryPath.length !== 0 )
          return false;
        if(!note.options.seller.some(selr => { 
          return selr === obj.Seller.Id; })
          && note.options.seller.length !== 0 )
          return false;
        if(!note.options.AuctionID.some(auid => { 
          return auid === obj.AuctionID; })
          && note.options.AuctionID.length !== 0 )
          return false;
        if(!isFinite(note.options.lowestPrice) 
          || !isFinite(note.options.highestPrice))
          return false;
        if(Number(note.options.lowestPrice) > obj.Price 
          && note.options.lowestPrice !== '')
          return false;
        if(Number(note.options.highestPrice) < obj.Price 
          && note.options.highestPrice !== '')
          return false;
      }
      return true;
    });

    return <div className="page-Note">
      <NoteHeader
        note={note} 
        onChangeStar={this.handleChangeStar.bind(this)} 
        onSearch={this.handleChangeSearch.bind(this)}
        onChangeOptions={this.handleChangeOptions.bind(this)}
      />
      <NoteBody items={items}/>
    </div>;
  }
}

export default Container.create(Note);
