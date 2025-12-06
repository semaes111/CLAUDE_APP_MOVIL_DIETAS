import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from "lucide-react";
import { WeightRecord } from "@/api/entities";
import { format } from "date-fns";

export default function WeightChart({ patientId, patientData }) {
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeightData();
  }, [patientId]);

  const loadWeightData = async () => {
    try {
      const records = await WeightRecord.filter({ patient_id: patientId }, '-date');
      
      // Agregar peso inicial si no existe
      const chartData = [
        {
          date: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd/MM'),
          weight: patientData.initial_weight,
          fullDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')
        },
        ...records.map(record => ({
          date: format(new Date(record.date), 'dd/MM'),
          weight: record.weight,
          fullDate: format(new Date(record.date), 'dd/MM/yyyy')
        }))
      ];

      setWeightData(chartData);
    } catch (error) {
      console.error("Error loading weight data:", error);
      // Datos de ejemplo si hay error
      setWeightData([
        { date: '01/01', weight: patientData.initial_weight, fullDate: '01/01/2024' },
        { date: '15/01', weight: patientData.current_weight, fullDate: '15/01/2024' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{`Fecha: ${payload[0].payload.fullDate}`}</p>
          <p className="text-lg font-bold text-blue-600">
            {`Peso: ${payload[0].value} kg`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-blue-600" />
          </div>
          Evolución del Peso
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Línea del objetivo */}
                <ReferenceLine 
                  y={patientData.target_weight} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  label={{ value: "Objetivo", position: "topRight", fill: "#10b981" }}
                />
                
                {/* Línea del peso inicial */}
                <ReferenceLine 
                  y={patientData.initial_weight} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Inicial", position: "topRight", fill: "#ef4444" }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Peso Inicial: {patientData.initial_weight} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Objetivo: {patientData.target_weight} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}