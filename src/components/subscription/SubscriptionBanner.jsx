/**
 * Banner de estado de suscripción
 * Muestra información sobre el plan actual y días restantes
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Crown, Star, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const planConfigs = {
  freemium: {
    icon: Zap,
    gradient: 'from-gray-500 to-gray-600',
    bgGradient: 'from-gray-50 to-gray-100',
    border: 'border-gray-200'
  },
  pro: {
    icon: Star,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200'
  },
  vip: {
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200'
  }
};

export function SubscriptionBanner({ compact = false }) {
  const {
    currentPlan,
    planDetails,
    isTrialing,
    trialExpired,
    daysRemaining,
    isActive
  } = useSubscriptionContext();

  const config = planConfigs[currentPlan] || planConfigs.freemium;
  const Icon = config.icon;

  // Banner compacto para headers
  if (compact) {
    return (
      <Link to="/subscription">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
            isTrialing && !trialExpired
              ? 'bg-emerald-100 text-emerald-800'
              : trialExpired
                ? 'bg-red-100 text-red-800'
                : `bg-gradient-to-r ${config.gradient} text-white`
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="font-medium">
            {isTrialing && !trialExpired
              ? `${daysRemaining} días gratis`
              : trialExpired
                ? 'Prueba expirada'
                : planDetails.name}
          </span>
        </motion.div>
      </Link>
    );
  }

  // Banner de alerta para trial expirando pronto
  if (isTrialing && daysRemaining <= 3 && daysRemaining > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">
                Tu prueba termina pronto
              </h3>
              <p className="text-sm text-amber-700">
                Solo te quedan {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}.
                ¡No pierdas tu progreso!
              </p>
            </div>
          </div>
          <Link to="/subscription">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Elegir plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Barra de progreso del trial */}
        <div className="mt-3">
          <Progress value={(7 - daysRemaining) / 7 * 100} className="h-2" />
        </div>
      </motion.div>
    );
  }

  // Banner de trial expirado
  if (trialExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">
                Tu período de prueba ha terminado
              </h3>
              <p className="text-sm text-red-700">
                Suscríbete para seguir disfrutando de todas las funciones
              </p>
            </div>
          </div>
          <Link to="/subscription">
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Ver planes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Banner normal de trial activo
  if (isTrialing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">
                Prueba gratuita activa
              </h3>
              <p className="text-sm text-emerald-700">
                Te quedan {daysRemaining} días para explorar todas las funciones
              </p>
            </div>
          </div>
          <Link to="/subscription">
            <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
              Ver planes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Barra de progreso del trial */}
        <div className="mt-3">
          <Progress
            value={(7 - daysRemaining) / 7 * 100}
            className="h-2 bg-emerald-100 [&>div]:bg-emerald-500"
          />
        </div>
      </motion.div>
    );
  }

  // Banner de plan activo (Pro/VIP)
  if (isActive && currentPlan !== 'freemium') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-xl p-4 mb-6 border bg-gradient-to-r',
          config.bgGradient,
          config.border
        )}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-full bg-gradient-to-r text-white',
              config.gradient
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Plan {planDetails.name} activo
              </h3>
              <p className="text-sm text-gray-600">
                {currentPlan === 'pro'
                  ? 'Tienes acceso a videoconsultas mensuales'
                  : 'Disfruta de todos los beneficios VIP'}
              </p>
            </div>
          </div>
          <Link to="/subscription">
            <Button variant="outline" className="text-gray-600">
              Gestionar plan
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return null;
}

export default SubscriptionBanner;
