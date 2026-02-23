import { defineStore } from 'pinia';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { navigateTo } from 'nuxt/app';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        session: null as any,
        isAuthenticated: false,
    }),
    actions: {
        async checkAuth() {
            try {
                const user = await getCurrentUser();
                const session = await fetchAuthSession();
                this.user = user;
                this.session = session;
                this.isAuthenticated = true;
            } catch (error) {
                this.user = null;
                this.session = null;
                this.isAuthenticated = false;
            }
        },
        async logout() {
            try {
                await signOut();
                this.user = null;
                this.session = null;
                this.isAuthenticated = false;
                navigateTo('/login');
            } catch (error) {
                console.error('Error signing out:', error);
            }
        },
        async getToken() {
            if (!this.session) {
                await this.checkAuth();
            }
            return this.session?.tokens?.idToken?.toString();
        },
        async getUser() {
            if (!this.user) {
                await this.checkAuth();
            }
            return this.user;
        }
    }
});
