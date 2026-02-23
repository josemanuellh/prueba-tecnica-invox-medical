// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  alias: {
    '@shared': '../shared'
  },
  // devServer: {
  //   host: '0.0.0.0',
  //   port: 3000
  // },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  build: {
    transpile: ['@speechmatics/real-time-client']
  },
  runtimeConfig: {
    public: {
      cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID || 'local_user_pool',
      cognitoClientId: process.env.COGNITO_CLIENT_ID || 'local_client',
      cognitoEndpoint: process.env.COGNITO_ENDPOINT || 'http://localhost:9229',
      apiUrl: process.env.API_URL || 'http://localhost:3001'
    }
  },
  vite: {
    server: {
      fs: {
        allow: ['..']
      },
      watch: {
        usePolling: true,
        interval: 1000
      }
    }
  }
})