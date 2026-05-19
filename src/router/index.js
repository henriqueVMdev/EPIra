import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Home from '../pages/home.vue'
import login from '../pages/login.vue'
import cadastro_EPI from '../pages/cadastro_EPI.vue'
import cadastro_user from '../pages/cadastro_user.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: login },
  { path: '/cadastro_EPI', component: cadastro_EPI },
  { path: '/cadastro_user', component: cadastro_user },
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
