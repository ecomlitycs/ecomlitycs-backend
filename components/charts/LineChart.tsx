import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKeys: { key: string; name: string; color: string }[];
  xAxisKey: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, dataKeys, xAxisKey, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border dark:stroke-dark-border" />
        <XAxis 
          dataKey={xAxisKey} 
          className="text-xs fill-muted-foreground dark:fill-dark-muted-foreground"
        />
        <YAxis 
          className="text-xs fill-muted-foreground dark:fill-dark-muted-foreground"
          tickFormatter={(value) => {
            if (value >= 1000) {
              return `R$ ${(value / 1000).toFixed(0)}k`;
            }
            return `R$ ${value}`;
          }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          formatter={(value: any) => {
            if (typeof value === 'number') {
              return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            return value;
          }}
        />
        <Legend />
        {dataKeys.map((dk) => (
          <Line 
            key={dk.key} 
            type="monotone" 
            dataKey={dk.key} 
            stroke={dk.color} 
            name={dk.name}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
