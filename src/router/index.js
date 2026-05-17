import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Home from '../pages/home.vue'
import Login from '../pages/login.vue'
import CadastroEPI from '../pages/cadastro_EPI.vue'
import RegistroUsuario from '../pages/registro_usuario.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/registrar', component: RegistroUsuario },
  { path: '/cadastro', component: CadastroEPI, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Protege rotas que exigem login
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    return { path: '/login' }
  }
  return true
})

export default router
