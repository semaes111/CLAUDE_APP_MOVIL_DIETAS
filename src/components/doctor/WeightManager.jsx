
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Scale, Target, Save, TrendingDown } from "lucide-react";
import { Patient } from "@/api/entities";
import { WeightRecord } from "@/api/entities";
import { format } from "date-fns";

export default function WeightManager({ patient, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [weightData, setWeightData] = useState({
    current_weight: patient.current_weight || "",
    target_weight: patient.target_weight || "",
    notes: ""
  });

  useEffect(() => {
    if (patient) {
        setWeightData({
            current_weight: patient.current_weight || "",
            target_weight: patient.target_weight || "",
            notes: "" // Always clear notes when patient data changes
        });
    }
  }, [patient]);

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Siempre crear un registro de peso nuevo
      await WeightRecord.create({
        patient_id: patient.id,
        weight: parseFloat(weightData.current_weight),
        date: new Date().toISOString().split('T')[0],
        notes: weightData.notes || `Actualización de peso por profesional: ${parseFloat(weightData.current_weight)} kg`
      });

      // Actualizar peso actual y objetivo del paciente
      await Patient.update(patient.id, {
        current_weight: parseFloat(weightData.current_weight),
        target_weight: parseFloat(weightData.target_weight)
      });

      alert("Peso actualizado correctamente");
      if (typeof onUpdate === 'function') { // Llamada segura
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating weight:", error);
      alert("Error al actualizar el peso. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setWeightData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const weightDifference = patient.current_weight - patient.target_weight;
  const weightProgress = patient.initial_weight ? 
    ((patient.initial_weight - patient.current_weight) / (patient.initial_weight - patient.target_weight)) * 100 : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-600" />
          </div>
          Gestión de Peso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado actual del peso */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <TrendingDown className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{patient.current_weight} kg</p>
            <p className="text-sm text-gray-600">Peso Actual</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{patient.target_weight} kg</p>
            <p className="text-sm text-gray-600">Peso Objetivo</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
              <span className="text-lg font-bold">Δ</span>
            </div>
            <p className={`text-2xl font-bold ${weightDifference > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)} kg
            </p>
            <p className="text-sm text-gray-600">Diferencia</p>
          </div>
        </div>

        {/* Progreso */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-800">Progreso del tratamiento</span>
            <Badge variant="outline" className="text-purple-700">
              {Math.round(Math.max(0, Math.min(100, weightProgress)))}%
            </Badge>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${Math.max(0, Math.min(100, weightProgress))}%` }}
            ></div>
          </div>
        </div>

        {/* Formulario de actualización */}
        <form onSubmit={handleSaveWeight} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_weight">Nuevo Peso Actual (kg)</Label>
              <Input
                id="current_weight"
                type="number"
                step="0.1"
                value={weightData.current_weight}
                onChange={(e) => handleInputChange('current_weight', e.target.value)}
                placeholder={patient.current_weight.toString()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_weight">Peso Objetivo (kg)</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                value={weightData.target_weight}
                onChange={(e) => handleInputChange('target_weight', e.target.value)}
                placeholder={patient.target_weight.toString()}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas del Registro</Label>
            <Textarea
              id="notes"
              value={weightData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observaciones sobre el peso, cumplimiento de la dieta, etc..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Actualizar Peso"}
          </Button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Información:</strong></p>
            <p>• Los cambios de peso se registran automáticamente</p>
            <p>• Las notas quedan guardadas para futuras consultas</p>
            <p>• El progreso se calcula basándose en el peso inicial</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
