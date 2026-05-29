import { useMemo, useState } from 'react';
import { validateNote } from '../../../lib/validation.js';
import Button from '../../../components/ui/Button.jsx';
import TextArea from '../../../components/ui/TextArea.jsx';
import TextInput from '../../../components/ui/TextInput.jsx';

const emptyValues = {
  title: '',
  body: '',
  category: '',
  is_pinned: false,
};

export default function NoteForm({ initialValues = emptyValues, submitLabel, submitting, requestError, onSubmit }) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues }); /* 초기값과 빈값을 병합하여 누락된 필드가 없도록 함 */
  const [errors, setErrors] = useState({});

  const preview = useMemo(
    () => ({
      title: values.title.trim() || '제목 미리보기',
      body: values.body.trim() || '내용을 입력하면 이 영역이 바로 바뀝니다.',
    }),
    [values.body, values.title],
  );

  function updateField(field, nextValue) {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateNote(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(values);
  }

  return (
    <form className="form-layout" onSubmit={handleSubmit}>
      {requestError ? (
        <div className="form-alert" role="alert">
          {requestError}
        </div>
      ) : null}

      <TextInput
        id="note-title"
        label="제목"
        value={values.title}
        error={errors.title}
        placeholder="예: 이번 주 학습 회고"
        onChange={(nextValue) => updateField('title', nextValue)}
      />
      <TextInput
        id="note-category"
        label="분류"
        value={values.category}
        error={errors.category}
        placeholder="예: React"
        onChange={(nextValue) => updateField('category', nextValue)}
      />
      <TextArea
        id="note-body"
        label="내용"
        value={values.body}
        error={errors.body}
        placeholder="배운 내용과 다음 행동을 기록하세요."
        onChange={(nextValue) => updateField('body', nextValue)}
      />
      <label className="check-row">
        <input
          type="checkbox"
          checked={values.is_pinned}
          onChange={(event) => updateField('is_pinned', event.target.checked)}
        />
        중요한 노트로 고정
      </label>

      <div className="preview-panel">
        <span>입력 미리보기</span>
        <strong>{preview.title}</strong>
        <p>{preview.body}</p>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel}
      </Button>
    </form>
  );
}
