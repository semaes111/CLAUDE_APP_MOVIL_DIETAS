# NutriMed - Aplicacion Movil de Nutricion y Salud

Aplicacion movil hibrida para seguimiento nutricional y planes de dieta personalizados, desarrollada con React, Vite e Ionic Capacitor.

## Caracteristicas Principales

### Para Pacientes
- Dashboard personalizado con plan de dieta
- Seguimiento de peso con graficos de evolucion
- Gestion de medicamentos prescritos
- Recetas personalizadas segun tipo de dieta
- Chat con asistente IA de nutricion (NutriBot)
- Lista de compras semanal
- Alimentos permitidos y prohibidos

### Para Profesionales
- Gestion completa de pacientes
- Creacion de planes dieteticos personalizados
- Seguimiento de progreso de pacientes
- Generacion de codigos de acceso
- Notas clinicas privadas

### Funcionalidades Moviles
- Funcionamiento offline completo
- Notificaciones push
- Sincronizacion automatica de datos
- Almacenamiento local con IndexedDB

### Modelo de Suscripcion

| Plan | Precio | Caracteristicas |
|------|--------|-----------------|
| **Freemium** | Gratis (7 dias) | Acceso completo temporal, plan de dieta, seguimiento, chat IA |
| **Pro** | 80 EUR/mes | Todo Freemium + Videollamada mensual con nutricionista, recetas premium |
| **VIP** | 139 EUR/mes | Todo Pro + Consulta medica inicial, WhatsApp 24/7, soporte profesional |

## Tecnologias Utilizadas

- **Frontend**: React 18.2, Vite 6.1
- **UI**: TailwindCSS 3.4, shadcn/ui, Radix UI
- **Mobile**: Ionic Capacitor 7.4
- **Pagos**: Stripe
- **Backend**: Base44 SDK
- **Graficos**: Recharts
- **Animaciones**: Framer Motion
- **Offline**: IndexedDB (idb), Service Worker

## Estructura del Proyecto

```
nutrimed-app/
├── android/              # Proyecto Android (Capacitor)
├── ios/                  # Proyecto iOS (Capacitor)
├── public/
│   ├── icons/           # Iconos de la app
│   ├── manifest.json    # Manifest PWA
│   └── sw.js            # Service Worker
├── src/
│   ├── agents/          # SDK del agente de chat IA
│   ├── api/             # Cliente Base44 y entidades
│   ├── components/
│   │   ├── chat/        # Componentes de chat
│   │   ├── doctor/      # Componentes para medicos
│   │   ├── patient/     # Componentes para pacientes
│   │   ├── subscription/# Componentes de suscripcion
│   │   └── ui/          # Componentes shadcn/ui
│   ├── contexts/        # Contextos React (suscripcion)
│   ├── hooks/           # Hooks personalizados
│   ├── lib/             # Utilidades
│   ├── pages/           # Paginas de la aplicacion
│   └── services/        # Servicios (offline, network, stripe)
├── capacitor.config.ts  # Configuracion Capacitor
├── vite.config.js       # Configuracion Vite
└── package.json
```

## Instalacion

### Requisitos
- Node.js >= 18
- npm >= 9
- Android Studio (para Android)
- Xcode (para iOS, solo macOS)

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd nutrimed-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_STRIPE_PRO_PRICE_ID=price_xxx
VITE_STRIPE_VIP_PRICE_ID=price_xxx
VITE_API_URL=https://tu-api.com
```

4. **Desarrollo web**
```bash
npm run dev
```

5. **Build para produccion**
```bash
npm run build
```

## Desarrollo Movil

### Android

```bash
# Compilar y sincronizar
npm run cap:build

# Abrir en Android Studio
npm run cap:android

# Ejecutar en emulador/dispositivo
npm run cap:run:android

# Desarrollo con live reload
npm run android:live
```

### iOS (requiere macOS)

```bash
# Compilar y sincronizar
npm run cap:build

# Abrir en Xcode
npm run cap:ios

# Ejecutar en simulador/dispositivo
npm run cap:run:ios

# Desarrollo con live reload
npm run ios:live
```

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar ESLint |
| `npm run cap:sync` | Sincronizar Capacitor |
| `npm run cap:build` | Build + sync Capacitor |
| `npm run cap:android` | Abrir Android Studio |
| `npm run cap:ios` | Abrir Xcode |

## Configuracion de Pagos (Stripe)

### Backend necesario

Para que el sistema de pagos funcione, necesitas implementar los siguientes endpoints:

```
POST /api/stripe/create-checkout-session
POST /api/stripe/create-portal-session
GET  /api/stripe/subscription/:userId
POST /api/stripe/subscription/:id/cancel
POST /api/stripe/subscription/:id/update
GET  /api/stripe/invoices/:customerId
GET  /api/stripe/payment-methods/:customerId
```

### Webhooks de Stripe

Configura webhooks para:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Funcionalidad Offline

La aplicacion incluye:

1. **Service Worker** con estrategias de cache:
   - Cache-first para recursos estaticos
   - Network-first para APIs
   - Stale-while-revalidate para contenido dinamico

2. **IndexedDB** para almacenamiento local:
   - Datos de pacientes
   - Planes de dieta
   - Registros de peso
   - Cola de sincronizacion

3. **Sincronizacion automatica**:
   - Detecta cambios de conexion
   - Encola operaciones offline
   - Sincroniza al recuperar conexion

## Publicacion en Tiendas

### Google Play Store

1. Generar APK/AAB firmado en Android Studio
2. Preparar ficha de la tienda (iconos, capturas, descripcion)
3. Configurar pagos in-app si es necesario
4. Subir a Google Play Console

### Apple App Store

1. Configurar firma de codigo en Xcode
2. Archivar y subir a App Store Connect
3. Preparar ficha de la tienda
4. Revisar politicas de pagos de Apple

## Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Proyecto privado - Todos los derechos reservados.

## Soporte

Para soporte tecnico, contactar al equipo de desarrollo.
