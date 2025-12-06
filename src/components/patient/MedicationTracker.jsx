
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Clock, AlertTriangle, CheckCircle, Calendar, MousePointerClick, Zap } from "lucide-react";
import { Medication } from "@/api/entities";
import { format, differenceInDays, isToday as isTodayFns } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function MedicationTracker({ patientId }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, [patientId]);

  const loadMedications = async () => {
    try {
      const meds = await Medication.filter({
        patient_id: patientId,
        is_active: true
      }, '-created_date');
      setMedications(meds);
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDose = (med) => {
    const { start_date, end_date, frequency } = med;
    if (!start_date || !frequency) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999); // Normalize end date to end of day
      if (today > endDate) return null; // El tratamiento ha finalizado
    }

    const startDate = new Date(start_date);
    startDate.setHours(0, 0, 0, 0); // Normalize start date to start of day

    if (startDate > today) {
      return { date: startDate, isToday: false }; // Si aún no ha empezado
    }

    const freqLower = frequency.toLowerCase();

    // Dosis diarias / con horario específico dentro del día
    // For simplicity, if frequency implies daily or fixed intervals, next dose is considered today.
    if (freqLower.includes('diario') || freqLower.includes('24 horas') || freqLower.includes('12 horas') || freqLower.includes('8 horas') || freqLower.includes('noche') || freqLower.includes('mañana')) {
      return { date: new Date(), isToday: true };
    }

    // Dosis semanales
    if (freqLower.includes('semana') || freqLower.includes('semanal')) {
      const startDayOfWeek = new Date(start_date).getDay(); // 0 for Sunday, 6 for Saturday
      const todayDayOfWeek = today.getDay();

      let daysUntilNextDose = (startDayOfWeek - todayDayOfWeek + 7) % 7;

      const nextDoseDate = new Date(today);
      nextDoseDate.setDate(today.getDate() + daysUntilNextDose);
      nextDoseDate.setHours(0,0,0,0); // Normalize for comparison

      return { date: nextDoseDate, isToday: isTodayFns(nextDoseDate) };
    }

    return null; // Frecuencias complejas no calculables o no contempladas
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diff = differenceInDays(end, today);
    return diff >= 0 ? diff : null; // Only show positive or zero days remaining, or null if past
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (medications.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            Medicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No tienes medicación prescrita actualmente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          Tu Medicación Actual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {medications.map((med) => {
          const daysRemaining = getDaysRemaining(med.end_date);
          const totalDays = med.end_date ? differenceInDays(new Date(med.end_date), new Date(med.start_date)) : 30;
          const progress = totalDays > 0 ? ((totalDays - Math.max(0, daysRemaining)) / totalDays) * 100 : 0;
          const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
          const nextDoseInfo = calculateNextDose(med);

          return (
            <div key={med.id} className={`p-4 rounded-xl border-2 ${
              isExpiringSoon ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-2xl text-gray-900">{med.medication_name}</h3>
                {isExpiringSoon && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    ¡Expira en {daysRemaining} días!
                  </Badge>
                )}
              </div>

              {/* Dosis y frecuencia */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <span className="text-blue-600 font-bold">💉</span>
                  <div>
                    <p className="text-xs text-gray-500">Dosis</p>
                    <p className="font-semibold text-gray-800">{med.dosage}</p>
                  </div>
                </div>
                {med.clicks && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                    <MousePointerClick className="w-4 h-4 text-blue-600"/>
                    <div>
                      <p className="text-xs text-gray-500">Clics</p>
                      <p className="font-semibold text-gray-800">{med.clicks}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <Zap className="w-4 h-4 text-blue-600"/>
                  <div>
                    <p className="text-xs text-gray-500">Frecuencia</p>
                    <p className="font-semibold text-gray-800">{med.frequency}</p>
                  </div>
                </div>
              </div>

              {/* Next Dose Indicator */}
              {nextDoseInfo && (
                <div className="mt-4 p-3 rounded-lg border-2 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Próxima Dosis</p>
                  <div
                    className={cn(
                      "flex items-center gap-2 text-lg font-bold p-2 rounded-md transition-all",
                      nextDoseInfo.isToday
                        ? "text-green-700 bg-green-100"
                        : "text-red-700 bg-red-100 animate-pulse"
                    )}
                  >
                    <Clock className="w-5 h-5" />
                    <span>
                      {format(nextDoseInfo.date, "EEEE, dd 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                </div>
              )}

              {/* Fechas y progreso */}
              <div className="flex justify-between text-sm text-gray-600 mb-2 mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4"/>
                  <span>Inicio: {format(new Date(med.start_date), "dd/MM/yyyy")}</span>
                </div>
                {med.end_date && daysRemaining !== null && (
                   <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4"/>
                    <span>{daysRemaining} días restantes</span>
                  </div>
                )}
              </div>

              {med.end_date && (
                <div className="mb-3">
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Efectos secundarios */}
              {med.side_effects && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Posibles efectos secundarios:</strong> {med.side_effects}
                  </p>
                  {med.side_effects_treatment && (
                    <p className="text-sm text-yellow-700 mt-1">
                      <strong>Qué hacer si aparecen:</strong> {med.side_effects_treatment}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <h4 className="font-bold text-blue-900">Recordatorios Importantes</h4>
          </div>
          <ul className="text-sm text-blue-800 space-y-1 ml-9">
            <li>• Toma tu medicación siempre a la misma hora</li>
            <li>• No olvides informar a tu médico de cualquier efecto secundario</li>
            <li>• Mantén un registro de tu medicación diaria</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
