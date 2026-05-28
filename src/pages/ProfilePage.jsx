import Card from '../components/ui/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="content-stack narrow">
      <p className="eyebrow">보호 라우트</p>
      <h2>프로필</h2>
      <Card>
        <p>현재 로그인 사용자</p>
        <strong>{user.email}</strong>
      </Card>
    </section>
  );
}
