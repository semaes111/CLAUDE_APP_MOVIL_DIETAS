import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Heart, Zap, Shield } from "lucide-react";

const dietDescriptions = {
  rescue: {
    title: "Dieta de Rescate",
    description: "Esta dieta está diseñada para momentos críticos donde necesitas un impulso rápido y efectivo. Es la más restrictiva pero también la más potente para conseguir resultados inmediatos. Se basa en alimentos de muy bajo índice glucémico, proteínas magras y verduras de hoja verde. Es importante seguir todas las indicaciones médicas y mantenerse bien hidratado. Esta fase es temporal y te ayudará a retomar el control de tu peso de manera segura y efectiva bajo supervisión médica.",
    icon: Shield,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50"
  },
  strict: {
    title: "Dieta Estricta",
    description: "Una dieta controlada que mantiene un enfoque disciplinado pero sostenible. Incluye proteínas de alta calidad, verduras variadas y carbohidratos complejos en porciones medidas. Esta fase te ayuda a establecer hábitos alimentarios sólidos mientras continúas perdiendo peso de manera constante. Es importante respetar los horarios de comida y las porciones indicadas. Te permitirá desarrollar una relación más consciente con la comida mientras alcanzas tus objetivos de peso.",
    icon: Zap,
    color: "from-orange-500 to-yellow-500",
    bgColor: "bg-orange-50"
  },
  mediterranean: {
    title: "Dieta Mediterránea",
    description: "Basada en los patrones alimentarios tradicionales del Mediterráneo, esta dieta es rica en aceite de oliva, pescado, verduras frescas, legumbres y frutos secos. Es reconocida mundialmente por sus beneficios para la salud cardiovascular y la longevidad. Incluye alimentos antiinflamatorios y antioxidantes naturales que nutren tu cuerpo mientras mantienes un peso saludable. Es una dieta equilibrada que puedes disfrutar socialmente, con sabores ricos y variados que hacen que comer sano sea un placer.",
    icon: Heart,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50"
  },
  intermittent_fasting: {
    title: "Ayuno Intermitente",
    description: "Una estrategia alimentaria que alterna períodos de alimentación con períodos de ayuno controlado. No se trata solo de qué comes, sino de cuándo comes. Este enfoque puede ayudar a mejorar la sensibilidad a la insulina, promover la quema de grasa y simplificar tu rutina alimentaria. Durante las ventanas de alimentación, consumes comidas nutritivas y balanceadas. Es importante mantenerse hidratado durante los períodos de ayuno y seguir las indicaciones específicas de horarios que te ha prescrito tu médico.",
    icon: Zap,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50"
  },
  maintenance: {
    title: "Mantenimiento",
    description: "¡Felicitaciones! Has alcanzado tu objetivo y ahora se trata de mantener los logros conseguidos. Esta fase se centra en establecer un equilibrio sostenible a largo plazo. Incluye una mayor variedad de alimentos y flexibilidad en las porciones, siempre manteniendo los principios de alimentación saludable que has aprendido. Es crucial continuar con el seguimiento médico para asegurar que mantengas tu peso ideal y tu salud óptima. Esta es tu nueva forma de vida, diseñada para ser disfrutada y mantenida para siempre.",
    icon: Heart,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50"
  }
};

export default function DietInfo({ dietType }) {
  const diet = dietDescriptions[dietType] || dietDescriptions.mediterranean;
  const Icon = diet.icon;

  return (
    <Card className={`${diet.bgColor} border-0 shadow-xl`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className={`w-10 h-10 bg-gradient-to-r ${diet.color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          Tu Dieta Explicada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">{diet.title}</h3>
        <p className="text-gray-700 leading-relaxed text-justify">{diet.description}</p>
        
        <div className={`mt-6 p-4 bg-gradient-to-r ${diet.color} bg-opacity-10 rounded-xl border border-opacity-20`}>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <Info className="w-4 h-4" />
            Recuerda: Sigue siempre las indicaciones específicas de tu médico
          </div>
        </div>
      </CardContent>
    </Card>
  );
}