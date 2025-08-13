import React, { useEffect, useState } from "react";
import axios from "axios";
import './Habitos.css';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const Habitos = () => {
  const [habitos, setHabitos] = useState([]);
  const [error, setError] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [habitoEditando, setHabitoEditando] = useState(null);

  const [formHabito, setFormHabito] = useState({
    titulo: '',
    descripcion: '',
    horaObjetivo: '',
    duracionMinutos: 0,
    comentarios: '',
    diasSemana: [],
  });

  const userId = localStorage.getItem('userId');

  const obtenerHabitos = async () => {
    if (!userId) {
      setError('No hay userId en localStorage');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/habitos/usuario/${userId}`);
      setHabitos(res.data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener hábitos", error);
      setError("No se pudieron cargar los hábitos.");
    }
  };

  const agregarHabito = async () => {
    if (!formHabito.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    try {
      await axios.post(`http://localhost:3000/api/habitos/nuevo`, {
        ...formHabito,
        usuarioId: userId,
        estado: 'pendiente',
      });
      setFormHabito({
        titulo: '',
        descripcion: '',
        horaObjetivo: '',
        duracionMinutos: 0,
        comentarios: '',
        diasSemana: [],
      });
      obtenerHabitos();
      setError(null);
    } catch (error) {
      console.error("Error al agregar hábito", error);
      setError("No se pudo agregar el hábito.");
    }
  };

  const editarHabito = (habito) => {
    setModoEdicion(true);
    setHabitoEditando(habito._id);
    setFormHabito({
      titulo: habito.titulo,
      descripcion: habito.descripcion,
      horaObjetivo: habito.horaObjetivo,
      duracionMinutos: habito.duracionMinutos,
      comentarios: habito.comentarios,
      diasSemana: habito.diasSemana || [],
    });
  };

  const actualizarHabito = async () => {
    if (!formHabito.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    try {
      await axios.put(`http://localhost:3000/api/habitos/${habitoEditando}`, formHabito);
      setModoEdicion(false);
      setHabitoEditando(null);
      setFormHabito({
        titulo: '',
        descripcion: '',
        horaObjetivo: '',
        duracionMinutos: 0,
        comentarios: '',
        diasSemana: [],
      });
      obtenerHabitos();
      setError(null);
    } catch (error) {
      console.error("Error al actualizar hábito", error);
      setError("No se pudo actualizar el hábito.");
    }
  };

  const borrarHabito = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/habitos/${id}`);
      obtenerHabitos();
    } catch (error) {
      console.error("Error al borrar hábito", error);
      setError("No se pudo borrar el hábito.");
    }
  };

  const puedeCompletar = (habito) => {
    const ahora = new Date();
    const diaActual = DIAS_SEMANA[ahora.getDay() - 1] || 'Domingo';
    
    const dias = Array.isArray(habito.diasSemana) ? habito.diasSemana : [];
    if (!dias.includes(diaActual)) return false;
    
    if (habito.estado === 'completado') return false;
    
    if (!habito.horaObjetivo || !habito.duracionMinutos) return true;
    
    const [h, m] = habito.horaObjetivo.split(':').map(Number);
    const inicio = new Date(ahora);
    inicio.setHours(h, m, 0, 0);
    
    const fin = new Date(inicio);
    fin.setMinutes(fin.getMinutes() + habito.duracionMinutos);
    
    return ahora >= fin;
  };

  const completarHabito = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/habitos/${id}/completar`);
      obtenerHabitos();
      setError(null);
    } catch (error) {
      console.error("Error al completar hábito", error);
      setError("No se pudo completar el hábito.");
    }
  };

  const [temporizadores, setTemporizadores] = useState({});

  const calcularSegundosRestantes = (habito) => {
    if (!habito.horaObjetivo || !habito.duracionMinutos) return null;
    
    const ahora = new Date();
    const [h, m] = habito.horaObjetivo.split(':').map(Number);
    const inicio = new Date(ahora);
    inicio.setHours(h, m, 0, 0);
    
    const fin = new Date(inicio);
    fin.setMinutes(fin.getMinutes() + habito.duracionMinutos);
    
    if (ahora < inicio || ahora > fin) return null;
    
    return Math.floor((fin - ahora) / 1000);
  };

  useEffect(() => {
    obtenerHabitos();
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const nuevosTemporizadores = {};

      habitos.forEach(hab => {
        const segRest = calcularSegundosRestantes(hab);
        if (segRest !== null) {
          const min = Math.floor(segRest / 60);
          const seg = segRest % 60;
          nuevosTemporizadores[hab._id] = { minutos: min, segundos: seg };
        }
      });

      setTemporizadores(nuevosTemporizadores);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [habitos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'diasSemana') {
      let dias = [...formHabito.diasSemana];
      if (checked) {
        dias.push(value);
      } else {
        dias = dias.filter(d => d !== value);
      }
      setFormHabito({ ...formHabito, diasSemana: dias });
    } else if (type === 'number') {
      setFormHabito({ ...formHabito, [name]: Number(value) });
    } else {
      setFormHabito({ ...formHabito, [name]: value });
    }
  };

  return (
    <div className="habitos-container">
      <h2 className="section-title">Mis Hábitos</h2>

      <div className="form-habito">
        <div className="form-group">
          <label>Título del hábito</label>
          <input
            name="titulo"
            value={formHabito.titulo}
            onChange={handleChange}
            placeholder="Ej: Meditación matutina"
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <input
            name="descripcion"
            value={formHabito.descripcion}
            onChange={handleChange}
            placeholder="Ej: Meditar 10 minutos al despertar"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Hora objetivo</label>
            <input
              type="time"
              name="horaObjetivo"
              value={formHabito.horaObjetivo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Duración (minutos)</label>
            <input
              type="number"
              name="duracionMinutos"
              value={formHabito.duracionMinutos}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Comentarios</label>
          <textarea
            name="comentarios"
            value={formHabito.comentarios}
            onChange={handleChange}
            placeholder="Notas adicionales sobre este hábito"
          />
        </div>

        <div className="form-group">
          <label>Días de la semana</label>
          <div className="dias-semana">
            {DIAS_SEMANA.map(dia => (
              <label key={dia} className="dia-checkbox">
                <input
                  type="checkbox"
                  name="diasSemana"
                  value={dia}
                  checked={formHabito.diasSemana.includes(dia)}
                  onChange={handleChange}
                />
                <span>{dia.substring(0, 3)}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          {modoEdicion ? (
            <>
              <button className="btn-primary" onClick={actualizarHabito}>
                Actualizar Hábito
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setModoEdicion(false);
                  setHabitoEditando(null);
                  setFormHabito({
                    titulo: '',
                    descripcion: '',
                    horaObjetivo: '',
                    duracionMinutos: 0,
                    comentarios: '',
                    diasSemana: [],
                  });
                  setError(null);
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={agregarHabito}>
              Agregar Nuevo Hábito
            </button>
          )}
        </div>
      </div>

      <div className="lista-habitos">
        {habitos.length === 0 ? (
          <div className="empty-state">
            <p>No tienes hábitos registrados aún</p>
            <p>¡Comienza agregando tu primer hábito!</p>
          </div>
        ) : (
          habitos.map(h => {
            const temp = temporizadores[h._id];
            const estaActivo = !!temp;
            const puedeComp = puedeCompletar(h);
            
            return (
              <div key={h._id} className={`habito-card ${h.estado === 'completado' ? 'completed' : ''}`}>
                <div className="habito-header">
                  <h3>{h.titulo}</h3>
                  <span className={`habito-status ${h.estado}`}>
                    {h.estado === 'completado' ? '✅ Completado' : '⏳ Pendiente'}
                  </span>
                </div>
                
                {h.descripcion && <p className="habito-desc">{h.descripcion}</p>}
                
                <div className="habito-details">
                  <div className="detail">
                    <span className="detail-label">Hora:</span>
                    <span>{h.horaObjetivo || 'No especificada'}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Duración:</span>
                    <span>{h.duracionMinutos} minutos</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Días:</span>
                    <span>{(h.diasSemana || []).join(', ') || 'No especificados'}</span>
                  </div>
                  
                  {h.comentarios && (
                    <div className="detail">
                      <span className="detail-label">Notas:</span>
                      <span>{h.comentarios}</span>
                    </div>
                  )}
                  
                  {estaActivo && (
                    <div className="temporizador">
                      <span className="detail-label">Tiempo restante:</span>
                      <span>
                        {temp.minutos.toString().padStart(2, '0')}:
                        {temp.segundos.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="habito-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => editarHabito(h)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    className="btn-delete"
                    onClick={() => borrarHabito(h._id)}
                  >
                    Eliminar
                  </button>
                  
                  {puedeComp && (
                    <button 
                      className="btn-complete"
                      onClick={() => completarHabito(h._id)}
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Habitos;