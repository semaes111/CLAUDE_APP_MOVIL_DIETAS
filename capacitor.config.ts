import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutrimed.app',
  appName: 'NutriMed',
  webDir: 'dist',

  // Configuración del servidor
  server: {
    // Permitir navegación a URLs externas (para Stripe, WhatsApp, etc.)
    allowNavigation: [
      'https://checkout.stripe.com',
      'https://wa.me',
      'https://api.stripe.com',
      'https://*.base44.com'
    ],
    // Habilitar texto claro para desarrollo (deshabilitar en producción)
    cleartext: false,
    // Hostname personalizado para el WebView
    hostname: 'nutrimed.app'
  },

  // Configuración de plugins
  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#10b981',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },

    // Barra de estado
    StatusBar: {
      backgroundColor: '#10b981',
      style: 'LIGHT'
    },

    // Teclado
    Keyboard: {
      resize: 'body',
      style: 'LIGHT',
      resizeOnFullScreen: true
    },

    // Preferencias (almacenamiento local)
    Preferences: {
      group: 'NutriMedSettings'
    },

    // App
    App: {
      // URLs que pueden abrir la app (deep links)
      associatedDomains: ['applinks:nutrimed.app']
    }
  },

  // Configuración específica de Android
  android: {
    // Color de la barra de navegación
    backgroundColor: '#ffffff',
    // Permitir mezcla de contenido HTTP/HTTPS
    allowMixedContent: false,
    // Modo de captura de gestos
    captureInput: true,
    // Configuración del WebView
    webContentsDebuggingEnabled: false,
    // Tema de la app
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },

  // Configuración específica de iOS
  ios: {
    // Esquema de URL personalizado
    scheme: 'nutrimed',
    // Estilo de presentación del WebView
    contentInset: 'automatic',
    // Permitir scroll bouncing
    allowsLinkPreview: true,
    // Configuración de scrolling
    scrollEnabled: true,
    // Fondo del WebView
    backgroundColor: '#ffffff',
    // Preferir Safe Area
    preferredContentMode: 'mobile',
    // Limitar la tasa de scroll
    limitsNavigationsToAppBoundDomains: false
  }
};

export default config;
