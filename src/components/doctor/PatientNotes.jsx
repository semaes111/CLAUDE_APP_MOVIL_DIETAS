
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calendar, User } from "lucide-react";
import { WeightRecord } from "@/api/entities";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PatientNotes({ patient, onUpdate }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({
    notes: "",
    weight: patient.current_weight || "",
    type: "seguimiento"
  });

  const noteTypes = [
    { value: "seguimiento", name: "Seguimiento General", color: "bg-blue-100 text-blue-800" },
    { value: "cumplimiento", name: "Cumplimiento Dieta", color: "bg-green-100 text-green-800" },
    { value: "incidencia", name: "Incidencia", color: "bg-orange-100 text-orange-800" },
    { value: "objetivo", name: "Cambio Objetivo", color: "bg-purple-100 text-purple-800" }
  ];

  useEffect(() => {
    loadNotes();
  }, [patient.id]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const records = await WeightRecord.filter({ patient_id: patient.id }, '-date');
      setNotes(records);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await WeightRecord.create({
        patient_id: patient.id,
        weight: parseFloat(newNote.weight),
        date: new Date().toISOString().split('T')[0],
        notes: `[${noteTypes.find(t => t.value === newNote.type)?.name}] ${newNote.notes}`
      });

      await loadNotes();
      setNewNote({
        notes: "",
        weight: patient.current_weight || "",
        type: "seguimiento"
      });
      setShowAddNote(false);
      if (typeof onUpdate === 'function') { // Llamada segura
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error al guardar la nota. Inténtelo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const getNoteTypeColor = (noteText) => {
    if (noteText.includes('[Cumplimiento')) return "bg-green-100 text-green-800";
    if (noteText.includes('[Incidencia')) return "bg-orange-100 text-orange-800";
    if (noteText.includes('[Cambio Objetivo')) return "bg-purple-100 text-purple-800";
    return "bg-blue-100 text-blue-800";
  };

  const getNoteType = (noteText) => {
    if (noteText.includes('[Cumplimiento')) return "Cumplimiento";
    if (noteText.includes('[Incidencia')) return "Incidencia";
    if (noteText.includes('[Cambio Objetivo')) return "Objetivo";
    if (noteText.includes('[Seguimiento')) return "Seguimiento";
    return "Registro";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            Notas y Seguimiento
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddNote(!showAddNote)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Nota
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para nueva nota */}
        {showAddNote && (
          <form onSubmit={handleSaveNote} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="note_type">Tipo de Nota</Label>
                <Select
                  value={newNote.type}
                  onValueChange={(value) => setNewNote({...newNote, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noteTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note_weight">Peso Registrado (kg)</Label>
                <input
                  id="note_weight"
                  type="number"
                  step="0.1"
                  value={newNote.weight}
                  onChange={(e) => setNewNote({...newNote, weight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_text">Nota</Label>
              <Textarea
                id="note_text"
                value={newNote.notes}
                onChange={(e) => setNewNote({...newNote, notes: e.target.value})}
                placeholder="Descripción detallada del seguimiento, cumplimiento, incidencias, etc..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {saving ? "Guardando..." : "Guardar Nota"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddNote(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de notas */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-xl">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${getNoteTypeColor(note.notes)}`}>
                      {getNoteType(note.notes)}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(note.date), "dd 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {note.weight} kg
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {note.notes.replace(/^\[.*?\]\s*/, '')}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay notas de seguimiento registradas</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
