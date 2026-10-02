const TABLE = 'notes';
const COLUMNS = 'id,title,body,category,is_pinned,created_at';

function normalizeNote(note) {
  return {
    id: note.id,
    title: note.title ?? '',
    body: note.body ?? '',
    category: note.category ?? '',
    is_pinned: Boolean(note.is_pinned),
    created_at: note.created_at,
  };
}

export async function listNotes(client) {
  const { data, error } = await client
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeNote);
}

export async function getNote(client, id) {
  const { data, error } = await client
    .from(TABLE)
    .select(COLUMNS)
    .eq('id', id)
    .single();
  if (error) throw error;
  return normalizeNote(data);
}

export async function deleteNote(client, id) {
  const { data, error } = await client.from(TABLE).delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('로그인 후 삭제할 수 있습니다.');
}

function noteValues(values) {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    category: values.category.trim(),
    is_pinned: values.is_pinned,
  };
}

export async function createNote(client, values) {
  const { data, error } = await client
    .from(TABLE)
    .insert(noteValues(values))
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(client, id, values) {
  const { data, error } = await client
    .from(TABLE)
    .update(noteValues(values))
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}
