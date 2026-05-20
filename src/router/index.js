import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/home.vue'
import login from '../pages/login.vue'
import funcionarios from '../pages/funcionarios.vue'
import cadastro_EPI from '../pages/cadastro_EPI.vue'
import cadastro_user from '../pages/cadastro_user.vue'
import entregas from '../pages/entregas.vue'
import relatorios from '../pages/relatórios.vue'
import applayout from '../layouts/applayout.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: login },
  { path: '/cadastro_user', component: cadastro_user },
  {
    path: '/applayout',
    component: applayout,
    children: [
      { path: 'funcionarios', component: funcionarios },
      { path: 'cadastro_EPI', component: cadastro_EPI },
      { path: 'entregas', component: entregas },
      { path: 'relatorios', component: relatorios }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
export default router
