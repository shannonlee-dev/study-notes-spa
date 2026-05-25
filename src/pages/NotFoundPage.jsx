import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="페이지를 찾을 수 없습니다."
      message="주소를 확인하거나 노트 목록으로 돌아가세요."
      action={
        <Link to="/notes">
          <Button>목록으로 이동</Button>
        </Link>
      }
    />
  );
}
