export default function EmptyState({ title = '표시할 데이터가 없습니다.', message, action }) {
  return (
    <div className="state state--empty">
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </div>
  );
}
