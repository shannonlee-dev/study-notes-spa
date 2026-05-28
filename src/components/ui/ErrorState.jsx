export default function ErrorState({ title = '요청에 실패했습니다.', message, action }) {
  return (
    <div className="state state--error" role="alert">
      <strong>{title}</strong>
      <p>{message || '잠시 후 다시 시도하세요.'}</p>
      {action}
    </div>
  );
}
