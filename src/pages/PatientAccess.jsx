import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { PatientAccessCode } from "@/api/entities";

export default function PatientAccessPage() {
  const navigate = useNavigate();
  const [patientCode, setPatientCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePatientAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!patientCode) {
      setError("Por favor, ingrese un código.");
      setLoading(false);
      return;
    }

    try {
      // Verificar el código de acceso
      const accessCodes = await PatientAccessCode.filter({ 
        access_code: patientCode.toUpperCase() 
      });
      
      if (accessCodes.length === 0) {
        setError("Código de acceso inválido.");
        setLoading(false);
        return;
      }
      
      const accessCodeRecord = accessCodes[0];

      if (accessCodeRecord.is_blocked) {
        setError("Su cuenta está bloqueada. Contacte con su médico.");
        setLoading(false);
        return;
      }

      const now = new Date();
      const expiryDate = new Date(accessCodeRecord.code_expiry);

      if (expiryDate < now) {
        setError("Su código ha expirado. Solicite uno nuevo a su médico.");
        setLoading(false);
        return;
      }

      // Usar los datos del paciente almacenados en el código de acceso
      const patientData = {
        id: accessCodeRecord.patient_id,
        access_code: accessCodeRecord.access_code,
        code_expiry: accessCodeRecord.code_expiry,
        ...accessCodeRecord.patient_data
      };
      
      sessionStorage.setItem("patient_data", JSON.stringify(patientData));
      navigate(createPageUrl("PatientDashboard"));

    } catch (err) {
      console.error("Error al verificar código:", err);
      setError("Error al verificar el código. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Paciente</h1>
          <p className="text-gray-600">Bienvenido a su portal NutriMed</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-800">Ingrese su Código</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePatientAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-code" className="flex items-center gap-2 text-gray-700">
                  <Shield className="w-4 h-4" />
                  Código de Acceso
                </Label>
                <Input
                  id="patient-code"
                  type="text"
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value)}
                  placeholder="Ingrese su código temporal"
                  className="h-12 text-lg text-center tracking-widest"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-lg"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Acceder a mi plan"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate(createPageUrl("Home"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}