import React from 'react';
import { Link } from 'react-router';

export default class GlobalHeader extends React.Component {
  render() {
    return <div className="GlobalHeader">
      <div className="GlobalHeader-inner">
        <h1 className="GlobalHeader-title"><Link to="/">Watch Note</Link></h1>
        <div className="GlobalHeader-menu">
          <span className="GlobalHeader-user">
            <img src="/assets/user.svg" width="16" height="16" />
            <span>{ this.props.username }</span>
          </span>
          <Link to="/starred" className="GlobalHeader-menuItem">Starred</Link>
        </div>
      </div>
    </div>;
  }
}
