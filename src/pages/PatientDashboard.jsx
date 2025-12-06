
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  Target, 
  Calendar, 
  Coffee, 
  Utensils, 
  Apple,
  AlertCircle,
  Info,
  Scale 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DietPlan } from "@/api/entities";

import WeightChart from "../components/patient/WeightChart";
import MealPlan from "../components/patient/MealPlan";
import MedicationTracker from "../components/patient/MedicationTracker";
import DietInfo from "../components/patient/DietInfo";
import OptionalRecipes from "../components/patient/OptionalRecipes";
import WeeklyShoppingList from "../components/patient/WeeklyShoppingList";
import ForbiddenFoods from "../components/patient/ForbiddenFoods"; // New import

const getDietTypeColor = (dietType) => {
  const colors = {
    rescue: "from-red-500 to-orange-500",
    strict: "from-orange-500 to-yellow-500", 
    mediterranean: "from-green-500 to-emerald-500",
    intermittent_fasting: "from-blue-500 to-indigo-500",
    maintenance: "from-purple-500 to-pink-500"
  };
  return colors[dietType] || colors.mediterranean;
};

const getDietTypeName = (dietType) => {
  const names = {
    rescue: "Dieta de Rescate",
    strict: "Dieta Estricta",
    mediterranean: "Dieta Mediterránea", 
    intermittent_fasting: "Ayuno Intermitente",
    maintenance: "Mantenimiento"
  };
  return names[dietType] || "Dieta Personalizada";
};

// New helper function to get current day of week in lowercase string format
const getCurrentDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

