import { requireSupabase } from '../../../lib/supabase.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as notesRepository from '../api/notesRepository.js';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setNotes(await notesRepository.listNotes(requireSupabase()));
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
      try {
        await notesRepository.deleteNote(client, id);
      } catch (requestError) {
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
