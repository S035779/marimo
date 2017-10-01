import React from 'react';
import Sparkline from '../Sparkline/Sparkline';
import std from '../../../utils/stdutils';

export default class NoteBody extends React.Component {
  renderStatus(s) {
    var styles;
    switch(s) {
      case 0:
        styles = { fontWeight:'bold', color: 'blue' };
        return <div style={styles}>Now available.</div>;
      case 1:
        styles = { fontWeight:'bold', color: 'orange' };
        return <div style={styles}>New added.</div>;
      case 2:
        styles = { fontWeight:'bold', color: 'red' };
        return <div style={styles}>Removed.</div>;
    }
  };

  renderExtension() {
    return <div>with<br />Auto Extension</div>;
  }

  // 子要素のレンダリング
  renderItem(item) {
    const Itm = item.item.body;
    const Bid = item.bids.body;

    if(!Itm.hasOwnProperty('ResultSet')) return(null);

    const itm          = item.item.body.ResultSet.Result;
    const Img          = itm.Img.Image1 ? itm.Img.Image1.sub : '';
    const Url          = itm.AuctionItemUrl;
    const Price        = parseInt(itm.Price,10).toLocaleString();
    const AuctionID    = itm.AuctionID;
    const CategoryPath = itm.CategoryPath;
    const Title        = itm.Title;
    const SellerId     = itm.Seller.Id;
    const StartTime    = std.getLocalTimeStamp(itm.StartTime);
    const EndTime      = std.getLocalTimeStamp(itm.EndTime);
    const Bids         = itm.Bids;
    const Condition    = itm.ItemStatus.Condition;
    const Status       = itm.Status;

    let prices = [];
    if(Bid.hasOwnProperty('ResultSet')) {
       if(Bid.ResultSet.hasOwnProperty('Result')) {
         const root = Bid.ResultSet.root;
         const bids = Bid.ResultSet.Result;
         if(root.totalResultsAvailable === '1')
           prices[0] = parseInt(bids.Price.sub,10);
         else
           prices = bids.map(obj => parseInt(obj.Price.sub,10));
       }
    }

    const status    = this.renderStatus(item.status);
    const extend    = itm.IsAutomaticExtension === 'true'
                      ? this.renderExtension() : '';
    const updated   = std.getLocalTimeStamp(item.updated);

    console.log(itm.IsAutomaticExtension);

    return <li className='NoteBody-item' key={item.auctionID}>
      <table width="100%"><tbody>
      <tr><td width="10%">
      <div className='NoteNody-image'>
      <img src={Img} 
        className='NoteBody-image' width='128' height='128' />
      </div>
      </td><td width="40%">
      <span className='NoteBody-title'>
      <a href={Url} target='_blank'>{Title}</a></span>
      <span className='NoteBody-text'>
        Bid period : {StartTime} ~ {EndTime}<br />
        Condition : {Condition}<br />
        Seller : {SellerId}<br />
        AuctionID : {AuctionID}<br />
        Category : {CategoryPath}<br />
      </span>
      </td><td width="10%">
      <Sparkline points={prices}/>
      </td><td width="10%">
      <span className='NoteBody-text'>{Price} yen</span>
      <span className='NoteBody-text'>({Bids} bids)</span>
      </td><td width="10%">
      <span className='NoteBody-text'>{Status}</span>
      <span className='NoteBody-text'>{extend}</span>
      </td><td width="10%">
      <span className='NoteBody-text'>{status}</span>
      <span className='NoteBody-text'>{updated}</span>
      </td></tr>
      </tbody></table></li>;
  }

  // itemsを親から受け取ってリストを返す
  render() {
    if(!this.props.items) return(null);
    const items =
      this.props.items.map(item => this.renderItem(item));
    return <div className="NoteBody">
        <ul>{items}</ul>
    </div>;
  }
}
