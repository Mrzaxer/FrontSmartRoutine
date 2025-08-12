import React, { useEffect, useState } from "react";
import axios from "axios";
import './Logros.css';

const Logros = () => {
  const [logros, setLogros] = useState([]);
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');

  // Tipos de logros predefinidos con manejo seguro de propiedades
  const tiposLogros = [
    {
      id: 'habito-7dias',
      nombre: 'Racha de 7 días',
      descripcion: 'Completa un hábito por 7 días consecutivos',
      icono: '🏆',
      criterio: (habito) => (habito?.streak || 0) >= 7
    },
    {
      id: 'habito-30dias',
      nombre: 'Racha de 30 días',
      descripcion: 'Completa un hábito por 30 días consecutivos',
      icono: '🎖️',
      criterio: (habito) => (habito?.streak || 0) >= 30
    },
    {
      id: 'completar-5habitos',
      nombre: 'Multitarea',
      descripcion: 'Completa 5 hábitos diferentes en un día',
      icono: '🌟',
      criterio: (progreso) => (progreso?.maxDiario || 0) >= 5
    },
    {
      id: 'primera-vez',
      nombre: 'Primer paso',
      descripcion: 'Completa un hábito por primera vez',
      icono: '👣',
      criterio: (habito) => (habito?.completados || 0) > 0
    },
    {
      id: 'consistencia-semanal',
      nombre: 'Consistencia semanal',
      descripcion: 'Completa un hábito todos los días programados por una semana',
      icono: '📅',
      criterio: (habito) => {
        const diasProgramados = habito?.diasSemana?.length || 0;
        return (habito?.completados || 0) >= diasProgramados * 1;
      }
    }
  ];

  // Obtener logros del usuario con manejo de errores mejorado
  const obtenerLogrosUsuario = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const [resHabitos, resProgreso] = await Promise.all([
        axios.get(`http://localhost:3000/api/habitos/usuario/${userId}`),
        axios.get(`http://localhost:3000/api/progreso/usuario/${userId}/resumen`)
      ]);

      // Verificar que las respuestas tengan datos
      const habitos = resHabitos.data || [];
      const progreso = resProgreso.data || {};

      // Verificar qué logros ha desbloqueado el usuario
      const desbloqueados = tiposLogros.filter(logro => {
        try {
          if (logro.id.includes('habito')) {
            return habitos.some(habito => logro.criterio(habito));
          } else {
            return logro.criterio(progreso);
          }
        } catch (error) {
          console.error(`Error evaluando logro ${logro.id}:`, error);
          return false;
        }
      });

      setLogros(tiposLogros);
      setLogrosDesbloqueados(desbloqueados);
    } catch (error) {
      console.error("Error al obtener logros:", error);
      setError("No se pudieron cargar los logros. Intenta nuevamente más tarde.");
      setLogros(tiposLogros); // Mostrar logros aunque falle la carga
      setLogrosDesbloqueados([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerLogrosUsuario();
  }, []);

  return (
    <div className="logros-container">
      <h2>🏆 Mis Logros</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {cargando ? (
        <div className="cargando">Cargando logros...</div>
      ) : (
        <>
          <div className="resumen-logros">
            <div className="tarjeta-resumen">
              <h3>Progreso general</h3>
              <p>
                <span className="numero">{logrosDesbloqueados.length}</span> de{' '}
                <span className="total">{logros.length}</span> logros desbloqueados
              </p>
              <div className="barra-progreso">
                <div 
                  className="progreso" 
                  style={{ 
                    width: `${logros.length > 0 
                      ? (logrosDesbloqueados.length / logros.length) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="lista-logros">
            <h3>Todos los logros</h3>
            <div className="logros-grid">
              {logros.map(logro => {
                const desbloqueado = logrosDesbloqueados.some(l => l.id === logro.id);
                return (
                  <div 
                    key={logro.id} 
                    className={`tarjeta-logro ${desbloqueado ? 'desbloqueado' : 'bloqueado'}`}
                  >
                    <div className="icono-logro">{logro.icono}</div>
                    <div className="contenido-logro">
                      <h4>{logro.nombre}</h4>
                      <p>{logro.descripcion}</p>
                      <div className="estado-logro">
                        {desbloqueado ? (
                          <span className="desbloqueado-texto">✅ Desbloqueado</span>
                        ) : (
                          <span className="bloqueado-texto">🔒 Por desbloquear</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Logros;