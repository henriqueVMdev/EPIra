<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="logo-area">
        <div class="logo-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <h1 class="logo-text">EPIra</h1>
      </div>

      <div class="divider"></div>

      <nav class="menu">
        <RouterLink to="/applayout/funcionarios" class="menu-item" active-class="active">
          <div class="icon-wrap">
            <i class="fas fa-users"></i>
          </div>
          <span>Funcionários</span>
        </RouterLink>

        <RouterLink to="/applayout/cadastro_epi" class="menu-item" active-class="active">
          <div class="icon-wrap">
            <i class="fas fa-box"></i>
          </div>
          <span>Gestão de EPIs</span>
        </RouterLink>

        <RouterLink to="/applayout/entregas" class="menu-item" active-class="active">
          <div class="icon-wrap">
            <i class="fas fa-truck"></i>
          </div>
          <span>Entregas / Devoluções</span>
        </RouterLink>

        <RouterLink to="/applayout/relatorios" class="menu-item" active-class="active">
          <div class="icon-wrap">
            <i class="fas fa-chart-bar"></i>
          </div>
          <span>Relatórios</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="divider"></div>
        <button @click="sair" class="botao-sair">
          <div class="icon-wrap">
            <i class="fas fa-sign-out-alt"></i>
          </div>
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <main class="conteudo">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useSupabase } from "../composables/useSupabase";
import { useRouter } from "vue-router";
import { RouterLink, RouterView } from "vue-router";

const { supabase } = useSupabase();
const router = useRouter();

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
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b5bdb, #1971c2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 91, 219, 0.45);
  flex-shrink: 0;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
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

.menu-item.active .icon-wrap {
  color: #6699ff;
}

.icon-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 15px;
  flex-shrink: 0;
  transition: background 0.2s;
}

.menu-item:hover .icon-wrap {
  background: rgba(99, 132, 255, 0.12);
}

/* ── Footer / Logout ── */
.sidebar-footer {
  margin-top: 8px;
}

.sidebar-footer .divider {
  margin-bottom: 12px;
}

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
