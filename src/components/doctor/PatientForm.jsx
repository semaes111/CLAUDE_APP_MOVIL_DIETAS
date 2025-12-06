
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Patient } from "@/api/entities";
import { PatientAccessCode } from "@/api/entities"; // New import

export default function PatientForm({ onPatientAdded, onCancel, doctorEmail }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    height: "", // Added height field
    current_weight: "",
    initial_weight: "",
    best_weight_5_years: "",
    target_weight: "",
    has_diseases: false,
    diseases_description: "",
    does_exercise: false,
    family_history: {
      diabetes_type2: false,
      pcos: false,
      hypothyroidism: false
    },
    gynecological_problems: false,
    allergies_medications: "",
    food_intolerances: "",
    stress_level: 5,
    food_control_level: 5,
    motivation_level: 5
  });

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessCode = generateAccessCode();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 28);

      // Crear el paciente
      const newPatient = await Patient.create({
        ...formData,
        age: parseInt(formData.age),
        height: formData.height ? parseFloat(formData.height) : null,
        current_weight: parseFloat(formData.current_weight),
        initial_weight: parseFloat(formData.current_weight),
        best_weight_5_years: formData.best_weight_5_years ? parseFloat(formData.best_weight_5_years) : null,
        target_weight: parseFloat(formData.target_weight),
        assigned_doctor: doctorEmail,
        access_code: accessCode,
        code_expiry: expiryDate.toISOString()
      });

      // Crear el código de acceso con datos del paciente
      await PatientAccessCode.create({
        patient_id: newPatient.id,
        access_code: accessCode,
        code_expiry: expiryDate.toISOString(),
        is_blocked: false,
        patient_data: {
          full_name: formData.full_name,
          age: parseInt(formData.age),
          height: formData.height ? parseFloat(formData.height) : null,
          current_weight: parseFloat(formData.current_weight),
          initial_weight: parseFloat(formData.current_weight),
          target_weight: parseFloat(formData.target_weight),
          assigned_doctor: doctorEmail
        }
      });

      onPatientAdded();
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Error al crear el paciente. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
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
            onClick={onCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            Nuevo Paciente
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos básicos */}
          <div className="grid md:grid-cols-3 gap-4"> {/* Changed to md:grid-cols-3 */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                required />
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_weight" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Peso Inicial (kg) *</Label>
              <Input
                id="current_weight"
                type="number"
                step="0.1"
                value={formData.current_weight}
                onChange={(e) => handleInputChange('current_weight', e.target.value)}
                required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="best_weight_5_years">Mejor Peso en 5 años (kg)</Label>
              <Input
                id="best_weight_5_years"
                type="number"
                step="0.1"
                value={formData.best_weight_5_years}
                onChange={(e) => handleInputChange('best_weight_5_years', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_weight">Peso Objetivo (kg) *</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                value={formData.target_weight}
                onChange={(e) => handleInputChange('target_weight', e.target.value)}
                required />
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
                    onCheckedChange={(checked) => handleInputChange('family_history.diabetes_type2', checked)} />
                    <Label htmlFor="diabetes">Diabetes Tipo 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                    id="pcos"
                    checked={formData.family_history.pcos}
                    onCheckedChange={(checked) => handleInputChange('family_history.pcos', checked)} />
                    <Label htmlFor="pcos">Ovario Poliquístico</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                    id="hypothyroidism"
                    checked={formData.family_history.hypothyroidism}
                    onCheckedChange={(checked) => handleInputChange('family_history.hypothyroidism', checked)} />
                    <Label htmlFor="hypothyroidism">Hipotiroidismo</Label>
                  </div>
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                  id="has_diseases"
                  checked={formData.has_diseases}
                  onCheckedChange={(checked) => handleInputChange('has_diseases', checked)} />
                  <Label htmlFor="has_diseases">Tiene enfermedades diagnosticadas</Label>
                </div>
                {formData.has_diseases &&
              <div className="space-y-2 pl-6">
                      <Label htmlFor="diseases_description">Descripción de Enfermedades</Label>
                      <Textarea
                  id="diseases_description"
                  value={formData.diseases_description}
                  onChange={(e) => handleInputChange('diseases_description', e.target.value)}
                  placeholder="Describir enfermedades, diagnósticos, etc..." />
                    </div>
              }
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="does_exercise"
                  checked={formData.does_exercise}
                  onCheckedChange={(checked) => handleInputChange('does_exercise', checked)} />
                <Label htmlFor="does_exercise">Hace deporte</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gynecological_problems"
                  checked={formData.gynecological_problems}
                  onCheckedChange={(checked) => handleInputChange('gynecological_problems', checked)} />
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
                placeholder="Especificar alergias..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intolerances">Intolerancias Alimentarias</Label>
              <Textarea
                id="intolerances"
                value={formData.food_intolerances}
                onChange={(e) => handleInputChange('food_intolerances', e.target.value)}
                placeholder="Especificar intolerancias..." />
            </div>
          </div>

          {/* Niveles (1-10) */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stress_level">Nivel de Estrés (0-10)</Label>
              <Select
                value={formData.stress_level.toString()}
                onValueChange={(value) => handleInputChange('stress_level', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) =>
                  <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="food_control">Control sobre la Comida (0-10)</Label>
              <Select
                value={formData.food_control_level.toString()}
                onValueChange={(value) => handleInputChange('food_control_level', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) =>
                  <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivation">Motivación para la Dieta (0-10)</Label>
              <Select
                value={formData.motivation_level.toString()}
                onValueChange={(value) => handleInputChange('motivation_level', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) =>
                  <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  )}
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
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              {loading ? "Creando..." : "Crear Paciente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
