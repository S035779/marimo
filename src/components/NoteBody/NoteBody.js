import React from 'react';
import std from '../../../utils/stdutils';

export default class NoteBody extends React.Component {
  renderStatus(s) {
    switch(s) {
      case 0:
        return 'Now available.'
        break;
      case 1:
        return 'New added.'
        break;
      case 2:
        return 'Removed.'
        break;
      default:
        break;
    }
  };

  // 子要素のレンダリング
  renderItem(item) {
    const isResult = item.item.body.hasOwnProperty('ResultSet');
    if(!isResult) return(null);
    const status        = this.renderStatus(item.status);
    const updated       = std.getLocalTimeStamp(item.updated);
    const obj           = item.item.body.ResultSet.Result;
    const Img           = obj.Img.Image1 
                            ? obj.Img.Image1.sub : '';
    const Url           = obj.AuctionItemUrl;
    const Price         = obj.Price;
    const AuctionID     = obj.AuctionID;
    const CategoryPath  = obj.CategoryPath;
    const Title         = obj.Title;
    const SellerId      = obj.Seller.Id;
    const StartTime     = std.getLocalTimeStamp(obj.StartTime);
    const EndTime       = std.getLocalTimeStamp(obj.EndTime);
    const Bids          = obj.Bids;
    const Condition     = obj.ItemStatus.Condition;
    const Status        = obj.Status;

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
      <span className='NoteBody-text'>{Price}yen</span>
      </td><td width="10%">
      <span className='NoteBody-text'>{Bids}bids</span>
      </td><td width="10%">
      <span className='NoteBody-text'>{Status}</span>
      </td><td width="10%">
      <span className='NoteBody-text'>{status}</span>
      <span className='NoteBody-text'>{updated}</span>
      </td></tr>
      </tbody></table></li>;
  }

  // itemsを親から受け取ってリストを返す
  render() {
    if(!this.props.items) return(null);
    const items = this.props.items.map(item => { return this.renderItem(item)});
    return <div className="NoteBody">
        <ul>{items}</ul>
    </div>;
  }
}
