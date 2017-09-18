import React from 'react';
import { Container } from 'flux/utils';
import NoteAction from '../../actions/NoteAction';
import dashboardStore from '../../stores/dashboardStore';
import Button from '../../components/Button/Button';
import NoteList from '../../components/NoteList/NoteList';

class Dashboard extends React.Component {
  // １．ストアへ自身を登録する
  static getStores() {
    return [dashboardStore];
  }
  // ２．登録が完了したらthis.stateを更新する
  static calculateState() {
    return dashboardStore.getState();
  }
  // ３．マウント後にノートをフェッチする
  componentDidMount() {
    NoteAction.fetchMyNotes();
    NoteAction.getusername();
  }
  // ４．新規作成の場合のハンドラを登録
  handleClickNew() {
    NoteAction.create();
  }
  // ５．選択したidを元にノートを特定し、NoteEditに表示
  render() {
    const { notes, username, selectedNoteId } = this.state;
    console.log('selectedNoteId: ', selectedNoteId);
    const _selectedNoteId = Number(this.props.params.id);
    const selectedNote = notes.find(note => {
      return note.id === _selectedNoteId;
    });
    
    return <div className="page-Dashboard">
      <div className="page-Dashboard-list">
        <div className="page-Dashboard-listHeader">
        <Button onClick={() => this.handleClickNew()}>
          New Note
        </Button>
        </div>
        <div role="navigation">
        <NoteList
          notes={notes}
          selectedNoteId={_selectedNoteId}
        />
        </div>
      </div>
      <div className="page-Dashboard-main" role="form">
      { this.props.children
        ? React.cloneElement( this.props.children
          , { user: username, note: selectedNote })
        : null }
      </div>
    </div>;
  }
}

export default Container.create(Dashboard);
