import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Search,
  Calendar,
  Target,
  TrendingDown,
  AlertTriangle,
  Eye,
  Trash2 // Added Trash2 icon
} from "lucide-react";
import { format } from "date-fns";
import { Patient } from "@/api/entities"; // Added Patient import

export default function PatientList({ patients, loading, onPatientSelect, onUpdate, onPatientDelete }) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCodeExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`¿Está seguro de que desea eliminar al paciente ${patient.full_name}? Esta acción no se puede deshacer.`)) {
      try {
        await Patient.delete(patient.id);
        onPatientDelete?.();
        alert('Paciente eliminado correctamente');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error al eliminar el paciente');
      }
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
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
            <User className="w-5 h-5 text-blue-600" />
          </div>
          Lista de Pacientes
        </CardTitle>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredPatients.map((patient) => {
            return (
              <div key={patient.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{patient.full_name}</h3>
                      <p className="text-gray-600">Edad: {patient.age} años</p>
                      {/* Mostrar médico asignado para administradores */}
                      {patient.assigned_doctor && (
                        <p className="text-sm text-gray-500">Médico: {patient.assigned_doctor}</p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          {patient.current_weight} kg
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          Objetivo: {patient.target_weight} kg
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {isCodeExpiringSoon(patient.code_expiry) && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Código expira pronto
                      </Badge>
                    )}

                    {patient.is_blocked && (
                      <Badge variant="secondary" className="text-xs">
                        Bloqueado
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Creado: {format(new Date(patient.created_date), "dd/MM/yyyy")}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPatientSelect(patient)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePatient(patient)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}