const getBmiCategory = (bmi) => {
  if (!bmi) return { category: "Sin datos", color: "bg-gray-200 text-gray-800" };
  if (bmi < 18.5) return { category: "Bajo peso", color: "bg-blue-100 text-blue-800" };
  if (bmi < 25) return { category: "Normopeso", color: "bg-green-100 text-green-800" };
  if (bmi < 30) return { category: "Sobrepeso", color: "bg-yellow-100 text-yellow-800" };
  if (bmi < 35) return { category: "Obesidad grado I", color: "bg-orange-100 text-orange-800" };
  if (bmi < 40) return { category: "Obesidad grado II", color: "bg-red-100 text-red-800" };
  return { category: "Obesidad grado III", color: "bg-red-200 text-red-900 font-bold" };
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [currentDiet, setCurrentDiet] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(28);
  const [loading, setLoading] = useState(true);
  const [dietLoading, setDietLoading] = useState(true);

  // Function to load current diet with retry mechanism
  const loadCurrentDiet = useCallback(async (patientId, retryCount = 0) => {
    setDietLoading(true);
    try {
      const currentDay = getCurrentDayOfWeek();
      
      // Intentar obtener solo el plan más relevante para el día actual
      let dietPlans = await DietPlan.filter({
        patient_id: patientId,
        is_active: true,
        day_of_week: currentDay
      }, '-created_date', 1); // Limitar a 1 resultado

      if (dietPlans.length > 0) {
        setCurrentDiet(dietPlans[0].diet_type);
      } else {
        // Si no hay plan específico para hoy, buscar el plan general activo más reciente
        try {
          const generalPlans = await DietPlan.filter({
            patient_id: patientId,
            is_active: true
          }, '-created_date', 1); // Limitar a 1 resultado

          if (generalPlans.length > 0) {
            setCurrentDiet(generalPlans[0].diet_type);
          } else {
            setCurrentDiet(null);
          }
        } catch (error) {
          console.error("Error loading general diet plans:", error);
          setCurrentDiet(null);
        }
      }
    } catch (error) {
      console.error("Error loading current diet:", error);
      
      // Si es un error de rate limit (429) y no hemos reintentado muchas veces
      // Se asume que el error objeto contiene un mensaje o un código de estado que indica 429
      if (error.message && error.message.includes('429') && retryCount < 2) {
        console.log(`Retrying diet load in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          loadCurrentDiet(patientId, retryCount + 1);
        }, (retryCount + 1) * 2000); // Esperar 2, 4 segundos progresivamente
        return; // Detener la ejecución actual para permitir el reintento
      }
      
      setCurrentDiet(null); // Set to null on persistent error
    } finally {
      setDietLoading(false);
    }
  }, []); // Empty dependency array is correct here as setters are stable and other dependencies are constants or external.

  useEffect(() => {
    const storedData = sessionStorage.getItem("patient_data");
    if (storedData) {
      const data = JSON.parse(storedData);
      setPatientData(data);
      
      // Calcular días restantes
      if (data.code_expiry) {
        const expiry = new Date(data.code_expiry);
        const now = new Date();
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, diffDays));
      }
      
      // Cargar la dieta actual prescrita con manejo de errores
      loadCurrentDiet(data.id);
      setLoading(false);
    } else {
      // Si no hay datos, redirigir a la página de inicio
      navigate(createPageUrl("Home"));
    }
  }, [navigate, loadCurrentDiet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!patientData) {
    return null; // No mostrar nada mientras redirige
  }

  const weightProgress = ((patientData.initial_weight - patientData.current_weight) / (patientData.initial_weight - patientData.target_weight)) * 100;
  // Calculate BMI. Ensure height is not zero to prevent division errors.
  const bmi = patientData.height && patientData.height > 0 
              ? (patientData.current_weight / (patientData.height * patientData.height)).toFixed(1) 
              : null;
  const bmiInfo = getBmiCategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            ¡Hola, {patientData.full_name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Countdown Alert */}
        {daysRemaining <= 7 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">¡Atención!</p>
                <p>Su código expira en {daysRemaining} días. Consulte con su médico.</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Diet - Conditional Rendering */}
        {dietLoading ? (
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
                <CardContent className="p-6">
                    <div className="animate-pulse flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ) : currentDiet ? (
            <Card className={`bg-gradient-to-r ${getDietTypeColor(currentDiet)} text-white shadow-2xl border-0`}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Utensils className="w-8 h-8" />
                  Dieta de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{getDietTypeName(currentDiet)}</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {format(new Date(), "EEEE", { locale: es })}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
        ) : (
            <Card className="bg-orange-50 border-orange-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-orange-800">
                  <AlertCircle className="w-8 h-8" />
                  No hay dieta asignada para hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">
                  Aún no tienes un plan de dieta para hoy. Contacta con tu médico para que te asigne uno.
                </p>
                <p className="text-sm text-orange-600 mt-2">
                  El Asistente IA no podrá darte recomendaciones de comidas hasta que tengas una dieta activa.
                </p>
              </CardContent>
            </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peso Actual</p>
                  <p className="text-2xl font-bold">{patientData.current_weight} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Objetivo</p>
                  <p className="text-2xl font-bold">{patientData.target_weight} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Días Restantes</p>
                  <p className="text-2xl font-bold">{daysRemaining}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-lg">%</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progreso</p>
                  <p className="text-2xl font-bold">{Math.round(weightProgress)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {bmi && (
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IMC</p>
                    <p className="text-2xl font-bold">{bmi}</p>
                  </div>
                </div>
                 <Badge className={`mt-2 w-full justify-center ${bmiInfo.color}`}>{bmiInfo.category}</Badge>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content - Conditional Rendering */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WeightChart patientId={patientData.id} patientData={patientData} />
          {currentDiet && <DietInfo dietType={currentDiet} />}
        </div>

        {/* Meal Plans - Conditional Rendering */}
        {currentDiet && (
            <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-4">
              <MealPlan 
                mealType="breakfast" 
                title="Desayuno" 
                icon={Coffee}
                color="from-yellow-400 to-orange-400"
                dietType={currentDiet}
              />
              <MealPlan 
                mealType="mid_morning" 
                title="Media Mañana" 
                icon={Apple}
                color="from-green-400 to-emerald-400"
                dietType={currentDiet}
              />
              <MealPlan 
                mealType="lunch" 
                title="Comida" 
                icon={Utensils}
                color="from-blue-400 to-indigo-400"
                dietType={currentDiet}
              />
              <MealPlan 
                mealType="snack" 
                title="Merienda" 
                icon={Apple}
                color="from-pink-400 to-rose-400"
                dietType={currentDiet}
              />
              <MealPlan 
                mealType="dinner" 
                title="Cena" 
                icon={Utensils}
                color="from-purple-400 to-violet-400"
                dietType={currentDiet}
              />
              {/* Nuevo apartado de Recetas Sanas Opcionales */}
              <OptionalRecipes dietType={currentDiet} />
            </div>
        )}

        {/* Weekly Shopping List */}
        {currentDiet && <WeeklyShoppingList dietType={currentDiet} />}

        {/* Medication Tracker */}
        <MedicationTracker patientId={patientData.id} />

        {/* Forbidden Foods - Critical Warning */}
        {currentDiet && <ForbiddenFoods dietType={currentDiet} />}
      </div>
    </div>
  );
}
