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
      criterio: (habito) => (habito?.streak || 0) >= 7,
      color: '#FF6B35'
    },
    {
      id: 'habito-30dias',
      nombre: 'Racha de 30 días',
      descripcion: 'Completa un hábito por 30 días consecutivos',
      icono: '🎖️',
      criterio: (habito) => (habito?.streak || 0) >= 30,
      color: '#FF9E58'
    },
    {
      id: 'completar-5habitos',
      nombre: 'Multitarea',
      descripcion: 'Completa 5 hábitos diferentes en un día',
      icono: '🌟',
      criterio: (progreso) => (progreso?.maxDiario || 0) >= 5,
      color: '#FFD166'
    },
    {
      id: 'primera-vez',
      nombre: 'Primer paso',
      descripcion: 'Completa un hábito por primera vez',
      icono: '👣',
      criterio: (habito) => (habito?.completados || 0) > 0,
      color: '#004E89'
    },
    {
      id: 'consistencia-semanal',
      nombre: 'Consistencia semanal',
      descripcion: 'Completa un hábito todos los días programados por una semana',
      icono: '📅',
      criterio: (habito) => {
        const diasProgramados = habito?.diasSemana?.length || 0;
        return (habito?.completados || 0) >= diasProgramados * 1;
      },
      color: '#4CAF50'
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
      <div className="logros-header">
        <h2 className="section-title">Mis Logros</h2>
        <p className="section-subtitle">Celebra tus éxitos y sigue motivado</p>
      </div>
      
      {error && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Entendido</button>
          </div>
        </div>
      )}

      {cargando ? (
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando tus logros...</p>
        </div>
      ) : (
        <>
          <div className="resumen-logros">
            <div className="tarjeta-resumen">
              <h3>Tu Progreso</h3>
              <div className="progreso-info">
                <div className="progreso-circulo">
                  <span className="numero">{logrosDesbloqueados.length}</span>
                  <span className="total">/{logros.length}</span>
                </div>
                <div className="progreso-texto">
                  <p>Logros desbloqueados</p>
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
            </div>
          </div>

          <div className="lista-logros">
            <h3 className="lista-titulo">Todos los logros disponibles</h3>
            <div className="logros-grid">
              {logros.map(logro => {
                const desbloqueado = logrosDesbloqueados.some(l => l.id === logro.id);
                return (
                  <div 
                    key={logro.id} 
                    className={`tarjeta-logro ${desbloqueado ? 'desbloqueado' : 'bloqueado'}`}
                    style={{ borderColor: logro.color }}
                  >
                    <div 
                      className="icono-logro" 
                      style={{ 
                        backgroundColor: desbloqueado ? logro.color : '#F5F5F5',
                        color: desbloqueado ? 'white' : '#9E9E9E'
                      }}
                    >
                      {logro.icono}
                    </div>
                    <div className="contenido-logro">
                      <h4>{logro.nombre}</h4>
                      <p>{logro.descripcion}</p>
                      <div className="estado-logro">
                        {desbloqueado ? (
                          <span className="desbloqueado-texto">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                            Desbloqueado
                          </span>
                        ) : (
                          <span className="bloqueado-texto">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                            </svg>
                            Por desbloquear
                          </span>
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