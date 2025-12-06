
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Badge is no longer used in the final render but might be used elsewhere or planned for future use, keeping it for safety unless explicitly told to remove. The outline removes its usage from CardContent.
import { ChevronRight, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { Recipe } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MealPlan({ mealType, title, icon: Icon, color, dietType }) {
  const navigate = useNavigate();
  const [recipesCount, setRecipesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipesCount = async () => {
      setLoading(true);
      setError(null);
      try {
        const allRecipesForMeal = await Recipe.filter({ meal_type: mealType });

        const compatibleRecipes = allRecipesForMeal.filter((recipe) =>
        recipe.diet_compatibility && recipe.diet_compatibility.includes(dietType)
        );

        setRecipesCount(compatibleRecipes.length);

      } catch (error) {
        console.error(`Error fetching recipes count for ${mealType}:`, error);
        setError(error.message);
        setRecipesCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (dietType && mealType) {
      fetchRecipesCount();
    }
  }, [mealType, dietType]);

  const handleViewDetails = () => {
    // Navegar a la página de detalles de la comida
    navigate(createPageUrl(`MealDetails?meal=${mealType}&diet=${dietType}&title=${encodeURIComponent(title)}`));
  };
  
  const handleSurpriseMe = () => {
    // Navegar a la nueva página de sugerencias
    navigate(createPageUrl(`RecipeSuggestions?diet=${dietType}`));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={`w-8 h-8 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1">{title}</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ?
        <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
            <span className="ml-2 text-sm text-gray-500">Cargando...</span>
          </div> :
        error ?
        <div className="text-center py-4">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-600">Error al cargar</p>
          </div> :

        <div className="space-y-2">
            <Button
              onClick={handleViewDetails}
              variant="outline"
              className="w-full hover:bg-gray-50 flex justify-between items-center"
            >
              <span>Opciones de Menú</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSurpriseMe}
              variant="secondary"
              className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              ¡Sorpréndeme!
            </Button>

            {recipesCount === 0 &&
              <p className="text-xs text-gray-500 text-center pt-2">
                Contacta con tu profesional
              </p>
            }
          </div>
        }
      </CardContent>
    </Card>);
}
