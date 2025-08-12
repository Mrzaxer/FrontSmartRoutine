import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import './graficaSensor.css';

const GraficaSensor = () => {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');

        console.log('📦 LocalStorage -> userId:', storedUserId);
        console.log('📦 LocalStorage -> token:', token);

        if (!storedUserId || !token) {
          console.warn('⚠ Falta userId o token en localStorage.');
          return;
        }

        const url = `http://localhost:3000/api/sensores/${storedUserId}`;
        console.log('🌐 Fetch URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const rawText = await response.text();
        console.log('📥 Respuesta cruda del servidor:', rawText);

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} - ${response.statusText}`);
        }

        const data = JSON.parse(rawText);

        if (Array.isArray(data) && data.length > 0) {
          const transformedData = data.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleString(),
            valor: Number(item.valor)
          }));
          setSensorData(transformedData);
        } else {
          console.log('ℹ No se encontraron datos.');
          setSensorData([]); // limpiar si no hay datos
        }
      } catch (error) {
        console.error('❌ Error al obtener datos del sensor:', error);
        setSensorData([]); // limpiar en error
      }
    };

    fetchSensorData();
  }, []);

  // Separar por tipo de sensor
  const dataPorTipo = {
    cardiaco: sensorData.filter(d => d.tipo_sensor === 'cardiaco'),
    luz: sensorData.filter(d => d.tipo_sensor === 'luz'),
  };

  return (
    <div className="grafica-container">
      <h2>Gráficas de Sensores</h2>

      {Object.entries(dataPorTipo).map(([tipo, datos]) => (
        datos.length > 0 ? (
          <div key={tipo} className="grafica-subcontainer">
            <h3>Sensor: {tipo}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#8884d8" name={`${tipo} (valor)`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p key={tipo}>No hay datos para el sensor {tipo}</p>
        )
      ))}
    </div>
  );
};

export default GraficaSensor;
