/**
 * Componente de tarjeta de plan de suscripción
 */

import React from 'react';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const planIcons = {
  freemium: Zap,
  pro: Star,
  vip: Crown
};

const planColors = {
  freemium: {
    gradient: 'from-gray-400 to-gray-600',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    button: 'bg-gray-600 hover:bg-gray-700'
  },
  pro: {
    gradient: 'from-emerald-400 to-teal-600',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    button: 'bg-emerald-600 hover:bg-emerald-700'
  },
  vip: {
    gradient: 'from-amber-400 to-orange-600',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
  }
};

export function PlanCard({
  plan,
  isCurrentPlan = false,
  onSelect,
  loading = false,
  recommended = false
}) {
  const {
    id,
    name,
    price,
    currency,
    interval,
    trialDays,
    features
  } = plan;

  const Icon = planIcons[id] || Star;
  const colors = planColors[id] || planColors.pro;

  const formatPrice = () => {
    if (price === 0) {
      return (
        <div className="flex items-baseline">
          <span className="text-4xl font-bold">Gratis</span>
          {trialDays > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              por {trialDays} días
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-baseline">
        <span className="text-4xl font-bold">{price}€</span>
        <span className="ml-1 text-gray-500">/{interval === 'month' ? 'mes' : interval}</span>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
        colors.border,
        isCurrentPlan && 'ring-2 ring-emerald-500',
        recommended && 'scale-105 shadow-xl'
      )}
    >
      {/* Encabezado con gradiente */}
      <div className={cn('h-2 bg-gradient-to-r', colors.gradient)} />

      {/* Badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {recommended && (
          <Badge className="bg-emerald-500 text-white">
            Recomendado
          </Badge>
        )}
        {isCurrentPlan && (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600">
            Plan actual
          </Badge>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg bg-gradient-to-r text-white',
            colors.gradient
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>
              {id === 'freemium' && 'Prueba todas las funciones'}
              {id === 'pro' && 'Para usuarios comprometidos'}
              {id === 'vip' && 'Experiencia premium completa'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Precio */}
        {formatPrice()}

        {/* Características */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={cn(
                'h-5 w-5 mt-0.5 flex-shrink-0',
                id === 'vip' ? 'text-amber-500' : 'text-emerald-500'
              )} />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={cn('w-full text-white', colors.button)}
          size="lg"
          onClick={() => onSelect?.(id)}
          disabled={loading || isCurrentPlan}
        >
          {loading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isCurrentPlan
            ? 'Plan actual'
            : id === 'freemium'
              ? 'Comenzar prueba'
              : `Suscribirse a ${name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PlanCard;
