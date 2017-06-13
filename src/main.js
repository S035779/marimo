import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import App from './pages/App/App';
import Dashboard from './pages/Dashboard/Dashboard';
import Note from './pages/Note/Note';
import NoteEdit from './pages/Dashboard/NoteEdit/NoteEdit';
import Starred from './pages/Starred/Starred';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route component={App}>
      <Route path="/" component={Dashboard}>
        <Route path="notes/:id/edit" component={NoteEdit} />
      </Route>
      <Route path="notes/:id" component={Note} />
      <Route path="starred" component={Starred} />
    </Route>
  </Router>
), document.getElementById('app'));
