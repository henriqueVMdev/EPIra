


import { createClient } from "@supabase/supabase-js";
import { ref, computed } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[EPIra] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. " +
      "Verifique o arquivo .env e reinicie o `npm run dev`."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Desliga o navigator lock do supabase-js v2. Em alguns navegadores/abas
    // ele trava (deadlock) dentro de getSession(): o guard de rota fica
    // esperando pra sempre, o RouterView nunca recebe componente e a tela
    // fica "em branco"/escura sem conteúdo e sem erro no console.
    // Este passthrough apenas executa a função, sem tentar adquirir o lock.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});

const session = ref(null);
const loadingSession = ref(true);
const profile = ref(null);

const isAdm = computed(() => profile.value?.role === "adm");

async function loadProfile() {
  if (!session.value) {
    profile.value = null;
    return null;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, cpf, cargo, role")
    .eq("id", session.value.user.id)
    .maybeSingle();
  if (error) {
    console.warn("Erro ao carregar perfil:", error.message);
    profile.value = null;
  } else {
    profile.value = data;
  }
  return profile.value;
}

// Promise que resolve quando a sessão + perfil iniciais terminam de carregar.
// O finally garante que NUNCA fique pendente (senão os guards de rota travam
// e a página fica em branco).
let resolveReady;
const ready = new Promise((r) => (resolveReady = r));

async function initSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.warn("Erro ao buscar sessão:", error.message);
    session.value = data?.session || null;
    await loadProfile();
  } catch (e) {
    console.warn("Falha ao inicializar sessão:", e?.message || e);
  } finally {
    loadingSession.value = false;
    resolveReady();
  }
}
initSession();

// Rede de segurança: se a inicialização travar (deadlock de lock, rede presa),
// libera os guards mesmo assim depois de 4s para não deixar a tela em branco.
setTimeout(() => {
  if (loadingSession.value) {
    console.warn("[EPIra] initSession demorou demais; liberando navegação.");
    loadingSession.value = false;
    resolveReady();
  }
}, 4000);

supabase.auth.onAuthStateChange(async (_event, newSession) => {
  session.value = newSession;
  try {
    await loadProfile();
  } catch (e) {
    console.warn("Falha ao carregar perfil:", e?.message || e);
  }
});

// Usado pelos guards de rota: garante que sessão/perfil estejam resolvidos.
async function currentProfile() {
  await ready;
  if (session.value && !profile.value) await loadProfile();
  return profile.value;
}

// Estado de autenticação já resolvido (sem chamar getSession de novo, que pode
// travar). Os guards usam isto para decidir a navegação.
async function isAuthenticated() {
  await ready;
  return !!session.value;
}

// Rota inicial conforme o papel do usuário.
function homeRoute(role = profile.value?.role) {
  return role === "adm" ? "/applayout/aprovacoes" : "/applayout/solicitar";
}

export function useSupabase() {
  return {
    supabase,
    session,
    loadingSession,
    profile,
    isAdm,
    loadProfile,
    currentProfile,
    isAuthenticated,
    homeRoute,
  };
}
