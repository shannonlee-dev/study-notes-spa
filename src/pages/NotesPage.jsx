import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Loading from '../components/ui/Loading.jsx';
import NoteList from '../features/notes/components/NoteList.jsx';
import TextInput from '../components/ui/TextInput.jsx';
import { useNotes } from '../features/notes/hooks/useNotes.js';

export default function NotesPage() {
  const { filteredNotes, filter, setFilter, loading, error, refetch } = useNotes();

  return (
    <section className="content-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">목록 조회</p>
          <h2>노트 목록</h2>
        </div>
        <Link to="/notes/new">
          <Button>새 노트</Button>
        </Link>
      </div>

      <TextInput
        id="filter"
        label="필터"
        value={filter}
        placeholder="제목, 내용, 분류로 목록을 좁혀 보세요."
        onChange={setFilter}
      />

      {loading ? <Loading label="노트를 불러오는 중입니다." /> : null}
      {!loading && error ? (
        <ErrorState message={error} action={<Button onClick={refetch}>다시 시도</Button>} />
      ) : null}
      {!loading && !error && filteredNotes.length === 0 ? (
        <EmptyState
          message="등록된 노트가 없거나 필터 조건에 맞는 노트가 없습니다."
          action={
            <Link to="/notes/new">
              <Button variant="secondary">첫 노트 만들기</Button>
            </Link>
          }
        />
      ) : null}
      {!loading && !error && filteredNotes.length > 0 ? <NoteList notes={filteredNotes} /> : null}
    </section>
  );
}
