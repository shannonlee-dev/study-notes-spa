import { useNavigate, useParams } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState.jsx';
import Loading from '../components/ui/Loading.jsx';
import NoteForm from '../features/notes/components/NoteForm.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNoteDetail, useNoteMutations } from '../features/notes/hooks/useNotes.js';
import Button from '../components/ui/Button.jsx';

export default function EditNotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { note, loading, error, refetch } = useNoteDetail(id);
  const { updateNote, submitting, error: submitError } = useNoteMutations();

  async function handleSubmit(values) {
    await updateNote(id, values);
    notify('노트가 수정되었습니다.');
    navigate(`/notes/${id}`);
  }

  if (loading) return <Loading label="수정할 노트를 불러오는 중입니다." />;
  if (error) return <ErrorState message={error} action={<Button onClick={refetch}>다시 시도</Button>} />;

  return (
    <section className="content-stack narrow">
      <p className="eyebrow">수정</p>
      <h2>노트 수정</h2>
      <NoteForm
        initialValues={note}
        submitLabel="수정 저장"
        submitting={submitting}
        requestError={submitError}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
