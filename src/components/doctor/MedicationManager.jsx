
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Calendar, Clock, Trash2, X, MousePointerClick } from "lucide-react";
import { Medication } from "@/api/entities";
import { format } from "date-fns";

const weightLossDrugs = ["Saxenda", "Ozempic", "Wegovy", "Mounjaro"];

export default function MedicationManager({ patient, onUpdate }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    medication_name: "",
    dosage: "",
    clicks: "", // Added clicks field
    frequency: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    side_effects: "",
    side_effects_treatment: "",
  });

  useEffect(() => {
    loadMedications();
  }, [patient.id]);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const records = await Medication.filter({ patient_id: patient.id }, '-created_date');
      setMedications(records);
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedication = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Medication.create({
        ...newMed,
        patient_id: patient.id,
        is_active: true,
        clicks: newMed.clicks ? parseInt(newMed.clicks) : null, // Parse clicks to integer
      });

      await loadMedications();
      setNewMed({
        medication_name: "",
        dosage: "",
        clicks: "", // Reset clicks
        frequency: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        side_effects: "",
        side_effects_treatment: "",
      });
      setShowAddForm(false);
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving medication:", error);
      alert("Error al guardar la medicación. Inténtelo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (medId) => {
    setSaving(true);
    try {
      await Medication.update(medId, { is_active: false });
      await loadMedications();
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deactivating medication:", error);
    } finally {
      setSaving(false);
    }
  };

  const activeMedications = medications.filter(m => m.is_active);

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-red-600" />
            </div>
            Gestión Farmacológica
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Prescripción
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para nueva prescripción */}
        {showAddForm && (
          <form onSubmit={handleSaveMedication} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            {/* Fármaco field - now always full width */}
            <div className="space-y-2">
              <Label>Fármaco</Label>
              <Select
                onValueChange={(value) => setNewMed({...newMed, medication_name: value === 'otro' ? '' : value})}
                value={newMed.medication_name}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un fármaco o escriba uno" />
                </SelectTrigger>
                <SelectContent>
                  {weightLossDrugs.map(drug => (
                    <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                  ))}
                  <SelectItem value="otro">Otro (especificar)</SelectItem>
                </SelectContent>
              </Select>
              {/* Input for medication name remains for 'otro' or direct entry */}
              <Input
                value={newMed.medication_name}
                onChange={(e) => setNewMed({...newMed, medication_name: e.target.value})}
                placeholder="Nombre del fármaco"
                required
              />
            </div>
            {/* New grid for Dosage, Clicks, and Frequency */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosis (mg)</Label>
                <Input
                  id="dosage"
                  type="text" // Changed type to text for flexible input (e.g., "0.25 mg")
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                  placeholder="Ej: 0.25 mg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clicks">Número de Clics</Label>
                <Input
                  id="clicks"
                  type="number"
                  step="1"
                  min="0"
                  value={newMed.clicks}
                  onChange={(e) => setNewMed({...newMed, clicks: e.target.value})}
                  placeholder="Ej: 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Input
                  id="frequency"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                  placeholder="Ej: 1 vez/semana"
                  required
                />
              </div>
            </div>
            {/* Existing grid for Start and End Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newMed.start_date}
                  onChange={(e) => setNewMed({...newMed, start_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Fin (opcional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newMed.end_date}
                  onChange={(e) => setNewMed({...newMed, end_date: e.target.value})}
                />
              </div>
            </div>
            {/* Side Effects fields */}
            <div className="space-y-2">
              <Label htmlFor="side_effects">Efectos Secundarios Posibles</Label>
              <Textarea
                id="side_effects"
                value={newMed.side_effects}
                onChange={(e) => setNewMed({...newMed, side_effects: e.target.value})}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="side_effects_treatment">Tratamiento de Efectos Secundarios</Label>
              <Textarea
                id="side_effects_treatment"
                value={newMed.side_effects_treatment}
                onChange={(e) => setNewMed({...newMed, side_effects_treatment: e.target.value})}
                rows={2}
              />
            </div>
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Prescripción"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de medicaciones activas */}
        <h3 className="text-lg font-medium text-gray-800 pt-4">Prescripciones Activas</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <p>Cargando...</p>
          ) : activeMedications.length > 0 ? (
            activeMedications.map((med) => (
              <div key={med.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{med.medication_name}</h4>
                  <Button variant="ghost" size="sm" onClick={() => handleDeactivate(med.id)} disabled={saving}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                {/* Medication details */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span><strong>Dosis:</strong> {med.dosage}</span>
                  {med.clicks !== null && med.clicks !== undefined && ( // Display clicks only if present
                    <span><strong>Clics:</strong> {med.clicks}</span>
                  )}
                  <span><strong>Frecuencia:</strong> {med.frequency}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Inicio: {format(new Date(med.start_date), "dd/MM/yyyy")}</span>
                  </div>
                  {med.end_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Fin: {format(new Date(med.end_date), "dd/MM/yyyy")}</span>
                    </div>
                  )}
                </div>
                {med.side_effects && (
                  <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                    <p><strong>Efectos 2arios:</strong> {med.side_effects}</p>
                    {med.side_effects_treatment && <p><strong>Tto:</strong> {med.side_effects_treatment}</p>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-500">No hay medicación activa prescrita.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
