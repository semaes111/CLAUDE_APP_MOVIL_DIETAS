import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Ban, X } from "lucide-react";

const forbiddenFoods = {
  rescue: {
    title: "Dieta de Rescate - ALIMENTOS ESTRICTAMENTE PROHIBIDOS",
    warning: "En esta fase crítica, es fundamental evitar completamente estos alimentos:",
    prohibited: [
      "Alcohol en cualquiera de sus formas",
      "Arroz (incluido integral)",
      "Patatas en cualquier preparación",
      "Pasta (normal e integral)",
      "Pan blanco y harinas refinadas",
      "Bebidas azucaradas y refrescos",
      "Zumos de frutas (naturales o artificiales)",
      "Dulces, bollería y pasteles",
      "Fritos y comida rápida"
    ],
    note: "IMPORTANTE: El arroz integral, pasta integral y patatas solo están permitidos en dietas de mantenimiento o dietas específicamente autorizadas por tu médico."
  },
  strict: {
    title: "Dieta Estricta - ALIMENTOS A EVITAR",
    warning: "Para mantener el control glucémico, evita estos alimentos:",
    prohibited: [
      "Alcohol",
      "Pan blanco y harinas refinadas",
      "Arroz blanco",
      "Patatas fritas o en puré",
      "Bebidas azucaradas",
      "Zumos de frutas",
      "Dulces y bollería",
      "Pasta refinada",
      "Cereales azucarados"
    ],
    note: "Permitidos con moderación: arroz integral, pasta integral, patata cocida pequeña ocasionalmente."
  },
  mediterranean: {
    title: "Dieta Mediterránea - ALIMENTOS A LIMITAR",
    warning: "Aunque es más flexible, limita estos alimentos:",
    prohibited: [
      "Bebidas azucaradas",
      "Bollería industrial",
      "Comida rápida y fritos",
      "Carnes muy procesadas",
      "Dulces y golosinas",
      "Alcohol en exceso (máximo 1 copa de vino tinto ocasionalmente)"
    ],
    note: "Esta dieta permite mayor variedad, pero siempre con moderación y priorizando alimentos frescos."
  },
  intermittent_fasting: {
    title: "Ayuno Intermitente - ALIMENTOS A EVITAR",
    warning: "Durante las ventanas de alimentación, evita:",
    prohibited: [
      "Bebidas azucaradas",
      "Zumos de frutas",
      "Dulces y bollería",
      "Comida rápida",
      "Alcohol",
      "Cereales refinados",
      "Snacks procesados"
    ],
    note: "CRUCIAL: Durante el ayuno, solo agua, té e infusiones sin azúcar. Rompe el ayuno con alimentos nutritivos y de bajo índice glucémico."
  },
  maintenance: {
    title: "Mantenimiento - ALIMENTOS A CONTROLAR",
    warning: "Mantén el control limitando estos alimentos:",
    prohibited: [
      "Bebidas azucaradas",
      "Bollería industrial",
      "Comida rápida frecuente",
      "Alcohol en exceso",
      "Dulces en exceso"
    ],
    note: "En mantenimiento tienes más flexibilidad, pero la moderación sigue siendo clave para mantener tus logros."
  }
};

export default function ForbiddenFoods({ dietType }) {
  const foodData = forbiddenFoods[dietType];

  if (!foodData) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-red-600 to-red-700 border-0 shadow-2xl text-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{foodData.title}</h3>
            <p className="text-red-100 text-sm font-normal">{foodData.warning}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {foodData.prohibited.map((food, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20"
            >
              <Ban className="w-5 h-5 text-red-200 shrink-0" />
              <span className="text-white text-sm font-medium">{food}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-white/15 border border-white/25 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-200 mb-2">NOTA IMPORTANTE:</h4>
              <p className="text-white text-sm leading-relaxed">{foodData.note}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-red-800/50 border border-red-400/50 rounded-lg">
          <p className="text-red-100 text-xs text-center">
            <strong>Recuerda:</strong> Cualquier duda sobre tu alimentación, consulta siempre con tu médico. 
            Tu salud es lo más importante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}