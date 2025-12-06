import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Utensils, 
  Save, 
  Calendar,
  Plus,
  Check,
  X
} from "lucide-react";
import { DietPlan } from "@/api/entities";
import { format, addDays, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

const dietTypes = [
  { value: "rescue", name: "Dieta de Rescate", color: "bg-red-100 text-red-800" },
  { value: "strict", name: "Dieta Estricta", color: "bg-orange-100 text-orange-800" },
  { value: "mediterranean", name: "Dieta Mediterránea", color: "bg-green-100 text-green-800" },
  { value: "intermittent_fasting", name: "Ayuno Intermitente", color: "bg-blue-100 text-blue-800" },
  { value: "maintenance", name: "Mantenimiento", color: "bg-purple-100 text-purple-800" }
];

const daysOfWeek = [
  { key: "monday", name: "Lunes" },
  { key: "tuesday", name: "Martes" },
  { key: "wednesday", name: "Miércoles" },
  { key: "thursday", name: "Jueves" },
  { key: "friday", name: "Viernes" },
  { key: "saturday", name: "Sábado" },
  { key: "sunday", name: "Domingo" }
];

export default function DietManager({ patient, onUpdate }) {
  const [weeklyPlans, setWeeklyPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [newPlan, setNewPlan] = useState({
    diet_type: "mediterranean",
    description: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    loadWeeklyPlans();
  }, [patient.id]);

  const loadWeeklyPlans = async () => {
    setLoading(true);
    try {
      // Obtener todos los planes activos del paciente
      const plans = await DietPlan.filter({ 
        patient_id: patient.id, 
        is_active: true 
      }, '-created_date');

      // Organizar por día de la semana
      const weekPlans = {};
      
      for (const day of daysOfWeek) {
        const dayPlans = plans.filter(plan => plan.day_of_week === day.key);
        if (dayPlans.length > 0) {
          // Tomar el más reciente
          weekPlans[day.key] = dayPlans[0];
        }
      }

      setWeeklyPlans(weekPlans);
    } catch (error) {
      console.error("Error loading diet plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDayPlan = async (dayKey, dietType, description = "") => {
    setSaving(true);
    try {
      // Desactivar planes existentes para este día
      if (weeklyPlans[dayKey]) {
        await DietPlan.update(weeklyPlans[dayKey].id, { is_active: false });
      }

      // Crear nuevo plan
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Plan válido por 30 días

      await DietPlan.create({
        patient_id: patient.id,
        diet_type: dietType,
        day_of_week: dayKey,
        is_active: true,
        description: description || `Dieta ${dietTypes.find(d => d.value === dietType)?.name} para ${daysOfWeek.find(d => d.key === dayKey)?.name}`,
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      await loadWeeklyPlans();
      setEditingDay(null);
      onUpdate?.();
    } catch (error) {
      console.error("Error saving diet plan:", error);
      alert("Error al guardar el plan de dieta");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAssign = async (dietType) => {
    setSaving(true);
    try {
      // Asignar la misma dieta a todos los días de la semana
      for (const day of daysOfWeek) {
        if (weeklyPlans[day.key]) {
          await DietPlan.update(weeklyPlans[day.key].id, { is_active: false });
        }

        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await DietPlan.create({
          patient_id: patient.id,
          diet_type: dietType,
          day_of_week: day.key,
          is_active: true,
          description: `Dieta ${dietTypes.find(d => d.value === dietType)?.name} - Plan semanal`,
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        });
      }

      await loadWeeklyPlans();
      onUpdate?.();
    } catch (error) {
      console.error("Error applying weekly plan:", error);
      alert("Error al aplicar el plan semanal");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-green-600" />
          </div>
          Gestión de Dietas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Asignación rápida */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Asignación Rápida (Toda la Semana)</h3>
          <div className="flex flex-wrap gap-2">
            {dietTypes.map((diet) => (
              <Button
                key={diet.value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAssign(diet.value)}
                disabled={saving}
                className="hover:bg-gray-50"
              >
                <span className={`w-3 h-3 rounded-full mr-2 ${diet.color}`}></span>
                {diet.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Planes por día */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Plan Diario</h3>
          <div className="space-y-3">
            {daysOfWeek.map((day) => {
              const dayPlan = weeklyPlans[day.key];
              const dietInfo = dietTypes.find(d => d.value === dayPlan?.diet_type);
              const isToday = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase() === day.name.toLowerCase();

              return (
                <div key={day.key} className={`p-4 border rounded-xl ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isToday && <Calendar className="w-4 h-4 text-blue-600" />}
                        <h4 className="font-medium text-gray-900">{day.name}</h4>
                        {isToday && <Badge variant="outline" className="text-xs">Hoy</Badge>}
                      </div>
                      
                      {dayPlan && dietInfo ? (
                        <Badge className={`text-xs ${dietInfo.color}`}>
                          {dietInfo.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Sin asignar
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {editingDay === day.key ? (
                        <div className="flex items-center gap-2">
                          <Select 
                            defaultValue={dayPlan?.diet_type || "mediterranean"}
                            onValueChange={(value) => setNewPlan({...newPlan, diet_type: value})}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dietTypes.map((diet) => (
                                <SelectItem key={diet.value} value={diet.value}>
                                  {diet.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => handleSaveDayPlan(day.key, newPlan.diet_type)}
                            disabled={saving}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingDay(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDay(day.key);
                            setNewPlan({...newPlan, diet_type: dayPlan?.diet_type || "mediterranean"});
                          }}
                        >
                          {dayPlan ? "Cambiar" : "Asignar"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {dayPlan?.description && (
                    <p className="mt-2 text-sm text-gray-600">{dayPlan.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Información de ayuda */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Instrucciones:</strong></p>
            <p>• Use "Asignación Rápida" para aplicar la misma dieta toda la semana</p>
            <p>• Configure dietas específicas por día usando "Plan Diario"</p>
            <p>• El día actual se resalta en azul</p>
            <p>• Los cambios se aplican inmediatamente</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}