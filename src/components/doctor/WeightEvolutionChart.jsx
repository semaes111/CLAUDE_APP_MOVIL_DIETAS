import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from "lucide-react";
import { WeightRecord } from "@/api/entities";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function WeightEvolutionChart({ patient }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    loadWeightEvolution();
  }, [patient.id, timeRange]);

  const loadWeightEvolution = async () => {
    setLoading(true);
    try {
      // Obtener TODOS los registros de peso del paciente ordenados por created_date
      const weightRecords = await WeightRecord.filter({ patient_id: patient.id }, '-created_date');
      
      const evolutionPoints = [];

      // 1. Agregar el peso inicial como primer punto (timestamp más antiguo)
      if (patient.initial_weight && patient.created_date) {
        const creationDate = parseISO(patient.created_date);
        evolutionPoints.push({
          date: format(creationDate, 'dd/MM/yy'),
          fullDate: format(creationDate, 'dd/MM/yyyy HH:mm'),
          weight: patient.initial_weight,
          notes: "Peso inicial al crear el expediente",
          timestamp: creationDate.getTime(), // Usar timestamp completo
          isInitial: true,
        });
      }

      // 2. Agregar TODOS los registros usando created_date para timestamp preciso
      weightRecords.forEach(record => {
        // Usar created_date (incluye hora exacta) para timestamp, date para mostrar
        const createdDateTime = parseISO(record.created_date);
        const displayDate = parseISO(record.date);
        
        evolutionPoints.push({
          date: format(displayDate, 'dd/MM/yy'),
          fullDate: format(createdDateTime, 'dd/MM/yyyy HH:mm'),
          weight: record.weight,
          notes: record.notes || "Registro de peso",
          timestamp: createdDateTime.getTime(), // Timestamp preciso con hora
          isInitial: false,
        });
      });

      // 3. Ordenar por timestamp completo (incluyendo hora, minutos, segundos)
      evolutionPoints.sort((a, b) => a.timestamp - b.timestamp);

      // 4. Aplicar filtros de tiempo
      let finalData = evolutionPoints;
      
      if (timeRange !== 'all') {
        const now = new Date();
        const daysBack = timeRange === '1month' ? 30 : timeRange === '3months' ? 90 : 180;
        const cutoffTime = now.getTime() - (daysBack * 24 * 60 * 60 * 1000);
        
        finalData = evolutionPoints.filter(point => point.timestamp >= cutoffTime);
        
        // Incluir peso inicial para contexto si no está en el rango
        const initialPoint = evolutionPoints.find(p => p.isInitial);
        if (initialPoint && !finalData.some(p => p.isInitial) && finalData.length > 0) {
          finalData.unshift(initialPoint);
        }
      }

      setChartData(finalData);

    } catch (error) {
      console.error("Error loading weight evolution:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Tooltip personalizado con hora exacta
  const WeightTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border-2 border-purple-200 rounded-xl shadow-xl">
          <h4 className="font-bold text-purple-800 mb-2">
            {data.isInitial ? "🏥 Peso Inicial" : "📊 Registro de Peso"}
          </h4>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Fecha y hora:</strong> {data.fullDate}
          </p>
          <p className="text-lg font-bold text-purple-600 mb-2">
            <strong>Peso:</strong> {data.weight} kg
          </p>
          {data.notes && (
            <p className="text-xs text-gray-500 border-t pt-2 max-w-xs">
              <strong>Notas:</strong> {data.notes}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calcular estadísticas
  const initialWeight = patient.initial_weight || 0;
  const lastRecordedWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight : initialWeight;
  const weightLoss = (initialWeight - lastRecordedWeight).toFixed(1);
  const remainingToGoal = patient.target_weight ? Math.max(0, lastRecordedWeight - patient.target_weight).toFixed(1) : '0.0';

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            Evolución del Peso
          </CardTitle>
          <div className="flex gap-2">
            {[
              { value: "1month", label: "1M" },
              { value: "3months", label: "3M" },
              { value: "6months", label: "6M" },
              { value: "all", label: "Todo" }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  timeRange === range.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-xl font-bold text-green-600">-{weightLoss} kg</p>
            <p className="text-xs text-gray-600">Pérdida Total</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xl font-bold text-blue-600">{lastRecordedWeight} kg</p>
            <p className="text-xs text-gray-600">Último Registro</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-xl font-bold text-orange-600">{remainingToGoal} kg</p>
            <p className="text-xs text-gray-600">Por Perder</p>
          </div>
        </div>

        {/* Indicadores de orientación */}
        <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Peso Inicial: {initialWeight} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Objetivo: {patient.target_weight} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span>Registros: {chartData.filter(d => !d.isInitial).length}</span>
          </div>
        </div>

        {/* Información de precisión temporal */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-xs text-blue-800">
            <p><strong>ℹ️ Ordenamiento cronológico preciso:</strong></p>
            <p>Los registros se ordenan por fecha y hora exacta de anotación</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : chartData.length < 1 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No hay datos de peso para mostrar</p>
                <p className="text-sm text-gray-400">Agregue registros de peso en la pestaña "Peso"</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<WeightTooltip />} />
                
                {/* Línea de referencia para el peso objetivo */}
                {patient.target_weight && (
                  <ReferenceLine 
                    y={patient.target_weight} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ 
                      value: `Objetivo: ${patient.target_weight} kg`, 
                      position: "insideTopRight", 
                      fill: "#10b981",
                      fontSize: 11,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                
                {/* Línea de evolución del peso */}
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={({ payload, cx, cy }) => {
                    let fillColor = "#8b5cf6"; // Morado para registros normales
                    if (payload.isInitial) fillColor = "#ef4444"; // Rojo para peso inicial
                    
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={fillColor}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: "#7c3aed",
                    stroke: "#ffffff",
                    strokeWidth: 3
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}