import { Amplify } from 'aws-amplify';
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    // Configuración ESTÁNDAR para AWS Cognito Real
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId: config.public.cognitoUserPoolId as string,
                userPoolClientId: config.public.cognitoClientId as string,
                loginWith: {
                    email: true
                }
            }
        }
    });

    return {
        provide: {
            amplify: Amplify
        }
    };
});
