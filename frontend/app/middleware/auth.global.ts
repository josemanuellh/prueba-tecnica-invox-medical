import { useAuthStore } from '../stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore();

    if (process.server) return;

    if (!authStore.isAuthenticated) {
        await authStore.checkAuth();
    }

    const publicPages = ['/login', '/register'];
    const authRequired = !publicPages.includes(to.path);

    // si esta autenticado, lo redirigimos al home sino fuera al login
    if (authRequired && !authStore.isAuthenticated) {
        return navigateTo('/login');
    }

    if (!authRequired && authStore.isAuthenticated) {
        return navigateTo('/');
    }
});
