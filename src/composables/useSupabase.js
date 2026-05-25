import { createClient } from "@supabase/supabase-js";
import { ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const session = ref(null);
const loadingSession = ref(true);

supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.warn("Erro ao buscar sessão:", error.message);
  }
  session.value = data?.session || null;
  loadingSession.value = false;
});

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
});

export function useSupabase() {
  return {
    supabase,
    session,
    loadingSession,
  };
}

