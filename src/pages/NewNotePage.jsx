import { useNavigate } from 'react-router-dom';
import NoteForm from '../features/notes/components/NoteForm.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNoteMutations } from '../features/notes/hooks/useNotes.js';

export default function NewNotePage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { createNote, submitting, error } = useNoteMutations();

  async function handleSubmit(values) {
    const created = await createNote(values);
    notify('새 노트가 저장되었습니다.');
    navigate(`/notes/${created.id}`);
  }

  return (
    <section className="content-stack narrow">
      <p className="eyebrow">등록</p>
      <h2>새 노트 만들기</h2>
      <NoteForm
        submitLabel="저장"
        submitting={submitting}
        requestError={error}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
