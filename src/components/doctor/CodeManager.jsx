
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw, Lock, Unlock, Copy, Check } from "lucide-react";
import { Patient } from "@/api/entities";
import { PatientAccessCode } from "@/api/entities";
import { format, differenceInDays } from "date-fns";

export default function CodeManager({ patient, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateNewCode = () => {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(patient.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = patient.access_code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const newCode = generateNewCode();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 28);

      // Desactivar códigos anteriores en PatientAccessCode
      const oldCodes = await PatientAccessCode.filter({ patient_id: patient.id });
      for (const oldCode of oldCodes) {
        await PatientAccessCode.update(oldCode.id, { is_blocked: true });
      }

      // Crear nuevo código en la entidad separada con datos del paciente incluidos
      await PatientAccessCode.create({
        patient_id: patient.id,
        access_code: newCode,
        code_expiry: expiryDate.toISOString(),
        is_blocked: false, // El nuevo código no debe estar bloqueado inicialmente
        patient_data: {
          full_name: patient.full_name,
          age: patient.age,
          height: patient.height,
          current_weight: patient.current_weight,
          initial_weight: patient.initial_weight,
          target_weight: patient.target_weight,
          assigned_doctor: patient.assigned_doctor
        }
      });

      // También actualizar en la tabla Patient para mantener sincronización
      await Patient.update(patient.id, {
        access_code: newCode,
        code_expiry: expiryDate.toISOString()
      });

      onUpdate?.();
    } catch (error) {
      console.error("Error generating code:", error);
      alert("Error al generar código. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    setLoading(true);
    try {
      // Actualizar en la tabla Patient
      await Patient.update(patient.id, {
        is_blocked: !patient.is_blocked
      });

      // Actualizar todos los códigos de acceso del paciente
      const accessCodes = await PatientAccessCode.filter({ patient_id: patient.id });
      for (const code of accessCodes) {
        await PatientAccessCode.update(code.id, { is_blocked: !patient.is_blocked });
      }

      onUpdate?.();
    } catch (error) {
      console.error("Error toggling block:", error);
      alert("Error al cambiar estado. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = differenceInDays(new Date(patient.code_expiry), new Date());
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          Gestión de Códigos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Código Actual</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-mono font-bold text-blue-600 select-all">{patient.access_code}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 w-8 p-0 hover:bg-blue-50"
                title="Copiar código"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-blue-600" />
                )}
              </Button>
            </div>
            <div className="flex justify-center">
              {isExpiringSoon ? (
                <Badge variant="destructive">
                  Expira en {daysRemaining} días
                </Badge>
              ) : (
                <Badge variant="outline">
                  Expira: {format(new Date(patient.code_expiry), "dd/MM/yyyy")}
                </Badge>
              )}
            </div>
            {copied && (
              <p className="text-xs text-green-600 animate-fade-in">
                ✓ Código copiado al portapapeles
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleGenerateCode}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Generando..." : "Generar Nuevo Código"}
          </Button>

          <Button
            onClick={handleToggleBlock}
            disabled={loading}
            variant={patient.is_blocked ? "default" : "destructive"}
            className="w-full"
          >
            {patient.is_blocked ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Desbloquear Cuenta
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Bloquear Cuenta
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Información:</strong></p>
            <p>• Los códigos expiran automáticamente cada 4 semanas</p>
            <p>• Puede generar códigos nuevos en cualquier momento</p>
            <p>• Las cuentas bloqueadas no pueden acceder al sistema</p>
            <p>• Haga clic en el icono de copia para copiar el código</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
