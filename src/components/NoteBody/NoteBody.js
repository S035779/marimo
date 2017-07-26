import React from 'react';
import std from '../../../utils/stdutils';

export default class NoteBody extends React.Component {
  // 子要素のレンダリング
  renderItem(item) {
    const isResult = item.item.body.hasOwnProperty('ResultSet');
    if(!isResult) return(null);
    const obj       = item.item.body.ResultSet.Result;
    const img       = obj.Img.Image1 ? obj.Img.Image1.sub : '';
    const title     = obj.Title;
    const url       = obj.AuctionItemUrl;
    const price     = obj.Price;
    const status    = obj.Status;
    const category  = obj.CategoryPath;
    const seller    = obj.Seller.Id;
    const startTime = std.getLocalTimeStamp(obj.StartTime);
    const endTime   = std.getLocalTimeStamp(obj.EndTime);
    const bids      = obj.Bids;

    return <li className='NoteBody-item' key={item.auctionID}>
        <table width="100%">
        <tbody>
        <tr>
          <td width="10%">
            <div className='NoteNody-image'>
            <img src={img} className='NoteBody-image' width='128' height='128' />
            </div>
          </td>
          <td width="60%">
            <span className='NoteBody-title'>
            <a href={url} target='_blank'>{title}</a>
            </span>
            <span className='NoteBody-text'>Time : {startTime} ~ {endTime}</span>
            <span className='NoteBody-text'>Seller : {seller}</span>
            <span className='NoteBody-text'>Category : {category}</span>
          </td>
          <td width="10%">
            <span className='NoteBody-text'>{price}yen</span>
          </td>
          <td width="10%">
            <span className='NoteBody-text'>{bids}bids</span>
          </td>
          <td width="10%">
            <span className='NoteBody-text'>{status}</span>
          </td>
        </tr>
        </tbody>
        </table>
      </li>;
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
