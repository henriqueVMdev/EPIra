<template>
  <div class="shell">
    <aside class="sidebar">
      <nav class="menu">
        <RouterLink to="/applayout/funcionarios" class="menu-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>Funcionários</span>
        </RouterLink>

        <RouterLink to="/applayout/cadastro" class="menu-item" active-class="active">
          <i class="fas fa-box"></i>
          <span>Cadastro de EPIs</span>
        </RouterLink>

        <RouterLink to="/applayout/movimentacao" class="menu-item" active-class="active">
          <i class="fas fa-chart-bar"></i>
          <span>Entregas</span>
        </RouterLink>

        <RouterLink to="/applayout/relatorios" class="menu-item" active-class="active">
          <i class="fas fa-chart-bar"></i>
          <span>Relatórios</span>
        </RouterLink>
      </nav>
      <button @click="sair" class="botao-sair">
        <i class="fas fa-sign-out-alt"></i>
        <span>Sair</span>
      </button>
    </aside>

    <main class="conteudo">
      <RouterView />
    </main>
  </div>
</template>

<script setup>

import { useRouter } from "vue-router";
import { RouterLink, RouterView } from "vue-router";

const router = useRouter();
router.push("/login"); 
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
  background-color: #ffffff;
}

.sidebar {
  width: 387px;
  background-color: #1e3a5f;
  color: #ffffff;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.logo i {
  font-size: 2px;
}

.menu {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 22px 19px;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 20px;
}

.menu-item:hover {
  background-color: #020108;   
}

.menu-item.active {
  background: #fff4ed;                                                            
  color: #f97316; 
  font-weight: 600;
  border-left: 4px solid #f97316;
  padding-left: 16px;
}

.menu-item i {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.botao-sair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.botao-sair:hover {
  background-color: #f97316;
}

.botao-sair:active {
  transform: scale(0.98);
}

.botao-sair i {
  font-size: 18px;
}

.conteudo {
  flex-grow: 1;
  margin-left: 400px;
  padding: 30px;
  overflow-y: auto;
  background-color: #ffffff;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .conteudo {
    margin-left: 200px;
    padding: 20px;
  }

  .logo {
    font-size: 20px;
    margin-bottom: 30px;
  }

  .menu-item {
    padding: 12px 15px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    position: absolute;
    height: auto;
  }

  .conteudo {
    margin-left: 0;
    padding: 15px;
  }
}
</style>