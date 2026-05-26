import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import TextInput from '../components/TextInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { hasSupabaseConfig } from '../lib/supabase.js';

export default function LoginPage() {
  const { error, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate(location.state?.from || '/notes');
    } catch {
      setSubmitting(false);
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <ErrorState
        title="환경변수가 필요합니다."
        message="VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 등록하면 로그인과 CRUD가 동작합니다."
      />
    );
  }

  return (
    <section className="content-stack narrow">
      <h2>{isAuthenticated ? '로그인됨' : 'Supabase 로그인'}</h2>
      <form className="form-layout" onSubmit={handleSubmit}>
        {error ? <div className="form-alert">{error}</div> : null}
        <TextInput id="email" label="이메일" type="email" value={email} onChange={setEmail} />
        <TextInput
          id="password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
        />
        <Button type="submit" disabled={submitting || !email || !password}>
          {submitting ? '확인 중...' : '로그인'}
        </Button>
      </form>
    </section>
  );
}
