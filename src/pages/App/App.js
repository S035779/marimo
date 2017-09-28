import React from 'react';
import { Container } from 'flux/utils';
import appStore from '../../stores/appStore';
import AppAction from '../../actions/AppAction';
import GlobalHeader from '../../components/GlobalHeader/GlobalHeader';
import { announcePageTitle } from '../../announcer';

class App extends React.Component {
  static getStores() {
    return [appStore];
  }

  static calculateState() {
    return appStore.getState();
  }

  componentDidMount() {
    AppAction.getusername();
  }

  componentDidUpdate(prevProps) {
    const prevPath = prevProps.location.pathname;
    const curtPath = this.props.location.pathname;
    if (prevPath !== curtPath) announcePageTitle();
  }

  render() {
    const username = this.state.username;
    return <div className="page-App">
      <div className="page-App-header" role="header">
        <GlobalHeader username={ username }/>
      </div>
      <div className="page-App-main" role="main">
        {this.props.children}
      </div>
    </div>;
  }
}

export default Container.create(App);
