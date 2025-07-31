import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Checklist from '../views/Checklist.vue'
import ChecklistDetail from '../views/ChecklistDetail.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/checklists', component: Checklist },
  { path: '/checklists/:id', component: ChecklistDetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
