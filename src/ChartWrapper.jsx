import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ChartWrapper = ({ type, data, options }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destruir el gráfico anterior si existe
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Crear nuevo gráfico
      chartInstance.current = new Chart(chartRef.current, {
        type,
        data,
        options
      });
    }

    // Limpieza al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={chartRef} />;
};

export default ChartWrapper;