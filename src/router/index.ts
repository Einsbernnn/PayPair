import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { APP_NAME } from '../constants/app';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to) => {
    const { useAuthStore } = await import('src/stores/useAuthStore');
    const authStore = useAuthStore();

    console.log(
      '[Guard] navigating to:',
      to.fullPath,
      'public:',
      !!to.meta.public,
      'initialized:',
      authStore.initialized,
      'isLoggedIn:',
      authStore.isLoggedIn,
    );

    // Wait for auth to initialize on first load
    if (authStore.user === null && !authStore.initialized) {
      console.log('[Guard] waiting for auth init...');
      await authStore.init();
      console.log('[Guard] auth init done, isLoggedIn:', authStore.isLoggedIn);
    }

    // If route is not public and user is not logged in, redirect to /auth
    if (!to.meta.public && !authStore.isLoggedIn) {
      console.log('[Guard] not logged in, redirecting to /auth');
      return { path: '/auth', query: { redirect: to.fullPath } };
    }

    // If user is logged in and tries to go to /auth, send them home
    if (to.path === '/auth' && authStore.isLoggedIn) {
      console.log('[Guard] already logged in, redirecting away from /auth');
      return { path: '/' };
    }
  });

  Router.afterEach((to) => {
    const title = typeof to.meta.title === 'string' ? to.meta.title : APP_NAME;
    document.title = title;
  });

  return Router;
});
