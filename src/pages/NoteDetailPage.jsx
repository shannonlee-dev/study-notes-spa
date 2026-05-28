import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Loading from '../components/ui/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNoteDetail } from '../features/notes/hooks/useNotes.js';

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();
  const { note, loading, error, refetch, deleteNote } = useNoteDetail(id);

  async function handleDelete() {
    if (!isAuthenticated) {
      notify('로그인 후 삭제할 수 있습니다.');
      navigate('/login', { state: { from: `/notes/${id}` } });
      return;
    }

    try {
      await deleteNote();
      notify('노트가 삭제되었습니다.');
      navigate('/notes');
    } catch (deleteError) {
      notify(deleteError.message);
    }
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
        {isAuthenticated ? (
          <div className="inline-actions">
            <Link to={`/notes/${id}/edit`}>
              <Button variant="secondary">수정</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        ) : (
          <Link to="/login" state={{ from: `/notes/${id}` }}>
            <Button variant="secondary">로그인</Button>
          </Link>
        )}
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
