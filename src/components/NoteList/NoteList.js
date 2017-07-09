import React from 'react';
import { Link } from 'react-router';

export default class NoteList extends React.Component {
  // 子要素のレンダリング
  renderItem(note) {
    const classNames = ['NoteList-item'];
    const d = new Date(note.updated);
    const updated = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.toTimeString().split(' ')[0]}`;

    // 選択中の要素に`is-selected`classを付与する
    if (Number(this.props.selectedNoteId) === note.id) {
      classNames.push('is-selected');
    }

    return <li className={classNames.join(' ')} key={note.id}>
      <Link to={`/notes/${note.id}/edit`}>
        <span className="NoteList-title">{note.title}</span>
        <span className="NoteList-category">{note.category}</span>
        <span className="NoteList-updated">{updated}</span>
      </Link>
    </li>;
  }

  // notesを親から受け取ってリストを返す
  render() {
    const items = this.props.notes.map(note => {
      return this.renderItem(note);
    });

    return <div className="NoteList">
      <ul>{items}</ul>
    </div>;
  }
}
