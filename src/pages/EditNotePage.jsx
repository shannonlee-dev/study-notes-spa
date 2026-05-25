import { useNavigate, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import Loading from '../components/Loading.jsx';
import NoteForm from '../components/NoteForm.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNoteDetail, useNoteMutations } from '../hooks/useNotes.js';

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
  if (error) return <ErrorState message={error} action={<button onClick={refetch}>다시 시도</button>} />;

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
