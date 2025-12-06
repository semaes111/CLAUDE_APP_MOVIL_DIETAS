
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Utensils, Clock, Users, Flame, TrendingUp, ChefHat } from "lucide-react";
import { Recipe } from "@/api/entities";

import RecipeCard from "../components/patient/RecipeCard";

export default function MealDetailsPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  
  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const mealType = urlParams.get('meal');
  const dietType = urlParams.get('diet');
  const mealTitle = urlParams.get('title') ? decodeURIComponent(urlParams.get('title')) : 'Opciones de Menú';

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      let allRecipes = [];
      
      if (mealType === 'all') {
        // Cargar todas las recetas compatibles con la dieta
        allRecipes = await Recipe.list('-created_date', 50);
      } else {
        // Cargar recetas específicas para el tipo de comida
        allRecipes = await Recipe.filter({ meal_type: mealType }, '-created_date', 30);
      }

      // Filtrar por compatibilidad con la dieta
      const compatibleRecipes = allRecipes.filter((recipe) =>
        recipe.diet_compatibility && recipe.diet_compatibility.includes(dietType)
      );

      setRecipes(compatibleRecipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [mealType, dietType]);

  useEffect(() => {
    // Verificar que el paciente esté autenticado
    const storedData = sessionStorage.getItem("patient_data");
    if (storedData) {
      setPatientData(JSON.parse(storedData));
    } else {
      navigate(createPageUrl("Home"));
      return;
    }

    loadRecipes();
  }, [navigate, loadRecipes]);

  const getMealTypeIcon = (mealType) => {
    const icons = {
      breakfast: "🥐",
      mid_morning: "🍎",
      lunch: "🍽️", 
      snack: "🥨",
      dinner: "🌙",
      all: "🍴"
    };
    return icons[mealType] || "🍴";
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

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("PatientDashboard"))}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
              {mealTitle}
            </h1>
            <p className="text-gray-600">
              Opciones para tu {getDietTypeName(dietType)} • {recipes.length} recetas disponibles
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Recetas Personalizadas</h3>
                <p className="text-emerald-100">
                  Todas las opciones están adaptadas a tu {getDietTypeName(dietType).toLowerCase()} 
                  y respetan los índices glucémicos recomendados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-md shadow-xl border-0">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay recetas disponibles
              </h3>
              <p className="text-gray-500 mb-6">
                Aún no se han agregado recetas para esta combinación de comida y dieta.
                Contacta con tu médico para que añada opciones personalizadas.
              </p>
              <Button 
                onClick={() => navigate(createPageUrl("PatientDashboard"))}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Volver al Panel Principal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
