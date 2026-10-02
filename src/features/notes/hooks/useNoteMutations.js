import { requireSupabase } from '../../../lib/supabase.js';
import { useCallback, useState } from 'react';
import * as notesRepository from '../api/notesRepository.js';

export function useNoteMutations() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const createNote = useCallback(async (values) => {
    setSubmitting(true);
    setError('');

    try {
      return await notesRepository.createNote(requireSupabase(), values);
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
      return await notesRepository.updateNote(requireSupabase(), id, values);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createNote, updateNote, submitting, error };
}
