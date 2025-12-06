import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Carrot, Fish, Milk, Wheat, Leaf, Droplets, Apple } from 'lucide-react';

const shoppingLists = {
  rescue: {
    title: "Dieta de Rescate",
    categories: [
      { name: "Proteínas Magras", icon: Fish, items: ["Pechuga de pollo/pavo", "Pescado blanco (merluza, lenguado)", "Claras de huevo", "Tofu firme"] },
      { name: "Verduras (sin almidón)", icon: Leaf, items: ["Espinacas, acelgas, lechuga", "Brócoli, coliflor", "Calabacín, pepino", "Pimientos verdes", "Apio"] },
      { name: "Hidratación y otros", icon: Droplets, items: ["Agua mineral", "Infusiones sin azúcar", "Caldo de verduras bajo en sodio", "Vinagre de manzana", "Limones"] }
    ]
  },
  strict: {
    title: "Dieta Estricta",
    categories: [
      { name: "Proteínas", icon: Fish, items: ["Pechuga de pollo/pavo", "Salmón, atún al natural", "Huevos", "Lentejas rojas (con moderación)", "Yogur natural o griego"] },
      { name: "Verduras y Hortalizas", icon: Carrot, items: ["Verduras de hoja verde", "Tomates, cebollas, ajos", "Espárragos, champiñones", "Berenjena, pimientos de colores"] },
      { name: "Grasas Saludables", icon: Apple, items: ["Aguacate (1/2 al día)", "Aceite de Oliva Virgen Extra", "Un puñado de nueces o almendras"] },
      { name: "Hidratación", icon: Droplets, items: ["Agua", "Té verde", "Café solo"] }
    ]
  },
  mediterranean: {
    title: "Dieta Mediterránea",
    categories: [
      { name: "Verduras y Hortalizas", icon: Carrot, items: ["Tomates, pepinos, pimientos", "Cebollas, ajos", "Brócoli, espinacas, judías verdes", "Berenjenas, calabacines"] },
      { name: "Frutas de Temporada", icon: Apple, items: ["Manzanas, peras", "Naranjas, mandarinas", "Fresas, arándanos", "Melón, sandía"] },
      { name: "Proteínas", icon: Fish, items: ["Pescado azul (salmón, sardinas)", "Pescado blanco", "Legumbres (lentejas, garbanzos)", "Huevos", "Pollo y pavo"] },
      { name: "Cereales Integrales", icon: Wheat, items: ["Pan integral de masa madre", "Avena en copos", "Arroz integral, quinoa"] },
      { name: "Lácteos y Grasas", icon: Milk, items: ["Yogur natural", "Queso fresco o feta (con moderación)", "Aceite de Oliva Virgen Extra", "Frutos secos (nueces, almendras)"] }
    ]
  },
  intermittent_fasting: {
    title: "Ayuno Intermitente",
    categories: [
      { name: "Para romper el ayuno", icon: Fish, items: ["Huevos", "Aguacate", "Caldo de huesos", "Pechuga de pollo", "Pescado blanco"] },
      { name: "Verduras y Hortalizas", icon: Carrot, items: ["Espinacas, kale", "Brócoli, coliflor", "Zanahorias, pimientos", "Setas"] },
      { name: "Frutas", icon: Apple, items: ["Frutos rojos", "Manzanas", "Peras"] },
      { name: "Cereales y Legumbres", icon: Wheat, items: ["Quinoa", "Lentejas", "Garbanzos", "Batata (boniato)"] },
      { name: "Hidratación (muy importante)", icon: Droplets, items: ["Mucha agua", "Té e infusiones sin azúcar", "Café solo", "Sal marina (para electrolitos)"] }
    ]
  },
  maintenance: {
    title: "Mantenimiento",
    categories: [
      { name: "Verduras y Hortalizas", icon: Carrot, items: ["Gran variedad de todos los colores", "Ensaladas listas para consumir"] },
      { name: "Frutas Variadas", icon: Apple, items: ["Plátanos", "Uvas", "Frutas de temporada"] },
      { name: "Proteínas de Calidad", icon: Fish, items: ["Pollo, pavo", "Pescado azul y blanco", "Huevos", "Legumbres variadas", "Tofu, tempeh"] },
      { name: "Cereales Integrales", icon: Wheat, items: ["Avena", "Arroz integral", "Pasta integral", "Pan de centeno o espelta"] },
      { name: "Lácteos y Grasas Saludables", icon: Milk, items: ["Yogur, kéfir", "Quesos curados (con moderación)", "Aceite de Oliva", "Aguacate", "Semillas de chía y lino"] }
    ]
  }
};

export default function WeeklyShoppingList({ dietType }) {
  const listData = shoppingLists[dietType];

  if (!listData) {
    return (
      <Card className="bg-orange-50 border-orange-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-orange-800">
            <ShoppingCart className="w-8 h-8" />
            Lista de la Compra no disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            No tienes una dieta activa asignada. Contacta con tu médico para generar tu lista de la compra.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          Lista de la Compra Semanal
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sugerencia de compra genérica para tu: <span className="font-semibold text-green-700">{listData.title}</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listData.categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-green-600" />
                  {category.name}
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Recuerda:</strong> Esta es una lista genérica. Ajústala según las recetas específicas que elijas y los alimentos que ya tengas en casa. ¡Prioriza siempre los productos frescos y de temporada!
        </div>
      </CardContent>
    </Card>
  );
}