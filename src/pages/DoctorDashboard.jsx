
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  Plus,
  Stethoscope,
  Shield,
  Pencil
} from "lucide-react";
import { Patient } from "@/api/entities";
import { User as UserSDK } from "@/api/entities";

import PatientList from "../components/doctor/PatientList";
import PatientForm from "../components/doctor/PatientForm";
import PatientDetails from "../components/doctor/PatientDetails";
import CodeManager from "../components/doctor/CodeManager";
import DietManager from "../components/doctor/DietManager";
import ProfileEditor from "../components/doctor/ProfileEditor";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const currentUser = await UserSDK.me();
      if (!currentUser.role || (currentUser.role !== 'profesional' && currentUser.role !== 'admin')) {
        // Redirigir a página de acceso en lugar de Home
        navigate(createPageUrl("ProfessionalAccess"));
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Authentication error:", error);
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loadPatients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data;
      // Si es administrador, cargar todos los pacientes
      if (user.role === 'admin') {
        data = await Patient.list('-created_date');
      } else {
        // Si es profesional, solo cargar sus pacientes asignados
        data = await Patient.filter({ assigned_doctor: user.email }, '-created_date');
      }

      setPatients(data);

      // Clave: Actualizar el paciente seleccionado con los datos más recientes
      if (selectedPatient) {
        const updatedSelectedPatient = data.find(p => p.id === selectedPatient.id);
        if (updatedSelectedPatient) {
          setSelectedPatient(updatedSelectedPatient);
        } else {
          // El paciente puede haber sido eliminado, así que se limpia la selección
          setSelectedPatient(null);
        }
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPatient]);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user, loadPatients]);

  const handlePatientAdded = () => {
    setShowAddPatient(false);
    setSelectedPatient(null); // Ensure no patient is selected after adding a new one
    setShowProfileEditor(false); // Ensure profile editor is hidden
    loadPatients();
  };

  const handlePatientUpdate = () => {
    // Esta función se llama cuando se actualiza un paciente (ej. peso)
    // y vuelve a cargar la lista para reflejar los cambios.
    loadPatients();
  };

  const handleBackToList = () => {
    // Limpiar inmediatamente todos los estados de navegación
    setSelectedPatient(null);
    setShowAddPatient(false);
    setShowProfileEditor(false);
  };

  const handlePatientDelete = () => {
    loadPatients();
    // Si el paciente eliminado era el seleccionado, limpiar la selección
    if (selectedPatient) {
      setSelectedPatient(null);
    }
  };

  const handleProfileUpdate = () => {
    fetchUser(); // Re-fetch user data to update the dashboard
    setShowProfileEditor(false); // Hide the editor
  };

  // Show a loading spinner while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => !p.is_blocked).length;
  const expiringCodes = patients.filter(p => {
    if (!p.code_expiry) return false; // Ensure code_expiry exists
    const expiry = new Date(p.code_expiry);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Panel {user.role === 'admin' ? 'Administrativo' : 'Médico'}
            </h1>
            <div className="space-y-1">
              <p className="text-gray-600">Bienvenido, {user.full_name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>DNI: {user.dni || 'No asignado'}</span>
                <span>Rol: {user.role === 'admin' ? 'Administrador' : 'Profesional'}</span>
                {user.specialization && <span>Especialidad: {user.specialization}</span>}
                {user.license_number && <span>Colegiado: {user.license_number}</span>}
                {user.role === 'admin' && <span className="text-blue-600 font-medium">Acceso: Todos los pacientes</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(selectedPatient || showAddPatient || showProfileEditor) && (
              <Button 
                onClick={handleBackToList}
                variant="outline"
                className="shadow-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Lista de Pacientes
              </Button>
            )}
            <Button 
                onClick={() => setShowProfileEditor(true)}
                variant="outline"
                className="shadow-sm"
            >
                <Pencil className="w-4 h-4 mr-2" />
                Editar Perfil
            </Button>
            <Button 
              onClick={() => setShowAddPatient(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Paciente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold">{totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pacientes Activos</p>
                  <p className="text-2xl font-bold">{activePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Códigos por Expirar</p>
                  <p className="text-2xl font-bold">{expiringCodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mi Rol</p>
                  <p className="text-lg font-bold">{user.role === 'admin' ? 'Admin' : 'Médico'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {showProfileEditor ? (
          <ProfileEditor
            user={user}
            onUpdate={handleProfileUpdate}
            onCancel={() => {
              setShowProfileEditor(false);
              setSelectedPatient(null);
            }}
          />
        ) : showAddPatient ? (
          <div className="grid lg:grid-cols-1 gap-6">
            <PatientForm
              onPatientAdded={handlePatientAdded}
              onCancel={() => {
                setShowAddPatient(false);
                setSelectedPatient(null);
              }}
              doctorEmail={user.email} // Pass the current doctor's email for assignment
            />
          </div>
        ) : selectedPatient ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PatientDetails
                patient={selectedPatient}
                onBack={handleBackToList}
                onUpdate={handlePatientUpdate} // Se pasa la función de actualización
              />
            </div>
            <div className="space-y-6">
              <CodeManager
                patient={selectedPatient}
                onUpdate={handlePatientUpdate} // Se pasa la función de actualización
              />
              <DietManager
                patient={selectedPatient}
                onUpdate={handlePatientUpdate}
              />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-1 gap-6">
            <PatientList
              patients={patients}
              loading={loading}
              onPatientSelect={setSelectedPatient}
              onUpdate={handlePatientUpdate}
              onPatientDelete={handlePatientDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
