import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import EnhancePage from '../views/EnhancePage/EnhancePage.vue'
import FilterPage from '../views/FilterPage/FilterPage.vue'
import HomePage from '../views/HomePage/HomePage.vue'
import InputPage from '../views/InputPage/InputPage.vue'
import InputPageNew from '../views/InputPageNew/InputPageNew.vue'
import OutputPage from '../views/OutputPage/OutputPage.vue'
import PreviewPage from '../views/PreviewPage/PreviewPage.vue'
import RenderPage from '../views/RenderPage/RenderPage.vue'
import TaskPage from '../views/TaskPage/TaskPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/input',
    name: 'InputPage',
    component: InputPage,
  },
  {
    path: '/enhance',
    name: 'EnhancePage',
    component: EnhancePage,
  },
  {
    path: '/filter',
    name: 'FilterPage',
    component: FilterPage,
  },
  {
    path: '/output',
    name: 'OutputPage',
    component: OutputPage,
  },
  {
    path: '/render',
    name: 'RenderPage',
    component: RenderPage,
  },
  {
    path: '/preview',
    name: 'PreviewPage',
    component: PreviewPage,
  },
  {
    path: '/input-new',
    name: 'InputPageNew',
    component: InputPageNew,
  },
  {
    path: '/tasks',
    name: 'TaskPage',
    component: TaskPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
