import { createRouter, createWebHistory } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
import Home from '../pages/home.vue'
import login from '../pages/login.vue'
import funcionarios from '../pages/funcionarios.vue'
import cadastro_epi from '../pages/cadastro_EPI.vue'
import cadastro_user from '../pages/cadastro_user.vue'
import entregas from '../pages/entregas.vue'
import relatorios from '../pages/relatorios.vue'
import applayout from '../layouts/applayout.vue'
import solicitar_epi from '../pages/solicitar_epi.vue'
import minhas_solicitacoes from '../pages/minhas_solicitacoes.vue'
import meus_epis from '../pages/meus_epis.vue'
import aprovacoes from '../pages/aprovacoes.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: login, meta: { guestOnly: true } },
  { path: '/cadastro_user', component: cadastro_user, meta: { guestOnly: true } },
  {
    path: '/applayout',
    component: applayout,
    meta: { requiresAuth: true },
    children: [
      // Área do ADM
      { path: 'aprovacoes', component: aprovacoes, meta: { role: 'adm' } },
      { path: 'funcionarios', component: funcionarios, meta: { role: 'adm' } },
      { path: 'cadastro_epi', component: cadastro_epi, meta: { role: 'adm' } },
      { path: 'entregas', component: entregas, meta: { role: 'adm' } },
      { path: 'relatorios', component: relatorios, meta: { role: 'adm' } },
      // Área do FUNCIONÁRIO (qualquer usuário logado)
      { path: 'solicitar', component: solicitar_epi },
      { path: 'minhas-solicitacoes', component: minhas_solicitacoes },
      { path: 'meus-epis', component: meus_epis }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guarda de navegação: autenticação + autorização por papel (role).
router.beforeEach(async (to) => {
  const { isAuthenticated, currentProfile, homeRoute } = useSupabase()

  let autenticado = false
  try {
    // Usa o estado já resolvido na inicialização (não chama getSession de novo,
    // que pode travar no navigator lock e deixar a tela em branco).
    autenticado = await isAuthenticated()
  } catch (e) {
    console.error('[EPIra] Erro ao verificar sessão no guard:', e)
    // Em caso de falha, deixa seguir para não travar a navegação.
    return true
  }

  // Usuário logado não acessa login/cadastro: manda para a home do papel.
  if (to.meta.guestOnly && autenticado) {
    const prof = await currentProfile()
    return homeRoute(prof?.role)
  }

  // Rota protegida sem login: vai para o login.
  if (to.meta.requiresAuth && !autenticado) {
    return { path: '/login' }
  }

  if (autenticado) {
    // /applayout puro → redireciona para a home do papel.
    if (to.path === '/applayout' || to.path === '/applayout/') {
      const prof = await currentProfile()
      return homeRoute(prof?.role)
    }

    // Rota exige papel específico (ex.: adm) que o usuário não tem.
    if (to.meta.role) {
      const prof = await currentProfile()
      if (prof?.role !== to.meta.role) {
        return homeRoute(prof?.role)
      }
    }
  }

  return true
})

export default router
