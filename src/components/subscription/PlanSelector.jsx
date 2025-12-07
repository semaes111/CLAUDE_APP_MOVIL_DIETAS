/**
 * Componente selector de planes de suscripción
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Clock, CreditCard, MessageCircle } from 'lucide-react';
import { PlanCard } from './PlanCard';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function PlanSelector() {
  const navigate = useNavigate();
  const {
    plans,
    currentPlan,
    isTrialing,
    daysRemaining,
    startUpgrade,
    loading
  } = useSubscriptionContext();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  const handleSelectPlan = async (planId) => {
    if (planId === currentPlan) return;

    setSelectedPlan(planId);
    setUpgrading(true);

    try {
      await startUpgrade(planId);
    } catch (error) {
      console.error('Error al seleccionar plan:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const orderedPlans = [plans.FREEMIUM, plans.PRO, plans.VIP];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            className="absolute left-4 top-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Elige tu plan perfecto
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transforma tu salud con el seguimiento nutricional más completo.
              Comienza con 7 días gratis y descubre todo lo que podemos ofrecerte.
            </p>
          </motion.div>

          {/* Trial banner */}
          {isTrialing && daysRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full"
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Te quedan {daysRemaining} días de prueba gratuita
              </span>
            </motion.div>
          )}
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <AnimatePresence>
            {orderedPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PlanCard
                  plan={plan}
                  isCurrentPlan={currentPlan === plan.id}
                  onSelect={handleSelectPlan}
                  loading={upgrading && selectedPlan === plan.id}
                  recommended={plan.id === 'pro'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          <div className="flex flex-col items-center p-4">
            <Shield className="h-8 w-8 text-emerald-500 mb-2" />
            <span className="text-sm text-gray-600">Pago 100% seguro</span>
          </div>
          <div className="flex flex-col items-center p-4">
            <Clock className="h-8 w-8 text-emerald-500 mb-2" />
            <span className="text-sm text-gray-600">Cancela cuando quieras</span>
          </div>
          <div className="flex flex-col items-center p-4">
            <CreditCard className="h-8 w-8 text-emerald-500 mb-2" />
            <span className="text-sm text-gray-600">Sin compromiso</span>
          </div>
          <div className="flex flex-col items-center p-4">
            <MessageCircle className="h-8 w-8 text-emerald-500 mb-2" />
            <span className="text-sm text-gray-600">Soporte dedicado</span>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Preguntas frecuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Cómo funciona la prueba gratuita?
              </h3>
              <p className="text-gray-600 text-sm">
                Tienes 7 días para probar todas las funciones sin coste.
                No necesitas tarjeta de crédito para empezar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar de plan?
              </h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento.
                Los cambios se aplican de inmediato.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Cómo son las videollamadas?
              </h3>
              <p className="text-gray-600 text-sm">
                Las consultas son con nutricionistas certificados, una vez al mes.
                Puedes elegir el horario que mejor te convenga.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué incluye el soporte VIP?
              </h3>
              <p className="text-gray-600 text-sm">
                Línea de WhatsApp directa 24/7 para resolver dudas sobre dieta,
                medicación y cualquier problema nutricional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanSelector;
