import { createRouter, createWebHistory } from 'vue-router'
import home from '../pages/home.vue'
import login from '../pages/login.vue'
import funcionarios from '../pages/funcionarios.vue'
import cadastro from '../pages/cadastro_epi.vue'
import entregas from '../pages/entregas.vue'
import relatorios from '../pages/relatórios.vue'
import applayout from '../layouts/applayout.vue'

const routes = [
  { path: '/', component: home },
  { path: '/login', component: login },
  {
    path: '/applayout',
    component: applayout,
    children: [
      { path: 'funcionarios', component: funcionarios },
      { path: 'cadastro', component: cadastro },
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