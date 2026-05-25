import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';
import Card from './Card.jsx';

export default function NoteList({ notes }) {
  return (
    <div className="note-grid">
      {notes.map((note) => (
        <Card key={note.id}>
          <div className="card-header">
            <Badge tone={note.is_pinned ? 'accent' : 'neutral'}>
              {note.is_pinned ? 'Pinned' : note.category}
            </Badge>
            <time>{new Date(note.created_at).toLocaleDateString('ko-KR')}</time>
          </div>
          <h2>{note.title}</h2>
          <p>{note.body}</p>
          <Link className="text-link" to={`/notes/${note.id}`}>
            상세 보기
          </Link>
        </Card>
      ))}
    </div>
  );
}
