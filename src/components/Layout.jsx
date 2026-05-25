import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Button from './Button.jsx';

export default function Layout() {
  const { isAuthenticated, signOut, user } = useAuth();
  const { message, clear } = useToast();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">React SPA Mission</p>
          <h1>Field Notes</h1>
        </div>
        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/">홈</NavLink>
          <NavLink to="/notes">노트</NavLink>
          <NavLink to="/notes/new">등록</NavLink>
          <NavLink to="/profile">프로필</NavLink>
          <NavLink to="/login">{isAuthenticated ? '세션' : '로그인'}</NavLink>
        </nav>
        {isAuthenticated ? (
          <div className="session-box">
            <span>{user.email}</span>
            <Button variant="ghost" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        ) : null}
      </header>

      {message ? (
        <button className="toast" type="button" onClick={clear}>
          {message}
        </button>
      ) : null}

      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  );
}
