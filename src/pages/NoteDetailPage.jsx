import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loading from '../components/Loading.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNoteDetail } from '../hooks/useNotes.js';

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { note, loading, error, refetch, deleteNote } = useNoteDetail(id);

  async function handleDelete() {
    await deleteNote();
    notify('노트가 삭제되었습니다.');
    navigate('/notes');
  }

  if (loading) return <Loading label="상세 노트를 불러오는 중입니다." />;

  if (error) {
    return <ErrorState message={error} action={<Button onClick={refetch}>다시 시도</Button>} />;
  }

  return (
    <section className="content-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">상세 조회</p>
          <h2>{note.title}</h2>
        </div>
        <div className="inline-actions">
          <Link to={`/notes/${id}/edit`}>
            <Button variant="secondary">수정</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>

      <Card>
        <div className="card-header">
          <Badge tone={note.is_pinned ? 'accent' : 'neutral'}>{note.category}</Badge>
          <time>{new Date(note.created_at).toLocaleString('ko-KR')}</time>
        </div>
        <p className="note-body">{note.body}</p>
      </Card>
    </section>
  );
}
