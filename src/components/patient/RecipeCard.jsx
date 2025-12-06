import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, TrendingUp } from "lucide-react";

const getRecipeImage = (recipeName, mealType) => {
  // Mapeo de imágenes específicas basadas en el nombre y tipo de comida
  const imageMap = {
    // Desayunos
    "avena": "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop",
    "tostada": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop",
    "yogur": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
    "huevo": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop",
    "smoothie": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
    "tortilla": "https://images.unsplash.com/photo-1568240293635-8d1fb2796c30?w=400&h=300&fit=crop",
    "pan": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    "café": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
    "té": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    
    // Media mañana/Meriendas
    "fruta": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
    "manzana": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop",
    "nueces": "https://images.unsplash.com/photo-1573047712835-4e42d0fa3974?w=400&h=300&fit=crop",
    "almendra": "https://images.unsplash.com/photo-1508747397763-a4a56b13c7c9?w=400&h=300&fit=crop",
    "batido": "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400&h=300&fit=crop",
    "naranja": "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop",
    "pera": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop",
    "kiwi": "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&h=300&fit=crop",
    
    // Comidas
    "salmón": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    "pollo": "https://images.unsplash.com/photo-1532636721194-d4866e69bf20?w=400&h=300&fit=crop",
    "ensalada": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    "verdura": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    "brócoli": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=300&fit=crop",
    "quinoa": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop",
    "arroz": "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400&h=300&fit=crop",
    "pasta": "https://images.unsplash.com/photo-1551892374-ecf8886006a9?w=400&h=300&fit=crop",
    "atún": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    "ternera": "https://images.unsplash.com/photo-1588347818629-48ec04870c73?w=400&h=300&fit=crop",
    "lentejas": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
    "garbanzos": "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop",
    
    // Cenas
    "sopa": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    "pescado": "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop",
    "caldo": "https://images.unsplash.com/photo-1598515214146-d3b6c3d2c6e5?w=400&h=300&fit=crop",
    "crema": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop",
    "merluza": "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop",
    "bacalao": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop",
    "dorada": "https://images.unsplash.com/photo-1559847844-5315695f54c8?w=400&h=300&fit=crop",
    "lubina": "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop"
  };

  // Buscar imagen por palabra clave en el nombre
  const recipeLower = recipeName.toLowerCase();
  for (const [keyword, image] of Object.entries(imageMap)) {
    if (recipeLower.includes(keyword)) {
      return image;
    }
  }

  // Imágenes por defecto según tipo de comida
  const defaultByMealType = {
    breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
    mid_morning: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", 
    lunch: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    snack: "https://images.unsplash.com/photo-1559058789-672da06263d8?w=400&h=300&fit=crop",
    dinner: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop"
  };

  return defaultByMealType[mealType] || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop";
};

const getGlycemicBadgeColor = (gi) => {
  if (gi <= 35) return "bg-green-100 text-green-800";
  if (gi <= 50) return "bg-yellow-100 text-yellow-800"; 
  return "bg-red-100 text-red-800";
};

const getGlycemicLabel = (gi) => {
  if (gi <= 35) return "IG Bajo";
  if (gi <= 50) return "IG Medio";
  return "IG Alto";
};

export default function RecipeCard({ recipe }) {
  const recipeImage = recipe.image_url || getRecipeImage(recipe.name, recipe.meal_type);

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
      <div className="relative">
        <img
          src={recipeImage}
          alt={recipe.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge className={`${getGlycemicBadgeColor(recipe.glycemic_index)} font-semibold`}>
            {getGlycemicLabel(recipe.glycemic_index)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
          {recipe.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {recipe.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          {recipe.calories_per_serving && (
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{recipe.calories_per_serving} cal</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>IG {recipe.glycemic_index}</span>
          </div>
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Ingredientes:</h4>
            <div className="flex flex-wrap gap-1">
              {recipe.ingredients.map((ingredient, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {ingredient.name}
                  {ingredient.quantity && ` (${ingredient.quantity})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recipe.preparation && (
          <div className="bg-gray-50 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Preparación:</h4>
            <p className="text-xs text-gray-700 line-clamp-4">
              {recipe.preparation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}