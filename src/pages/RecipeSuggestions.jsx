import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ChefHat, Sparkles } from "lucide-react";
import { Recipe } from "@/api/entities";

const mealTypes = [
    { key: "breakfast", name: "Desayuno", color: "border-yellow-400" },
    { key: "mid_morning", name: "Media Mañana", color: "border-green-400" },
    { key: "lunch", name: "Comida", color: "border-blue-400" },
    { key: "snack", name: "Merienda", color: "border-pink-400" },
    { key: "dinner", name: "Cena", color: "border-purple-400" },
];

export default function RecipeSuggestionsPage() {
    const navigate = useNavigate();
    const [recipesByMeal, setRecipesByMeal] = useState({});
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);
    
    const urlParams = new URLSearchParams(window.location.search);
    const dietType = urlParams.get('diet');

    const loadRecipes = useCallback(async () => {
        if (!dietType) return;
        setLoading(true);
        try {
            const allRecipes = await Recipe.list('-created_date', 200);
            
            const compatibleRecipes = allRecipes.filter((recipe) =>
                recipe.diet_compatibility && recipe.diet_compatibility.includes(dietType)
            );
            
            const groupedRecipes = {};
            mealTypes.forEach(meal => groupedRecipes[meal.key] = []);

            compatibleRecipes.forEach(recipe => {
                if (groupedRecipes[recipe.meal_type] && groupedRecipes[recipe.meal_type].length < 10) {
                    groupedRecipes[recipe.meal_type].push(recipe);
                }
            });

            setRecipesByMeal(groupedRecipes);
        } catch (error) {
            console.error("Error loading recipes:", error);
        } finally {
            setLoading(false);
        }
    }, [dietType]);

    useEffect(() => {
        const storedData = sessionStorage.getItem("patient_data");
        if (storedData) {
            setPatientData(JSON.parse(storedData));
        } else {
            navigate(createPageUrl("Home"));
            return;
        }
        loadRecipes();
    }, [navigate, loadRecipes]);

    if (!patientData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }
    
    const getDietTypeName = (diet) => {
        const names = {
          rescue: "Dieta de Rescate",
          strict: "Dieta Estricta",
          mediterranean: "Dieta Mediterránea",
          intermittent_fasting: "Ayuno Intermitente", 
          maintenance: "Mantenimiento"
        };
        return names[diet] || "Dieta Personalizada";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Button 
                        variant="outline"
                        onClick={() => navigate(createPageUrl("PatientDashboard"))}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-purple-500" />
                            Sugerencias de Recetas
                        </h1>
                        <p className="text-gray-600">
                            Ideas para tu {getDietTypeName(dietType)}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Buscando recetas deliciosas...</p>
                    </div>
                ) : (
                    <Tabs defaultValue="breakfast" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                            {mealTypes.map(meal => (
                                <TabsTrigger key={meal.key} value={meal.key}>{meal.name}</TabsTrigger>
                            ))}
                        </TabsList>
                        
                        {mealTypes.map(meal => (
                            <TabsContent key={meal.key} value={meal.key} className="mt-6">
                                <div className="space-y-4">
                                    {(recipesByMeal[meal.key] && recipesByMeal[meal.key].length > 0) ? (
                                        recipesByMeal[meal.key].map(recipe => (
                                            <Card key={recipe.id} className={`bg-white/80 backdrop-blur-md shadow-lg border-0 border-l-4 ${meal.color}`}>
                                                <CardHeader>
                                                    <CardTitle className="text-xl font-bold text-gray-800">{recipe.name}</CardTitle>
                                                    <p className="text-sm text-gray-600">{recipe.description}</p>
                                                </CardHeader>
                                                <CardContent className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-gray-700">Ingredientes:</h4>
                                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                            {recipe.ingredients.map((ing, i) => (
                                                                <li key={i}>{ing.name} {ing.quantity && `(${ing.quantity})`}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-gray-700">Preparación:</h4>
                                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{recipe.preparation}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-white/50 rounded-lg">
                                            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">No se encontraron sugerencias de {meal.name.toLowerCase()} para esta dieta.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    );
}