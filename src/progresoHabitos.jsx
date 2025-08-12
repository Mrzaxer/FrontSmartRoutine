import React, { useEffect, useState } from "react";
import axios from "axios";
import ChartWrapper from './ChartWrapper';
import './ProgresoHabitos.css';

const ProgresoHabitos = () => {
  const [habitos, setHabitos] = useState([]);
  const [habitoSeleccionado, setHabitoSeleccionado] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const userId = localStorage.getItem('userId');

  // Obtener lista de hábitos
  const obtenerHabitos = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/habitos/usuario/${userId}`);
      setHabitos(res.data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener hábitos:", error.response?.data || error.message);
      setError(error.response?.data?.message || "No se pudieron cargar los hábitos.");
    }
  };

  // Obtener estadísticas de un hábito
  const cargarEstadisticas = async (habitoId) => {
    if (!habitoId) {
      setHabitoSeleccionado(null);
      setEstadisticas(null);
      return;
    }

    try {
      setCargando(true);
      const res = await axios.get(`http://localhost:3000/api/progreso/habito/${habitoId}`, {
        params: { usuarioId: userId }
      });
      
      if (!res.data) {
        throw new Error("No se recibieron datos del servidor");
      }

      setEstadisticas(res.data);
      setHabitoSeleccionado(habitoId);
      setError(null);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error.response?.data || error.message);
      setError(error.response?.data?.message || "No se pudieron cargar las estadísticas.");
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  };

  // Obtener resumen general
  const cargarResumenGeneral = async () => {
    try {
      setCargando(true);
      const res = await axios.get(`http://localhost:3000/api/progreso/usuario/${userId}`, {
        params: { limite: 30 }
      });
      
      if (!res.data?.grafico) {
        throw new Error("Formato de datos incorrecto");
      }

      setDatosGrafico(res.data.grafico);
    } catch (error) {
      console.error("Error al cargar resumen:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Error al cargar el resumen general");
      setDatosGrafico(null);
    } finally {
      setCargando(false);
    }
  };

  // Registrar progreso manual
  const registrarProgreso = async (completado) => {
    if (!habitoSeleccionado) {
      setError("Debes seleccionar un hábito primero");
      return;
    }

    try {
      const fechaActual = new Date().toISOString();
      const res = await axios.post('http://localhost:3000/api/progreso/registrar', {
        habitoId: habitoSeleccionado,
        usuarioId: userId,
        completado,
        porcentaje: completado ? 100 : 0,
        fecha: fechaActual
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 201) {
        await Promise.all([
          cargarEstadisticas(habitoSeleccionado),
          cargarResumenGeneral()
        ]);
        setError(null);
      }
    } catch (error) {
      console.error("Error al registrar progreso:", error.response?.data || error.message);
      setError(error.response?.data?.message || "No se pudo registrar el progreso");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        obtenerHabitos(),
        cargarResumenGeneral()
      ]);
    };
    cargarDatos();
  }, []);

  // Datos para el gráfico general
  const graficoCompletados = {
    labels: datosGrafico?.map(item => item.fecha) || [],
    datasets: [
      {
        label: 'Hábitos completados por día',
        data: datosGrafico?.map(item => item.completados) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Datos para el gráfico de hábito específico
  const graficoHabito = {
    labels: estadisticas?.progreso?.map(p => new Date(p.fecha).toLocaleDateString()).reverse() || [],
    datasets: [
      {
        label: 'Estado',
        data: estadisticas?.progreso?.map(p => p.completado ? 1 : 0).reverse() || [],
        backgroundColor: estadisticas?.progreso?.map(p => p.completado ? '#4CAF50' : '#F44336').reverse() || [],
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="progreso-container">
      <h2>📊 Progreso de Hábitos</h2>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="resumen-general">
        <h3>Tu Progreso General</h3>
        {datosGrafico ? (
          <div className="grafico-container">
            <ChartWrapper 
              type="line"
              data={graficoCompletados}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <p>{cargando ? 'Cargando...' : 'No hay datos disponibles'}</p>
        )}
      </div>

      <div className="seleccion-habito">
        <h3>Ver progreso por hábito</h3>
        <select
          value={habitoSeleccionado || ''}
          onChange={(e) => cargarEstadisticas(e.target.value)}
          disabled={cargando || habitos.length === 0}
        >
          <option value="">Selecciona un hábito</option>
          {habitos.map(h => (
            <option key={h._id} value={h._id}>{h.titulo}</option>
          ))}
        </select>
      </div>

      {habitoSeleccionado && (
        <div className="detalle-habito">
          {estadisticas ? (
            <>
              <h3>Progreso de {estadisticas.habito?.titulo || 'Hábito desconocido'}</h3>
              
              <div className="estadisticas-grid">
                <div className="estadistica-card">
                  <h4>Racha actual</h4>
                  <p>{estadisticas.estadisticas?.streak || 0} días</p>
                </div>
                <div className="estadistica-card">
                  <h4>Mejor racha</h4>
                  <p>{estadisticas.estadisticas?.mejorStreak || 0} días</p>
                </div>
                <div className="estadistica-card">
                  <h4>Completados</h4>
                  <p>{estadisticas.estadisticas?.completados || 0} de {estadisticas.estadisticas?.totalDias || 0} días</p>
                </div>
                <div className="estadistica-card">
                  <h4>Porcentaje</h4>
                  <p>{estadisticas.estadisticas?.porcentaje || 0}%</p>
                </div>
              </div>

              <div className="grafico-habito-container">
                <ChartWrapper
                  type="bar"
                  data={graficoHabito}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                          stepSize: 1,
                          callback: value => value === 1 ? 'Completado' : 'Fallado'
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="acciones-progreso">
                <h4>Registrar progreso para hoy</h4>
                <div className="botones-progreso">
                  <button 
                    onClick={() => registrarProgreso(true)}
                    className="completar-btn"
                    disabled={cargando}
                  >
                    ✅ Completado
                  </button>
                  <button 
                    onClick={() => registrarProgreso(false)}
                    className="fallar-btn"
                    disabled={cargando}
                  >
                    ❌ Fallado
                  </button>
                </div>
              </div>

              <div className="historial-progreso">
                <h4>Historial reciente</h4>
                {estadisticas.progreso?.length > 0 ? (
                  <ul>
                    {estadisticas.progreso.map((p, index) => (
                      <li key={index} className={p.completado ? 'completado' : 'fallado'}>
                        <span>{new Date(p.fecha).toLocaleDateString()}</span>
                        <span>{p.completado ? '✅ Completado' : '❌ Fallado'}</span>
                        {p.notas && <span className="nota">Nota: {p.notas}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay registros de progreso</p>
                )}
              </div>
            </>
          ) : (
            <p>{cargando ? 'Cargando...' : 'No se pudieron cargar las estadísticas'}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgresoHabitos;