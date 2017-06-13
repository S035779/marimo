import React from 'react';
import date from '../../../utils/stdutils';

export default class NoteBody extends React.Component {
  // 子要素のレンダリング
  renderItem(item) {
    const img = item.item.body.ResultSet.Result.Img.Image1.sub;
    const title = item.item.body.ResultSet.Result.Title;
    const url = item.item.body.ResultSet.Result.AuctionItemUrl;
    const price = item.item.body.ResultSet.Result.Price;
    const bids = item.item.body.ResultSet.Result.Bids;
    const status = item.item.body.ResultSet.Result.Status;
    const category = item.item.body.ResultSet.Result.CategoryPath;
    const seller = item.item.body.ResultSet.Result.Seller.Id;
    const startTime = date.getLocalTimeStamp(item.item.body.ResultSet.Result.StartTime);
    const endTime = date.getLocalTimeStamp(item.item.body.ResultSet.Result.EndTime);

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
            <span className='NoteBody-text'>Time : {startTime} ~  {endTime}</span>
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
    const array = this.props.items.filter(item => { 
      if(item.item.body.ResultSet.Result.Bids > 0) return true; 
      return false;
    });
    const items = array.map(item => { return this.renderItem(item)});
    return <div className="NoteBody">
        <ul>{items}</ul>
    </div>;
  }
}
