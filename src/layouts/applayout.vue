<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="logo-area">
        <div class="logo-icon">
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
            <!-- dome -->
            <path d="M5 29 Q5 7 22 7 Q39 7 39 29 Z" fill="white" opacity="0.95"/>
            <!-- brim -->
            <rect x="2" y="29" width="40" height="6" rx="3" fill="white" opacity="0.95"/>
            <!-- inner dome depth -->
            <path d="M10 29 Q10 14 22 13 Q34 14 34 29 Z" fill="rgba(10,22,80,0.18)"/>
            <!-- center rib -->
            <line x1="22" y1="7" x2="22" y2="29" stroke="rgba(10,22,80,0.15)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="logo-wordmark">
          <h1 class="logo-text">EPIra</h1>
          <span class="logo-sub">Gestão de EPIs</span>
        </div>
      </div>

      <div class="divider"></div>

      <nav class="menu">
        <!-- ADM -->
        <template v-if="isAdm">
          <RouterLink to="/applayout/aprovacoes" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-clipboard-check"></i></span>
            <span>Aprovações</span>
          </RouterLink>

          <RouterLink to="/applayout/funcionarios" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-users"></i></span>
            <span>Funcionários</span>
          </RouterLink>

          <RouterLink to="/applayout/cadastro_epi" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-box"></i></span>
            <span>Gestão de EPIs</span>
          </RouterLink>

          <RouterLink to="/applayout/entregas" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-hand-holding"></i></span>
            <span>Entregas / Devoluções</span>
          </RouterLink>

          <RouterLink to="/applayout/relatorios" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-chart-bar"></i></span>
            <span>Relatórios</span>
          </RouterLink>
        </template>

        <!-- FUNCIONÁRIO -->
        <template v-else>
          <RouterLink to="/applayout/solicitar" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-hand-holding-medical"></i></span>
            <span>Solicitar EPI</span>
          </RouterLink>

          <RouterLink to="/applayout/minhas-solicitacoes" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-list-check"></i></span>
            <span>Minhas Solicitações</span>
          </RouterLink>

          <RouterLink to="/applayout/meus-epis" class="menu-item" active-class="active">
            <span class="icon-box"><i class="fas fa-helmet-safety"></i></span>
            <span>Meus EPIs</span>
            <span v-if="alertCount" class="menu-badge">{{ alertCount }}</span>
          </RouterLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="divider"></div>
        <div class="user-box">
          <span class="user-avatar"><i class="fas fa-user"></i></span>
          <div class="user-info">
            <span class="user-name">{{ profile?.nome || profile?.email || 'Usuário' }}</span>
            <span class="user-role" :class="isAdm ? 'role-adm' : 'role-func'">
              {{ isAdm ? 'Administrador' : 'Funcionário' }}
            </span>
          </div>
        </div>
        <button @click="sair" class="botao-sair">
          <span class="icon-box sair-box"><i class="fas fa-sign-out-alt"></i></span>
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <main class="conteudo">
      <!-- Notificação global de validade (apenas funcionário) -->
      <RouterLink
        v-if="!isAdm && alertCount && $route.path !== '/applayout/meus-epis'"
        to="/applayout/meus-epis"
        class="global-alert"
        :class="temVencido ? 'ga-danger' : 'ga-warn'"
      >
        <i :class="temVencido ? 'fas fa-circle-exclamation' : 'fas fa-triangle-exclamation'"></i>
        <span>
          {{ temVencido
            ? `Você tem ${alertCount} EPI(s) com validade vencida ou próxima do vencimento.`
            : `Você tem ${alertCount} EPI(s) próximos do vencimento.` }}
        </span>
        <span class="ga-link">Ver Meus EPIs →</span>
      </RouterLink>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useSupabase } from "../composables/useSupabase";
import { useRouter } from "vue-router";
import { RouterLink, RouterView } from "vue-router";
import { fetchEpisEmPosse, isAlerta, isVencido } from "../composables/useEpiPossession";

const { supabase, profile, isAdm, currentProfile } = useSupabase();
const router = useRouter();

// Alertas de validade dos EPIs em posse do funcionário (para o badge + banner).
const episEmPosse = ref([]);
const alertas = computed(() => episEmPosse.value.filter(isAlerta));
const alertCount = computed(() => alertas.value.length);
const temVencido = computed(() => episEmPosse.value.some(isVencido));

