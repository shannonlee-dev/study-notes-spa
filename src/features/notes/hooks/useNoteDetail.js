import { requireSupabase } from '../../../lib/supabase.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as notesRepository from '../api/notesRepository.js';

export function useNoteDetail(id) {
  const [detail, setDetail] = useState({ id, note: null, loading: true, error: '' });
  const requestGeneration = useRef(0);

  const fetchNote = useCallback(async () => {
    const generation = ++requestGeneration.current;
    setDetail({ id, note: null, loading: true, error: '' });

    try {
      const note = await notesRepository.getNote(requireSupabase(), id);
      if (generation !== requestGeneration.current) return;
      if (String(note.id) !== String(id)) {
        throw new Error('요청한 노트와 응답이 일치하지 않습니다.');
      }
      setDetail({ id, note, loading: false, error: '' });
    } catch (requestError) {
      if (generation !== requestGeneration.current) return;
      setDetail({ id, note: null, loading: false, error: requestError.message });
    }
  }, [id]);

  useEffect(() => {
    fetchNote();
    return () => {
      requestGeneration.current += 1;
    };
  }, [fetchNote]);

  const deleteNote = useCallback(async () => {
    try {
      await notesRepository.deleteNote(requireSupabase(), id);
    } catch (requestError) {
      setDetail((current) =>
        current.id === id ? { ...current, error: requestError.message } : current,
      );
      throw requestError;
    }
  }, [id]);

  const current = detail.id === id ? detail : { note: null, loading: true, error: '' };
  return {
    note: current.note,
    loading: current.loading,
    error: current.error,
    refetch: fetchNote,
    deleteNote,
  };
}
