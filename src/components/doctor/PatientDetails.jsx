
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Activity, Heart, AlertTriangle, Scale, FileText, TrendingDown, Pill, Pencil } from "lucide-react";
import { Medication } from "@/api/entities";
import { format } from "date-fns";

import WeightManager from "./WeightManager";
import PatientNotes from "./PatientNotes";
import WeightEvolutionChart from "./WeightEvolutionChart";
import MedicationManager from "./MedicationManager";
import EditPatientForm from "./EditPatientForm";

const getBmiCategory = (bmi) => {
  if (!bmi) return { category: "Sin datos", color: "bg-gray-200 text-gray-800" };
  if (bmi < 18.5) return { category: "Bajo peso", color: "bg-blue-100 text-blue-800" };
  if (bmi < 25) return { category: "Normopeso", color: "bg-green-100 text-green-800" };
  if (bmi < 30) return { category: "Sobrepeso", color: "bg-yellow-100 text-yellow-800" };
  if (bmi < 35) return { category: "Obesidad grado I", color: "bg-orange-100 text-orange-800" };
  if (bmi < 40) return { category: "Obesidad grado II", color: "bg-red-100 text-red-800" };
  return { category: "Obesidad grado III", color: "bg-red-200 text-red-900 font-bold" };
};


export default function PatientDetails({ patient, onBack, onUpdate }) {
  const [medications, setMedications] = React.useState([]);
  const [medicationsLoading, setMedicationsLoading] = React.useState(true);
  const [showEditForm, setShowEditForm] = React.useState(false);

  const loadMedications = React.useCallback(async () => {
    setMedicationsLoading(true);
    try {
      const meds = await Medication.filter({
        patient_id: patient.id,
        is_active: true
      }, '-created_date');
      setMedications(meds);
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setMedicationsLoading(false);
    }
  }, [patient.id]);

  React.useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const handlePatientUpdated = () => {
    setShowEditForm(false);
    if (typeof onUpdate === 'function') {
      onUpdate();
    }
  };

  // El IMC se recalcula aquí en cada render, usando los datos actualizados del paciente
  const bmi = patient.height ? (patient.current_weight / (patient.height * patient.height)).toFixed(2) : null;
  const bmiInfo = getBmiCategory(bmi);

  if (showEditForm) {
    return (
      <EditPatientForm
        patient={patient}
        onCancel={() => setShowEditForm(false)}
        onPatientUpdated={handlePatientUpdated}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{patient.full_name}</h1>
              <p className="text-gray-500">Viendo detalles del paciente</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar Datos
          </Button>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
        <CardContent className="pt-6">
          {/* Información básica en tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="weight">Peso</TabsTrigger>
              <TabsTrigger value="medication">Medicación</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
              <TabsTrigger value="chart">Evolución</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                  <div className="space-y-2">
                    <p><strong>Nombre:</strong> {patient.full_name}</p>
                    <p><strong>Edad:</strong> {patient.age} años</p>
                    <p><strong>Estatura:</strong> {patient.height ? `${patient.height} m` : 'No especificada'}</p>
                    <p><strong>Peso Inicial:</strong> {patient.initial_weight || "No especificado"} kg</p>
                    <p><strong className="text-[#f10e0e]">Peso Actual:</strong> {patient.current_weight} kg</p>
                    <p><strong>Peso Objetivo:</strong> {patient.target_weight} kg</p>
                    <p><strong>Mejor Peso (5 años):</strong> {patient.best_weight_5_years || "No especificado"} kg</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={patient.is_blocked ? "destructive" : "default"}>
                        {patient.is_blocked ? "Bloqueado" : "Activo"}
                      </Badge>
                    </div>
                    <p><strong>Código de Acceso:</strong> {patient.access_code}</p>
                    <p><strong>Expira:</strong> {new Date(patient.code_expiry).toLocaleDateString()}</p>
                    {bmi && (
                      <div className="mt-2 space-y-2">
                        <p className="font-semibold">Índice de Masa Corporal (IMC):</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{bmi}</span>
                          <Badge className={`${bmiInfo.color} text-sm`}>{bmiInfo.category}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medicación Actual */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-red-600" />
                  Medicación Actual Prescrita
                </h3>
                {medicationsLoading ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">Cargando medicación...</p>
                  </div>
                ) : medications.length > 0 ? (
                  <div className="grid gap-3">
                    {medications.map((med) => (
                      <div key={med.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-blue-900 text-lg">{med.medication_name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700 mt-2">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">💉 Dosis:</span>
                                <span>{med.dosage}</span>
                              </div>
                              {med.clicks && (
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">🎯 Clics:</span>
                                  <span className="font-bold text-blue-800">{med.clicks}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">⏰ Frecuencia:</span>
                                <span className="font-bold text-blue-800">{med.frequency}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-blue-600 mt-2">
                              <span><strong>Desde:</strong> {format(new Date(med.start_date), "dd/MM/yyyy")}</span>
                              {med.end_date && (
                                <span><strong>Hasta:</strong> {format(new Date(med.end_date), "dd/MM/yyyy")}</span>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 font-semibold">Activa</Badge>
                        </div>
                        {med.side_effects && (
                          <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-xs">
                            <p><strong>⚠️ Efectos Secundarios:</strong> {med.side_effects}</p>
                            {med.side_effects_treatment && (
                              <p className="mt-1"><strong>🩺 Tratamiento:</strong> {med.side_effects_treatment}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      No hay medicación prescrita actualmente
                    </p>
                  </div>
                )}
              </div>

              {/* Antecedentes y condiciones */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Antecedentes Familiares
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={patient.family_history?.diabetes_type2 ? "destructive" : "outline"}>
                        Diabetes Tipo 2: {patient.family_history?.diabetes_type2 ? "Sí" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={patient.family_history?.pcos ? "destructive" : "outline"}>
                        Ovario Poliquístico: {patient.family_history?.pcos ? "Sí" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={patient.family_history?.hypothyroidism ? "destructive" : "outline"}>
                        Hipotiroidismo: {patient.family_history?.hypothyroidism ? "Sí" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Condiciones
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Enfermedades:</strong> {patient.has_diseases ? "Sí" : "No"}</p>
                    {patient.diseases_description &&
                    <p><strong>Descripción:</strong> {patient.diseases_description}</p>
                    }
                    <p><strong>Hace Ejercicio:</strong> {patient.does_exercise ? "Sí" : "No"}</p>
                    <p><strong>Problemas Ginecológicos:</strong> {patient.gynecological_problems ? "Sí" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Alergias e intolerancias */}
              {(patient.allergies_medications || patient.food_intolerances) &&
              <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alergias e Intolerancias
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {patient.allergies_medications &&
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">Alergias a Fármacos</p>
                        <p className="text-red-700">{patient.allergies_medications}</p>
                      </div>
                  }
                    {patient.food_intolerances &&
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="font-medium text-yellow-800">Intolerancias Alimentarias</p>
                        <p className="text-yellow-700">{patient.food_intolerances}</p>
                      </div>
                  }
                  </div>
                </div>
              }

              {/* Niveles */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-900">Evaluación Psicológica</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{patient.stress_level}/10</p>
                    <p className="text-sm text-gray-600">Nivel de Estrés</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{patient.food_control_level}/10</p>
                    <p className="text-sm text-gray-600">Control de Comida</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{patient.motivation_level}/10</p>
                    <p className="text-sm text-gray-600">Motivación</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weight" className="mt-6">
              <WeightManager
                patient={patient}
                onUpdate={onUpdate}
              />
            </TabsContent>

            <TabsContent value="medication" className="mt-6">
              <MedicationManager
                patient={patient}
                onUpdate={onUpdate}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <PatientNotes
                patient={patient}
                onUpdate={onUpdate}
              />
            </TabsContent>

            <TabsContent value="chart" className="mt-6">
              <WeightEvolutionChart patient={patient} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>);
}
