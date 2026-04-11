import type { RouteRecordRaw } from 'vue-router';
import { makePageTitle } from '../constants/app';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: makePageTitle() },
      },
      {
        path: 'sessions',
        component: () => import('pages/HomePage.vue'),
        meta: { title: makePageTitle('Sessions') },
      },
      {
        path: 'sessions/new',
        component: () => import('pages/NewSessionPage.vue'),
        meta: { title: makePageTitle('New Session') },
      },
      {
        path: 'sessions/:id',
        component: () => import('pages/SessionPage.vue'),
        meta: { title: makePageTitle('Session') },
      },
      {
        path: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { title: makePageTitle('Settings') },
      },
      {
        path: 'auth',
        component: () => import('pages/AuthForm.vue'),
        meta: { title: makePageTitle('Sign In') },
      },
      {
        path: 'auth/callback',
        component: () => import('pages/AuthCallbackPage.vue'),
        meta: { title: makePageTitle('Callback') },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: makePageTitle('Not Found') },
  },
];

export default routes;
