import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireSupabase } from '../lib/supabase.js';

const TABLE = 'notes';

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

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const client = requireSupabase();
      const { data, error: requestError } = await client
        .from(TABLE)
        .select('id,title,body,category,is_pinned,created_at')
        .order('created_at', { ascending: false });

      if (requestError) throw requestError;
      setNotes((data ?? []).map(normalizeNote));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((note) =>
      [note.title, note.body, note.category].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [filter, notes]);

  const deleteNote = useCallback(
    async (id) => {
      setError('');
      const client = requireSupabase();
      const { error: requestError } = await client.from(TABLE).delete().eq('id', id);

      if (requestError) {
        setError(requestError.message);
        throw requestError;
      }

      await fetchNotes();
    },
    [fetchNotes],
  );

  return {
    notes,
    filteredNotes,
    filter,
    setFilter,
    loading,
    error,
    refetch: fetchNotes,
    deleteNote,
  };
}

export function useNoteDetail(id) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNote = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const client = requireSupabase();
      const { data, error: requestError } = await client
        .from(TABLE)
        .select('id,title,body,category,is_pinned,created_at')
        .eq('id', id)
        .single();

      if (requestError) throw requestError;
      setNote(normalizeNote(data));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const deleteNote = useCallback(async () => {
    const client = requireSupabase();
    const { error: requestError } = await client.from(TABLE).delete().eq('id', id);

    if (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, [id]);

  return { note, loading, error, refetch: fetchNote, deleteNote };
}

export function useNoteMutations() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const createNote = useCallback(async (values) => {
    setSubmitting(true);
    setError('');

    try {
      const client = requireSupabase();
      const { data, error: requestError } = await client
        .from(TABLE)
        .insert({
          title: values.title.trim(),
          body: values.body.trim(),
          category: values.category.trim(),
          is_pinned: values.is_pinned,
        })
        .select('id')
        .single();

      if (requestError) throw requestError;
      return data;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateNote = useCallback(async (id, values) => {
    setSubmitting(true);
    setError('');

    try {
      const client = requireSupabase();
      const { data, error: requestError } = await client
        .from(TABLE)
        .update({
          title: values.title.trim(),
          body: values.body.trim(),
          category: values.category.trim(),
          is_pinned: values.is_pinned,
        })
        .eq('id', id)
        .select('id')
        .single();

      if (requestError) throw requestError;
      return data;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createNote, updateNote, submitting, error };
}
