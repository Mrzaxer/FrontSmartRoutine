import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import './graficaSensor.css';

const GraficaSensor = () => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');

        if (!storedUserId || !token) {
          throw new Error('Se requieren credenciales para acceder a los datos');
        }

        const url = `http://localhost:3000/api/sensores/${storedUserId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const transformedData = data.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            valor: Number(item.valor)
          }));
          setSensorData(transformedData);
        } else {
          setSensorData([]);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
    
    // Opcional: Configurar polling para actualización automática
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Separar y procesar datos por tipo de sensor
  const dataPorTipo = {
    cardiaco: {
      data: sensorData.filter(d => d.tipo_sensor === 'cardiaco'),
      color: '#FF6B6B',
      name: 'Ritmo Cardíaco',
      unit: 'bpm',
      range: [60, 100] // Rango normal
    },
    luz: {
      data: sensorData.filter(d => d.tipo_sensor === 'luz'),
      color: '#4ECDC4',
      name: 'Nivel de Luz',
      unit: 'lux'
    },
    temperatura: {
      data: sensorData.filter(d => d.tipo_sensor === 'temperatura'),
      color: '#FFA07A',
      name: 'Temperatura',
      unit: '°C'
    }
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = (datos) => {
    if (!datos || datos.length === 0) return null;
    
    const valores = datos.map(d => d.valor);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const avg = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);
    
    return { min, max, avg };
  };

  if (loading) {
    return (
      <div className="grafica-container loading">
        <div className="spinner"></div>
        <p>Cargando datos de sensores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grafica-container error">
        <div className="error-content">
          <h3>Error al cargar los datos</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grafica-container">
      <div className="grafica-header">
        <h2 className="grafica-title">Monitoreo de Sensores</h2>
        <p className="grafica-subtitle">Datos en tiempo real de los sensores conectados</p>
      </div>

      <div className="graficas-grid">
        {Object.entries(dataPorTipo).map(([tipo, config]) => {
          const stats = calcularEstadisticas(config.data);
          
          return (
            <div key={tipo} className="grafica-card">
              <div className="sensor-header">
                <h3 className="sensor-title">
                  {config.name}
                  <span className={`sensor-status ${config.data.length > 0 ? 'active' : 'inactive'}`}>
                    {config.data.length > 0 ? 'Activo' : 'Inactivo'}
                  </span>
                </h3>
              </div>

              {config.data.length > 0 ? (
                <>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={config.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="timestamp" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis 
                          unit={config.unit}
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        {config.range && (
                          <ReferenceLine 
                            y={config.range[0]} 
                            stroke="#888" 
                            strokeDasharray="3 3" 
                            label={`Mín ${config.range[0]}`}
                          />
                        )}
                        {config.range && (
                          <ReferenceLine 
                            y={config.range[1]} 
                            stroke="#888" 
                            strokeDasharray="3 3" 
                            label={`Máx ${config.range[1]}`}
                          />
                        )}
                        <Tooltip 
                          formatter={(value) => [`${value} ${config.unit}`, config.name]}
                          labelFormatter={(label) => `Hora: ${label}`}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="valor" 
                          stroke={config.color} 
                          fill={`${config.color}20`} 
                          strokeWidth={2}
                          name={`${config.name} (${config.unit})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {stats && (
                    <div className="sensor-stats">
                      <div className="stat-item">
                        <span className="stat-label">Mínimo:</span>
                        <span className="stat-value">{stats.min} {config.unit}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Promedio:</span>
                        <span className="stat-value">{stats.avg} {config.unit}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Máximo:</span>
                        <span className="stat-value">{stats.max} {config.unit}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-data">
                  <p>No hay datos disponibles</p>
                  <small>El sensor parece estar desconectado o no ha enviado datos</small>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraficaSensor;