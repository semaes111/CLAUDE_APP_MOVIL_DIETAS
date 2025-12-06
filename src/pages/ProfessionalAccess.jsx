import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, UserCheck, ArrowLeft, Clock, Shield, Mail } from "lucide-react";
import { User as UserSDK } from "@/api/entities";

export default function ProfessionalAccessPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const currentUser = await UserSDK.me();
      setUser(currentUser);
      
      // Si ya tiene permisos, redirigir al dashboard
      if (currentUser.role === 'profesional' || currentUser.role === 'admin') {
        navigate(createPageUrl("DoctorDashboard"));
        return;
      }
    } catch (error) {
      // Usuario no logueado, redirigir a login
      await UserSDK.loginWithRedirect(window.location.origin + createPageUrl("ProfessionalAccess"));
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("Solicitud de Acceso Profesional - NutriMed");
    const body = encodeURIComponent(`Hola,

Solicito acceso al sistema NutriMed como profesional de la salud.

Datos de mi cuenta:
- Nombre: ${user?.full_name}
- Email: ${user?.email}

Por favor, configure mi cuenta con los permisos correspondientes.

Gracias.`);
    
    window.open(`mailto:admin@nutrimed.com?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
          <p className="text-gray-600">Solo personal autorizado</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-800">
              Hola, {user?.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Su cuenta no tiene permisos para acceder al sistema médico. Necesita autorización de un administrador.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Estado:</strong> Sin permisos asignados</p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleContactAdmin}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contactar Administrador
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate(createPageUrl("Home"))}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </div>

            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
              <p><strong>Importante:</strong> Solo los profesionales de la salud autorizados pueden acceder a este sistema. Un administrador debe configurar su cuenta manualmente.</p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
              <p><strong>Instrucciones:</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Haga clic en "Contactar Administrador"</li>
                <li>Envíe el email que se abrirá automáticamente</li>
                <li>Espere la confirmación del administrador</li>
                <li>Una vez autorizado, podrá acceder al sistema</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}