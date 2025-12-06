
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, ArrowLeft, Save } from "lucide-react";
import { Patient } from "@/api/entities";

export default function EditPatientForm({ patient, onCancel, onPatientUpdated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: patient.full_name || "",
    age: patient.age?.toString() || "",
    height: patient.height?.toString() || "", // New field: Estatura
    current_weight: patient.current_weight?.toString() || "", // New field: Peso Actual
    initial_weight: patient.initial_weight?.toString() || "", // New field: Peso Inicial
    best_weight_5_years: patient.best_weight_5_years?.toString() || "",
    target_weight: patient.target_weight?.toString() || "",
    has_diseases: patient.has_diseases || false,
    diseases_description: patient.diseases_description || "",
    does_exercise: patient.does_exercise || false,
    family_history: {
      diabetes_type2: patient.family_history?.diabetes_type2 || false,
      pcos: patient.family_history?.pcos || false,
      hypothyroidism: patient.family_history?.hypothyroidism || false
    },
    gynecological_problems: patient.gynecological_problems || false,
    allergies_medications: patient.allergies_medications || "",
    food_intolerances: patient.food_intolerances || "",
    stress_level: patient.stress_level || 5,
    food_control_level: patient.food_control_level || 5,
    motivation_level: patient.motivation_level || 5
  });

  const handleSubmit = async (e) => { // Renamed from handleUpdate as per outline
    e.preventDefault();
    setLoading(true);

    try {
      // Preserve original data transformation logic for numeric fields
      const updateData = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height), // Required in UI
        current_weight: parseFloat(formData.current_weight), // Assumed required based on parsing
        initial_weight: parseFloat(formData.initial_weight), // Assumed required based on parsing
        best_weight_5_years: formData.best_weight_5_years ? parseFloat(formData.best_weight_5_years) : null,
        target_weight: parseFloat(formData.target_weight) // Required in UI
      };

      await Patient.update(patient.id, updateData);
      alert("Datos del paciente actualizados correctamente");
      // Safely call onPatientUpdated if it's a function
      if (typeof onPatientUpdated === 'function') {
        onPatientUpdated();
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Error al actualizar los datos del paciente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onCancel}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <UserCog className="w-5 h-5 text-orange-600" />
            </div>
            Editar Datos de {patient.full_name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Updated onSubmit to handleSubmit */}
          {/* Datos básicos */}
          <div className="grid md:grid-cols-3 gap-4"> {/* Changed to 3 columns */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Estatura (m) *</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                placeholder="Ej: 1.75"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Datos de peso */}
          <div className="grid md:grid-cols-3 gap-4"> {/* Changed to 3 columns as per outline */}
            <div className="space-y-2">
              <Label htmlFor="current_weight">Peso Actual (kg) *</Label> {/* New field */}
              <Input
                id="current_weight"
                type="number"
                step="0.1"
                value={formData.current_weight}
                onChange={(e) => handleInputChange('current_weight', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial_weight">Peso Inicial (kg) *</Label> {/* New field */}
              <Input
                id="initial_weight"
                type="number"
                step="0.1"
                value={formData.initial_weight}
                onChange={(e) => handleInputChange('initial_weight', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="best_weight_5_years">Mejor Peso en 5 años (kg)</Label>
              <Input
                id="best_weight_5_years"
                type="number"
                step="0.1"
                value={formData.best_weight_5_years}
                onChange={(e) => handleInputChange('best_weight_5_years', e.target.value)}
              />
            </div>
            {/* This will wrap to the next row if grid is 3 columns, which is acceptable for flexbox/grid */}
            <div className="space-y-2">
              <Label htmlFor="target_weight">Peso Objetivo (kg) *</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                value={formData.target_weight}
                onChange={(e) => handleInputChange('target_weight', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Antecedentes y Condiciones */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-2">Antecedentes y Condiciones</h3>
            
            <div className="space-y-2">
              <Label>Antecedentes Familiares</Label>
              <div className="grid md:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="diabetes"
                    checked={formData.family_history.diabetes_type2}
                    onCheckedChange={(checked) => handleInputChange('family_history.diabetes_type2', checked)}
                  />
                  <Label htmlFor="diabetes">Diabetes Tipo 2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pcos"
                    checked={formData.family_history.pcos}
                    onCheckedChange={(checked) => handleInputChange('family_history.pcos', checked)}
                  />
                  <Label htmlFor="pcos">Ovario Poliquístico</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hypothyroidism"
                    checked={formData.family_history.hypothyroidism}
                    onCheckedChange={(checked) => handleInputChange('family_history.hypothyroidism', checked)}
                  />
                  <Label htmlFor="hypothyroidism">Hipotiroidismo</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_diseases"
                  checked={formData.has_diseases}
                  onCheckedChange={(checked) => handleInputChange('has_diseases', checked)}
                />
                <Label htmlFor="has_diseases">Tiene enfermedades diagnosticadas</Label>
              </div>
              {formData.has_diseases && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="diseases_description">Descripción de Enfermedades</Label>
                  <Textarea
                    id="diseases_description"
                    value={formData.diseases_description}
                    onChange={(e) => handleInputChange('diseases_description', e.target.value)}
                    placeholder="Describir enfermedades, diagnósticos, etc..."
                  />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="does_exercise"
                  checked={formData.does_exercise}
                  onCheckedChange={(checked) => handleInputChange('does_exercise', checked)}
                />
                <Label htmlFor="does_exercise">Hace deporte</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gynecological_problems"
                  checked={formData.gynecological_problems}
                  onCheckedChange={(checked) => handleInputChange('gynecological_problems', checked)}
                />
                <Label htmlFor="gynecological_problems">Problemas ginecológicos</Label>
              </div>
            </div>
          </div>

          {/* Alergias e intolerancias */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias a Fármacos</Label>
              <Textarea
                id="allergies"
                value={formData.allergies_medications}
                onChange={(e) => handleInputChange('allergies_medications', e.target.value)}
                placeholder="Especificar alergias..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intolerances">Intolerancias Alimentarias</Label>
              <Textarea
                id="intolerances"
                value={formData.food_intolerances}
                onChange={(e) => handleInputChange('food_intolerances', e.target.value)}
                placeholder="Especificar intolerancias..."
              />
            </div>
          </div>

          {/* Niveles (0-10) */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stress_level">Nivel de Estrés (0-10)</Label>
              <Select
                value={formData.stress_level.toString()}
                onValueChange={(value) => handleInputChange('stress_level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 11}, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="food_control">Control sobre la Comida (0-10)</Label>
              <Select
                value={formData.food_control_level.toString()}
                onValueChange={(value) => handleInputChange('food_control_level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 11}, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivation">Motivación para la Dieta (0-10)</Label>
              <Select
                value={formData.motivation_level.toString()}
                onValueChange={(value) => handleInputChange('motivation_level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 11}, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
