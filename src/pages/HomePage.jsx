import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function HomePage() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">단일 핵심 데이터 CRUD</p>
        <h2>학습 기록을 원격 데이터로 관리하는 Field Notes</h2>
        <p>
          서비스 주제는 학습 노트 관리이고 핵심 데이터는 Supabase `notes` 테이블입니다.
          입력, 필터, 저장, 삭제 이벤트가 React state와 렌더링 변화로 이어지도록 구성했습니다.
        </p>
        <div className="hero-actions">
          <Link to="/notes">
            <Button>노트 보기</Button>
          </Link>
          <Link to="/notes/new">
            <Button variant="secondary">새 노트</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
