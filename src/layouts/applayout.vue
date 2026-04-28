<template>
  <div class="shell">
    <aside class="sidebar">
      <!-- Menu de navegação -->
      <!-- RouterLink: links especiais do Vue Router que navegam sem recarregar a página -->
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

    <!-- ===== CONTEÚDO CENTRAL ===== -->
    <!-- Aqui é onde as páginas aparecem (Dashboard, Funcionários, etc.) -->
    <main class="conteudo">
      <!-- RouterView: espaço vazio onde o Vue coloca o componente da rota atual -->
      <!-- Cada rota filha (children) aparece aqui automaticamente -->
      <RouterView />
    </main>
  </div>
</template>

<script setup>
// Importar o router do Vue Router para navegar entre páginas
// useRouter() = permite usar router.push() para ir para outras páginas
import { useRouter } from "vue-router";

// Importar os componentes especiais do Vue Router
// RouterLink = componente que cria links que navegam sem recarregar
// RouterView = componente que mostra o conteúdo da rota atual
import { RouterLink, RouterView } from "vue-router";
</script>