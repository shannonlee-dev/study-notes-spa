import { requireSupabase } from '../../../lib/supabase.js';
import { useCallback, useEffect, useState } from 'react';
import * as notesRepository from '../api/notesRepository.js';

export function useNoteDetail(id) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNote = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setNote(await notesRepository.getNote(requireSupabase(), id));
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
    try {
      await notesRepository.deleteNote(client, id);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, [id]);

  return { note, loading, error, refetch: fetchNote, deleteNote };
}
