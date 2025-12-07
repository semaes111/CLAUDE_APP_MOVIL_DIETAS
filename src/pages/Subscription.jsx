/**
 * Página de gestión de suscripción
 */

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  Calendar,
  Download,
  MessageCircle
} from 'lucide-react';
import { PlanSelector } from '@/components/subscription/PlanSelector';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Componente de éxito después del pago
function PaymentSuccess() {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscriptionContext();

  useEffect(() => {
    refreshSubscription();
    toast.success('¡Pago completado con éxito!');
  }, [refreshSubscription]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a tu nuevo plan!</CardTitle>
          <CardDescription>
            Tu suscripción ha sido activada correctamente.
            Ya puedes disfrutar de todas las funciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={() => navigate('/PatientDashboard')}
          >
            Ir al dashboard
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente de cancelación
function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Pago cancelado</CardTitle>
          <CardDescription>
            El proceso de pago ha sido cancelado.
            Puedes intentarlo de nuevo cuando quieras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            onClick={() => navigate('/subscription')}
          >
            Ver planes
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/PatientDashboard')}
          >
            Volver al dashboard
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente de gestión de suscripción actual
function SubscriptionManagement() {
  const navigate = useNavigate();
  const {
    subscription,
    currentPlan,
    planDetails,
    isActive,
    daysRemaining,
    openCustomerPortal,
    cancelSubscription
  } = useSubscriptionContext();

  const [cancelling, setCancelling] = React.useState(false);

  const handleCancel = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelSubscription();
    } catch (error) {
      toast.error('Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };

  if (currentPlan === 'freemium') {
    return <PlanSelector />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tu suscripción</CardTitle>
              <CardDescription>
                Gestiona tu plan y facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan actual */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div>
                  <p className="text-sm text-gray-600">Plan actual</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {planDetails.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="text-xl font-semibold">
                    {planDetails.price}€/mes
                  </p>
                </div>
              </div>

              {/* Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Estado</span>
                  </div>
                  <p className="font-semibold">
                    {isActive ? (
                      <span className="text-emerald-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">Próximo pago</span>
                  </div>
                  <p className="font-semibold">
                    {subscription?.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Acciones */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={openCustomerPortal}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gestionar facturación
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={openCustomerPortal}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ver facturas
                </Button>

                {currentPlan !== 'vip' && (
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    onClick={() => navigate('/subscription?upgrade=vip')}
                  >
                    Actualizar a VIP
                  </Button>
                )}

                <Button
                  className="w-full text-red-600"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelando...' : 'Cancelar suscripción'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Soporte VIP */}
          {currentPlan === 'vip' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                  Soporte VIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Como usuario VIP, tienes acceso a nuestra línea de WhatsApp 24/7
                  para resolver cualquier duda sobre tu dieta o medicación.
                </p>
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => window.open('https://wa.me/34600000000?text=Hola,%20soy%20usuario%20VIP%20de%20NutriMed', '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Página principal
export default function Subscription() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  // Vistas según el estado
  if (view === 'success') {
    return <PaymentSuccess />;
  }

  if (view === 'cancel') {
    return <PaymentCancelled />;
  }

  return <SubscriptionManagement />;
}
