/**
 * Servicio de pagos con Stripe
 * Maneja suscripciones, pagos y gestión de planes
 */

import { loadStripe } from '@stripe/stripe-js';
import { SubscriptionStore } from './offlineStorage';

// Configuración de Stripe
// IMPORTANTE: Reemplazar con tu clave pública de Stripe en producción
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';

// URL del backend para Stripe (configurar según tu servidor)
const API_URL = import.meta.env.VITE_API_URL || '';

// Planes de suscripción
export const SUBSCRIPTION_PLANS = {
  FREEMIUM: {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    currency: 'EUR',
    interval: null,
    trialDays: 7,
    features: [
      'Acceso completo durante 7 días',
      'Plan de dieta personalizado',
      'Seguimiento de peso',
      'Recetas básicas',
      'Chat con asistente IA'
    ],
    stripePriceId: null
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 80,
    currency: 'EUR',
    interval: 'month',
    trialDays: 0,
    features: [
      'Todo lo de Freemium',
      'Videollamada mensual con nutricionista',
      'Recetas premium ilimitadas',
      'Análisis avanzado de progreso',
      'Planes de dieta personalizados ilimitados',
      'Soporte prioritario por email'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_monthly'
  },
  VIP: {
    id: 'vip',
    name: 'VIP',
    price: 139,
    currency: 'EUR',
    interval: 'month',
    trialDays: 0,
    features: [
      'Todo lo de Pro',
      'Consulta médica inicial con prescripción',
      'Seguimiento nutricional VIP personalizado',
      'Línea de WhatsApp 24/7 para dudas',
      'Resolución profesional de problemas',
      'Acceso anticipado a nuevas funciones',
      'Descuentos en productos partner'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_VIP_PRICE_ID || 'price_vip_monthly'
  }
};

// Instancia de Stripe
let stripePromise = null;

/**
 * Obtener instancia de Stripe
 */
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/**
 * Clase principal del servicio de pagos
 */
class StripeService {
  constructor() {
    this.stripe = null;
    this.currentSubscription = null;
  }

  /**
   * Inicializar el servicio
   */
  async init() {
    try {
      this.stripe = await getStripe();
      console.log('[StripeService] Inicializado correctamente');
      return true;
    } catch (error) {
      console.error('[StripeService] Error al inicializar:', error);
      return false;
    }
  }

  /**
   * Crear sesión de checkout para suscripción
   */
  async createCheckoutSession(planId, userId, userEmail) {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);

    if (!plan || !plan.stripePriceId) {
      throw new Error(`Plan no válido: ${planId}`);
    }

    try {
      // En producción, esto debería llamar a tu backend
      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          email: userEmail,
          successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/subscription/cancel`
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión de checkout');
      }

      const session = await response.json();

      // Redirigir a Stripe Checkout
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (error) {
        throw error;
      }

      return session;
    } catch (error) {
      console.error('[StripeService] Error creando checkout:', error);
      throw error;
    }
  }

  /**
   * Crear portal de cliente para gestionar suscripción
   */
  async createCustomerPortalSession(customerId) {
    try {
      const response = await fetch(`${API_URL}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión de portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('[StripeService] Error creando portal:', error);
      throw error;
    }
  }

  /**
   * Obtener suscripción actual del usuario
   */
  async getSubscription(userId) {
    try {
      // Primero intentar obtener del almacenamiento local
      const localSub = await SubscriptionStore.get(userId);

      // Si hay conexión, verificar con el servidor
      if (navigator.onLine) {
        const response = await fetch(`${API_URL}/api/stripe/subscription/${userId}`);

        if (response.ok) {
          const subscription = await response.json();

          // Actualizar almacenamiento local
          await SubscriptionStore.save({
            userId,
            ...subscription
          });

          return subscription;
        }
      }

      // Devolver datos locales si no hay conexión o falla el servidor
      if (localSub) {
        return localSub;
      }

      // Usuario sin suscripción - verificar si está en período de prueba
      return this.getDefaultSubscription(userId);
    } catch (error) {
      console.error('[StripeService] Error obteniendo suscripción:', error);

      // Intentar devolver datos locales
      const localSub = await SubscriptionStore.get(userId);
      return localSub || this.getDefaultSubscription(userId);
    }
  }

  /**
   * Obtener suscripción por defecto (trial freemium)
   */
  getDefaultSubscription(userId) {
    const createdAt = new Date();
    const trialEndsAt = new Date(createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    return {
      userId,
      plan: 'freemium',
      status: 'trialing',
      trialEndsAt: trialEndsAt.toISOString(),
      createdAt: createdAt.toISOString(),
      features: SUBSCRIPTION_PLANS.FREEMIUM.features
    };
  }

  /**
   * Verificar si el usuario tiene acceso a una característica
   */
  async hasAccess(userId, feature) {
    const subscription = await this.getSubscription(userId);

    if (!subscription) {
      return false;
    }

    // Verificar si la suscripción está activa
    if (!this.isSubscriptionActive(subscription)) {
      return false;
    }

    // Verificar según el plan
    const plan = SUBSCRIPTION_PLANS[subscription.plan.toUpperCase()];

    if (!plan) {
      return false;
    }

    // Características por plan
    const planAccess = {
      freemium: [
        'diet_plan',
        'weight_tracking',
        'basic_recipes',
        'ai_chat'
      ],
      pro: [
        'diet_plan',
        'weight_tracking',
        'basic_recipes',
        'ai_chat',
        'video_consultation',
        'premium_recipes',
        'advanced_analytics',
        'unlimited_diet_plans',
        'priority_support'
      ],
      vip: [
        'diet_plan',
        'weight_tracking',
        'basic_recipes',
        'ai_chat',
        'video_consultation',
        'premium_recipes',
        'advanced_analytics',
        'unlimited_diet_plans',
        'priority_support',
        'medical_consultation',
        'whatsapp_support',
        'professional_resolution',
        'early_access',
        'partner_discounts'
      ]
    };

    const allowedFeatures = planAccess[subscription.plan] || [];
    return allowedFeatures.includes(feature);
  }

  /**
   * Verificar si la suscripción está activa
   */
  isSubscriptionActive(subscription) {
    if (!subscription) {
      return false;
    }

    const { status, trialEndsAt, currentPeriodEnd } = subscription;

    // Estados activos
    if (status === 'active') {
      return true;
    }

    // En período de prueba
    if (status === 'trialing' && trialEndsAt) {
      return new Date(trialEndsAt) > new Date();
    }

    // Período actual aún válido
    if (currentPeriodEnd) {
      return new Date(currentPeriodEnd) > new Date();
    }

    return false;
  }

  /**
   * Calcular días restantes de la suscripción
   */
  getDaysRemaining(subscription) {
    if (!subscription) {
      return 0;
    }

    const endDate = subscription.trialEndsAt || subscription.currentPeriodEnd;

    if (!endDate) {
      return 0;
    }

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${API_URL}/api/stripe/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cancelar suscripción');
      }

      return await response.json();
    } catch (error) {
      console.error('[StripeService] Error cancelando suscripción:', error);
      throw error;
    }
  }

  /**
   * Actualizar suscripción (upgrade/downgrade)
   */
  async updateSubscription(subscriptionId, newPlanId) {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === newPlanId);

    if (!plan || !plan.stripePriceId) {
      throw new Error(`Plan no válido: ${newPlanId}`);
    }

    try {
      const response = await fetch(`${API_URL}/api/stripe/subscription/${subscriptionId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPriceId: plan.stripePriceId
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar suscripción');
      }

      return await response.json();
    } catch (error) {
      console.error('[StripeService] Error actualizando suscripción:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de facturas
   */
  async getInvoices(customerId) {
    try {
      const response = await fetch(`${API_URL}/api/stripe/invoices/${customerId}`);

      if (!response.ok) {
        throw new Error('Error al obtener facturas');
      }

      return await response.json();
    } catch (error) {
      console.error('[StripeService] Error obteniendo facturas:', error);
      return [];
    }
  }

  /**
   * Obtener métodos de pago
   */
  async getPaymentMethods(customerId) {
    try {
      const response = await fetch(`${API_URL}/api/stripe/payment-methods/${customerId}`);

      if (!response.ok) {
        throw new Error('Error al obtener métodos de pago');
      }

      return await response.json();
    } catch (error) {
      console.error('[StripeService] Error obteniendo métodos de pago:', error);
      return [];
    }
  }
}

// Instancia singleton
export const stripeService = new StripeService();

/**
 * Hook para usar el servicio de Stripe en componentes React
 */
export function useSubscription(userId) {
  const [subscription, setSubscription] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchSubscription() {
      try {
        setLoading(true);
        const sub = await stripeService.getSubscription(userId);
        setSubscription(sub);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchSubscription();
    }
  }, [userId]);

  const isActive = subscription ? stripeService.isSubscriptionActive(subscription) : false;
  const daysRemaining = subscription ? stripeService.getDaysRemaining(subscription) : 0;

  return {
    subscription,
    loading,
    error,
    isActive,
    daysRemaining,
    plan: subscription?.plan || 'freemium',
    refresh: async () => {
      const sub = await stripeService.getSubscription(userId);
      setSubscription(sub);
    }
  };
}

// Importar React para el hook
import * as React from 'react';

export default stripeService;
