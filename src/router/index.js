import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/home.vue'
import login from '../pages/login.vue'
import cadastro_EPI from '../pages/cadastro_EPI.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: login },
  {path: '/cadastro_EPI', component: cadastro_EPI}

]

export default createRouter({
  history: createWebHistory(),
  routes
})
