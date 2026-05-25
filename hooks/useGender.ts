import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Gender } from '@/types';

// Devuelve la forma correcta según el género del usuario
export function g(gender: Gender | undefined | null, feminine: string, masculine: string, neutral?: string): string {
  if (gender === 'female') return feminine;
  if (gender === 'male') return masculine;
  return neutral ?? `${feminine}/${masculine}`;
}

export function useGender() {
  const { user } = useAuth();
  const [gender, setGender] = useState<Gender | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('gender')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.gender) setGender(data.gender as Gender);
      });
  }, [user]);

  return gender;
}
