import { Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EnergyDistributionChart = ({ activeMethodsData }) => {
  if (!activeMethodsData.length) return null;

  const chartData = activeMethodsData
    .sort((a, b) => b.energyScore - a.energyScore)
    .slice(0, 8);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-emerald-600" />
        Energy Consumption by Method
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="methodName" 
            tick={{ fill: '#6b7280', fontSize: 11 }} 
            angle={-45} 
            textAnchor="end" 
            height={100} 
          />
          <YAxis tick={{ fill: '#6b7280' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px' 
            }} 
          />
          <Bar dataKey="energyScore" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyDistributionChart;