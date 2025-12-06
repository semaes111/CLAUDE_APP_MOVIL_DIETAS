import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, User, UserCheck, ArrowRight } from "lucide-react";
import { User as UserSDK } from "@/api/entities";

export default function HomePage() {
  const navigate = useNavigate();

  const handleDoctorLogin = async () => {
    try {
      // Primero, intenta obtener el usuario actual sin forzar un login
      const currentUser = await UserSDK.me();
      
      // Si el usuario ya está logueado y tiene el rol correcto, llévalo al dashboard
      if (currentUser && (currentUser.role === 'profesional' || currentUser.role === 'admin')) {
        navigate(createPageUrl("DoctorDashboard"));
      } else {
        // Si no tiene el rol correcto o hay algún otro problema, se comporta como si no estuviera logueado
        // y lo envía al flujo de login, que eventualmente lo llevará a ProfessionalAccess si no tiene permisos.
        await UserSDK.loginWithRedirect(window.location.origin + createPageUrl("ProfessionalAccess"));
      }
    } catch (error) {
      // Si UserSDK.me() falla, significa que el usuario no está logueado.
      // Lo enviamos al flujo de login con un callback a ProfessionalAccess.
      // ProfessionalAccess se encargará de verificar los permisos después del login.
      await UserSDK.loginWithRedirect(window.location.origin + createPageUrl("ProfessionalAccess"));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Bienvenido a NutriMed
          </h1>
          <p className="text-lg text-gray-600">
            Tu sistema de seguimiento dietético médico.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Tarjeta para Pacientes */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Acceso Pacientes</h2>
              <p className="text-gray-600 mb-6">
                Ingresa con tu código personal para ver tu plan, progreso y comidas.
              </p>
              <Button
                onClick={() => navigate(createPageUrl("PatientAccess"))}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-lg"
              >
                Ingresar Código <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Tarjeta para Profesionales */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Acceso Profesionales</h2>
              <p className="text-gray-600 mb-6">
                Gestiona tus pacientes, dietas, y sigue su evolución detallada.
              </p>
              <Button
                onClick={handleDoctorLogin}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-lg"
              >
                Iniciar Sesión <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}