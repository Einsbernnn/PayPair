import type { RouteRecordRaw } from 'vue-router';
import { makePageTitle } from '../constants/app';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'index', component: () => import('pages/IndexPage.vue'), meta: { title: makePageTitle() } },
      { path: 'auth', component: () => import('pages/AuthForm.vue'), meta: { title: makePageTitle('Auth') } },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: makePageTitle('Not Found') },
  },
];

export default routes;
