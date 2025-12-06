import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, RefreshCw, AlertCircle, ChefHat, Flame, TrendingUp } from "lucide-react";
import { Recipe } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OptionalRecipes({ dietType }) {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptionalRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener todas las recetas compatibles con la dieta actual
        const allRecipes = await Recipe.list('-created_date', 20); // Limitar a 20 recetas

        const compatibleRecipes = allRecipes.filter((recipe) =>
          recipe.diet_compatibility && recipe.diet_compatibility.includes(dietType)
        );

        // Filtrar recetas que no sean solo desayunos (para mostrar variedad)
        const diverseRecipes = compatibleRecipes.filter(recipe => 
          recipe.meal_type !== 'breakfast' || recipe.name === "Desayuno Completo Personalizable"
        );

        setRecipes(diverseRecipes.slice(0, 6)); // Mostrar máximo 6 recetas

      } catch (error) {
        console.error(`Error fetching optional recipes:`, error);
        setError(error.message);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    if (dietType) {
      fetchOptionalRecipes();
    }
  }, [dietType]);

  const handleViewAllRecipes = () => {
    navigate(createPageUrl(`MealDetails?meal=all&diet=${dietType}&title=${encodeURIComponent('Recetas Sanas')}`));
  };

  const getMealTypeIcon = (mealType) => {
    const icons = {
      breakfast: "🥐",
      mid_morning: "🍎", 
      lunch: "🍽️",
      snack: "🥨",
      dinner: "🌙"
    };
    return icons[mealType] || "🍴";
  };

  const getMealTypeName = (mealType) => {
    const names = {
      breakfast: "Desayuno",
      mid_morning: "Media Mañana", 
      lunch: "Comida",
      snack: "Merienda",
      dinner: "Cena"
    };
    return names[mealType] || "Plato";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1">Recetas Sanas Opcionales</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
            <span className="ml-2 text-sm text-gray-500">Cargando recetas...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-600">Error al cargar recetas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recipes.length > 0 ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recipes.slice(0, 3).map((recipe) => (
                    <div key={recipe.id} className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getMealTypeIcon(recipe.meal_type)}</span>
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{recipe.name}</h4>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{recipe.description}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {getMealTypeName(recipe.meal_type)}
                            </Badge>
                            {recipe.calories_per_serving && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Flame className="w-2 h-2" />
                                {recipe.calories_per_serving} kcal
                              </Badge>
                            )}
                            {recipe.glycemic_index && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <TrendingUp className="w-2 h-2" />
                                IG: {recipe.glycemic_index}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleViewAllRecipes}
                  variant="outline"
                  className="w-full bg-background hover:bg-gray-50 text-sm font-medium"
                >
                  Recetas Sanas
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No hay recetas disponibles para esta dieta</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}