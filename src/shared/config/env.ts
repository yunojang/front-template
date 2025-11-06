const metaEnv = import.meta.env

const fallbackAppName = 'Front Wireframe'

export const env = {
  appName: metaEnv.VITE_APP_NAME ?? fallbackAppName,
  apiBaseUrl: metaEnv.VITE_API_BASE_URL ?? '/api',
  enableMocking: (metaEnv.VITE_ENABLE_MSW ?? 'true') === 'true',
  environment: metaEnv.MODE ?? 'development',
}

export const isDevelopment = env.environment === 'development'
