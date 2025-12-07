/**
 * Contexto de Suscripción
 * Proporciona acceso al estado de suscripción en toda la aplicación
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stripeService, SUBSCRIPTION_PLANS } from '@/services/stripeService';
import { SubscriptionStore, UserPreferences } from '@/services/offlineStorage';
import { toast } from 'sonner';

// Crear contexto
const SubscriptionContext = createContext(null);

/**
 * Provider del contexto de suscripción
 */
export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Cargar suscripción al montar
  useEffect(() => {
    async function loadSubscription() {
      try {
        // Obtener usuario actual
        const storedUserId = await UserPreferences.get('currentUserId');

        if (storedUserId) {
          setUserId(storedUserId);
          const sub = await stripeService.getSubscription(storedUserId);
          setSubscription(sub);
        } else {
          // Usuario sin identificar - crear suscripción temporal
          const tempSub = stripeService.getDefaultSubscription('guest');
          setSubscription(tempSub);
        }
      } catch (error) {
        console.error('[SubscriptionContext] Error cargando suscripción:', error);
        // Usar suscripción por defecto en caso de error
        setSubscription(stripeService.getDefaultSubscription('guest'));
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, []);

  // Establecer usuario
  const setCurrentUser = useCallback(async (newUserId) => {
    setUserId(newUserId);
    await UserPreferences.set('currentUserId', newUserId);

    if (newUserId) {
      const sub = await stripeService.getSubscription(newUserId);
      setSubscription(sub);
    }
  }, []);

  // Refrescar suscripción
  const refreshSubscription = useCallback(async () => {
    if (!userId) return;

    try {
      const sub = await stripeService.getSubscription(userId);
      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('[SubscriptionContext] Error refrescando suscripción:', error);
      throw error;
    }
  }, [userId]);

  // Iniciar proceso de upgrade
  const startUpgrade = useCallback(async (planId) => {
    if (!userId) {
      toast.error('Debes iniciar sesión para suscribirte');
      return;
    }

    const storedEmail = await UserPreferences.get('userEmail');

    try {
      await stripeService.createCheckoutSession(planId, userId, storedEmail);
    } catch (error) {
      toast.error('Error al iniciar el proceso de pago');
      throw error;
    }
  }, [userId]);

  // Abrir portal de gestión
  const openCustomerPortal = useCallback(async () => {
    if (!subscription?.stripeCustomerId) {
      toast.error('No se encontró información de facturación');
      return;
    }

    try {
      await stripeService.createCustomerPortalSession(subscription.stripeCustomerId);
    } catch (error) {
      toast.error('Error al abrir el portal de gestión');
      throw error;
    }
  }, [subscription]);

  // Cancelar suscripción
  const cancelSubscription = useCallback(async () => {
    if (!subscription?.stripeSubscriptionId) {
      toast.error('No tienes una suscripción activa');
      return;
    }

    try {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
      await refreshSubscription();
      toast.success('Suscripción cancelada correctamente');
    } catch (error) {
      toast.error('Error al cancelar la suscripción');
      throw error;
    }
  }, [subscription, refreshSubscription]);

  // Verificar acceso a característica
  const hasFeatureAccess = useCallback((feature) => {
    if (!subscription) return false;

    const isActive = stripeService.isSubscriptionActive(subscription);
    if (!isActive) return false;

    // Mapa de características por plan
    const featureAccess = {
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

    const allowedFeatures = featureAccess[subscription.plan] || [];
    return allowedFeatures.includes(feature);
  }, [subscription]);

  // Datos calculados
  const isActive = subscription ? stripeService.isSubscriptionActive(subscription) : false;
  const daysRemaining = subscription ? stripeService.getDaysRemaining(subscription) : 0;
  const currentPlan = subscription?.plan || 'freemium';
  const planDetails = SUBSCRIPTION_PLANS[currentPlan.toUpperCase()] || SUBSCRIPTION_PLANS.FREEMIUM;

  // Estado de trial
  const isTrialing = subscription?.status === 'trialing';
  const trialExpired = isTrialing && daysRemaining <= 0;

  const value = {
    // Estado
    subscription,
    loading,
    userId,
    isActive,
    daysRemaining,
    currentPlan,
    planDetails,
    isTrialing,
    trialExpired,

    // Planes disponibles
    plans: SUBSCRIPTION_PLANS,

    // Acciones
    setCurrentUser,
    refreshSubscription,
    startUpgrade,
    openCustomerPortal,
    cancelSubscription,
    hasFeatureAccess
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook para usar el contexto de suscripción
 */
export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error('useSubscriptionContext debe usarse dentro de SubscriptionProvider');
  }

  return context;
}

/**
 * HOC para proteger componentes que requieren suscripción
 */
export function withSubscription(WrappedComponent, requiredPlan = null, requiredFeature = null) {
  return function SubscriptionProtectedComponent(props) {
    const { subscription, isActive, hasFeatureAccess, loading } = useSubscriptionContext();

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      );
    }

    // Verificar plan requerido
    if (requiredPlan) {
      const planHierarchy = ['freemium', 'pro', 'vip'];
      const currentPlanIndex = planHierarchy.indexOf(subscription?.plan || 'freemium');
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

      if (currentPlanIndex < requiredPlanIndex) {
        return (
          <UpgradePrompt
            requiredPlan={requiredPlan}
            currentPlan={subscription?.plan}
          />
        );
      }
    }

    // Verificar característica requerida
    if (requiredFeature && !hasFeatureAccess(requiredFeature)) {
      return (
        <FeatureLockedPrompt
          feature={requiredFeature}
          currentPlan={subscription?.plan}
        />
      );
    }

    // Verificar que la suscripción esté activa
    if (!isActive) {
      return (
        <SubscriptionExpiredPrompt />
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Componentes auxiliares
function UpgradePrompt({ requiredPlan, currentPlan }) {
  const { startUpgrade } = useSubscriptionContext();
  const plan = SUBSCRIPTION_PLANS[requiredPlan.toUpperCase()];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">Función Premium</h3>
      <p className="text-gray-600 mb-4">
        Esta función requiere el plan {plan?.name || requiredPlan}.
      </p>
      <button
        onClick={() => startUpgrade(requiredPlan)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Actualizar a {plan?.name || requiredPlan}
      </button>
    </div>
  );
}

function FeatureLockedPrompt({ feature, currentPlan }) {
  const { startUpgrade } = useSubscriptionContext();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-gray-200 p-4 rounded-full mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">Función Bloqueada</h3>
      <p className="text-gray-600 mb-4">
        Tu plan actual no incluye esta función.
      </p>
      <button
        onClick={() => startUpgrade('pro')}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Ver planes disponibles
      </button>
    </div>
  );
}

function SubscriptionExpiredPrompt() {
  const { startUpgrade, isTrialing, daysRemaining } = useSubscriptionContext();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">
        {isTrialing ? 'Período de prueba finalizado' : 'Suscripción expirada'}
      </h3>
      <p className="text-gray-600 mb-4">
        {isTrialing
          ? 'Tu período de prueba gratuito ha terminado. Elige un plan para continuar.'
          : 'Tu suscripción ha expirado. Renueva para seguir disfrutando de todas las funciones.'}
      </p>
      <button
        onClick={() => startUpgrade('pro')}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Ver planes
      </button>
    </div>
  );
}

export default SubscriptionContext;