// Evita recarregar para um perfil já carregado (currentProfile() muda
// profile.id e re-dispara o watch, o que duplicaria o fetch).
let perfilCarregado;

async function carregarAlertas() {
  try {
    await currentProfile();
    const perfilId = profile.value?.id ?? null;
    if (perfilId === perfilCarregado) return;
    perfilCarregado = perfilId;
    if (isAdm.value || !profile.value?.id) {
      episEmPosse.value = [];
      return;
    }
    episEmPosse.value = await fetchEpisEmPosse(profile.value.id);
  } catch (e) {
    console.warn("Falha ao carregar alertas de validade:", e?.message || e);
    episEmPosse.value = [];
  }
}

// Carrega na montagem e quando o perfil mudar (login/troca de usuário).
watch(() => profile.value?.id, carregarAlertas, { immediate: true });

async function sair() {
  try {
    await supabase.auth.signOut();
    router.push("/login");
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.shell {
  display: flex;
  height: 100vh;
  background-color: #0a0f1e;
}

/* ── Sidebar ── */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0d1b3e 0%, #0a1628 60%, #060e1f 100%);
  padding: 28px 16px 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  border-right: 1px solid rgba(99, 132, 255, 0.08);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
}

/* ── Logo ── */
.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 20px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b5bdb, #1971c2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(59, 91, 219, 0.5);
  flex-shrink: 0;
  padding: 6px;
}

.logo-svg {
  width: 100%;
  height: 100%;
}

.logo-wordmark {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1;
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

.logo-sub {
  font-size: 10px;
  font-weight: 400;
  color: rgba(165, 180, 252, 0.7);
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* ── Divider ── */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 132, 255, 0.2), transparent);
  margin: 0 4px 16px;
}

/* ── Menu ── */
.menu {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  color: #8a9cc0;
  text-decoration: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
  position: relative;
}

.menu-item:hover {
  background: rgba(99, 132, 255, 0.1);
  color: #c5d0f0;
  transform: translateX(2px);
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(59, 91, 219, 0.25), rgba(59, 91, 219, 0.08));
  color: #a5b4fc;
  font-weight: 600;
  border-left: 3px solid #4f72f5;
  padding-left: 9px;
}

.menu-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
}

.icon-box {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(99, 132, 255, 0.1);
  color: #7c9bdc;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.menu-item:hover .icon-box {
  background: rgba(99, 132, 255, 0.2);
  color: #a5b4fc;
}

.menu-item.active .icon-box {
  background: rgba(79, 114, 245, 0.25);
  color: #6699ff;
}

.sair-box {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.botao-sair:hover .sair-box {
  background: rgba(239, 68, 68, 0.22);
  color: #fca5a5;
}

/* ── Footer / Logout ── */
.sidebar-footer {
  margin-top: 8px;
}

.sidebar-footer .divider {
  margin-bottom: 12px;
}

/* ── Usuário ── */
.user-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 12px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 132, 255, 0.15);
  color: #a5b4fc;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.user-role {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.role-adm  { color: #4ade80; }
.role-func { color: #7c9bdc; }

.botao-sair {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border: none;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.botao-sair:hover {
  background: rgba(239, 68, 68, 0.18);
  color: #fca5a5;
  transform: translateX(2px);
}

.botao-sair:active {
  transform: scale(0.97);
}


/* ── Conteúdo ── */
.conteudo {
  flex-grow: 1;
  margin-left: 260px;
  padding: 32px;
  overflow-y: auto;
  background-color: #0a0f1e;
}

/* ── Banner global de alerta de validade ── */
.global-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px;
  padding: 13px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: filter 0.2s;
}
.global-alert:hover { filter: brightness(1.12); }
.global-alert i { font-size: 18px; flex-shrink: 0; }
.global-alert span:first-of-type { flex: 1; }
.ga-danger { background: rgba(239, 68, 68, 0.12); border: 1.5px solid rgba(239, 68, 68, 0.4); color: #fca5a5; }
.ga-danger i { color: #f87171; }
.ga-warn { background: rgba(245, 158, 11, 0.12); border: 1.5px solid rgba(245, 158, 11, 0.4); color: #fcd34d; }
.ga-warn i { color: #fcd34d; }
.ga-link { font-weight: 700; white-space: nowrap; opacity: 0.9; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar {
    width: 220px;
  }
  .conteudo {
    margin-left: 220px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  .conteudo {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
