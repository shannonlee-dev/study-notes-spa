export function validateNote(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = '제목을 입력하세요.';
  }

  if (!values.body.trim()) {
    errors.body = '내용을 입력하세요.';
  }

  if (!values.category.trim()) {
    errors.category = '분류를 입력하세요.';
  }

  return errors;
}
