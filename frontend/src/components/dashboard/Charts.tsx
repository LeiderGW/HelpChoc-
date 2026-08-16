import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

interface ChartsProps {
  type: 'bar' | 'pie' | 'line' | 'area';
  data: ChartData;
  title?: string;
  height?: number;
  className?: string;
}

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6', '#EC4899', '#14B8A6', '#6B7280'];

const Charts: React.FC<ChartsProps> = ({
  type,
  data,
  title,
  height = 300,
  className = '',
}) => {
  const chartData = data.labels.map((label, index) => {
    const item: any = { name: label };
    data.datasets.forEach((dataset) => {
      item[dataset.label] = dataset.data[index];
    });
    return item;
  });

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Bar
                key={index}
                dataKey={dataset.label}
                fill={dataset.color || COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              // `chartData` son objetos {name, [label]: valor}, así que la
              // clave del dato es el nombre de la serie. Antes se pasaba el
              // array de valores, que no es una clave: recharts no encontraba
              // el campo y la torta salía vacía.
              dataKey={data.datasets[0]?.label ?? 'value'}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={dataset.label}
                stroke={dataset.color || COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={dataset.label}
                fill={dataset.color || COLORS[index % COLORS.length]}
                stroke={dataset.color || COLORS[index % COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      default:
        return null;
    }
  };

  const grafico = renderChart();

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {title && <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>}
      {/* `renderChart` devuelve null si el tipo no se reconoce, y
          ResponsiveContainer exige un elemento: con null lanzaba en runtime. */}
      <div style={{ height }}>
        {grafico && (
          <ResponsiveContainer width="100%" height="100%">
            {grafico}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Charts;