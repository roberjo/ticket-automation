import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SimpleChartProps {
  data: any[];
  type: 'line' | 'area' | 'bar' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
}

const COLORS = ['hsl(214, 84%, 56%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type,
  dataKey,
  xAxisKey = 'date',
  color = 'hsl(214, 84%, 56%)',
  height = 300
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="hsl(215, 10%, 55%)"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(215, 10%, 55%)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(240, 6%, 90%)',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px hsl(240, 5%, 84% / 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="hsl(215, 10%, 55%)"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(215, 10%, 55%)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(240, 6%, 90%)',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px hsl(240, 5%, 84% / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="hsl(215, 10%, 55%)"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(215, 10%, 55%)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(240, 6%, 90%)',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px hsl(240, 5%, 84% / 0.1)'
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};