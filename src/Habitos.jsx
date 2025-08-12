import React, { useEffect, useState } from "react";
import axios from "axios";
import './Habitos.css';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

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
    const diaActual = DIAS_SEMANA[ahora.getDay() - 1] || 'domingo'; // Ajuste para domingo
    
    // Verificar si hoy es uno de los días programados
    const dias = Array.isArray(habito.diasSemana) ? habito.diasSemana : [];
    if (!dias.includes(diaActual)) return false;
    
    // Verificar si ya está completado
    if (habito.estado === 'completado') return false;
    
    // Verificar si tiene hora y duración
    if (!habito.horaObjetivo || !habito.duracionMinutos) return true;
    
    // Calcular si ya pasó el tiempo
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

  // Temporizador para mostrar tiempo restante durante la ejecución
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
      <h2>Mis Hábitos</h2>

      <div className="form-habito">
        <input
          name="titulo"
          value={formHabito.titulo}
          onChange={handleChange}
          placeholder="Título"
          required
        />
        <input
          name="descripcion"
          value={formHabito.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
        />
        <input
          type="time"
          name="horaObjetivo"
          value={formHabito.horaObjetivo}
          onChange={handleChange}
          placeholder="Hora objetivo"
        />
        <input
          type="number"
          name="duracionMinutos"
          value={formHabito.duracionMinutos}
          onChange={handleChange}
          placeholder="Duración (minutos)"
          min="0"
        />
        <textarea
          name="comentarios"
          value={formHabito.comentarios}
          onChange={handleChange}
          placeholder="Comentarios"
        />

        <div className="dias-semana">
          <label>Días para repetir:</label>
          {DIAS_SEMANA.map(dia => (
            <label key={dia}>
              <input
                type="checkbox"
                name="diasSemana"
                value={dia}
                checked={formHabito.diasSemana.includes(dia)}
                onChange={handleChange}
              />
              {dia}
            </label>
          ))}
        </div>

        {modoEdicion ? (
          <>
            <button onClick={actualizarHabito}>Actualizar</button>
            <button onClick={() => {
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
            }}>Cancelar</button>
          </>
        ) : (
          <button onClick={agregarHabito}>Agregar Hábito</button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <ul className="lista-habitos">
        {habitos.map(h => {
          const temp = temporizadores[h._id];
          const estaActivo = !!temp;
          const puedeComp = puedeCompletar(h);
          return (
            <li key={h._id} className="habito-item">
              <div>
                <strong>{h.titulo}</strong> <br />
                <small>{h.descripcion}</small> <br />
                Hora: {h.horaObjetivo} - Duración: {h.duracionMinutos} min <br />
                Días: {(h.diasSemana || []).join(', ')} <br />
                Comentarios: {h.comentarios} <br />
                Estado: <span className={h.estado === 'completado' ? 'completado' : ''}>{h.estado}</span>
                {estaActivo && (
                  <p className="temporizador">
                    Tiempo restante: {temp.minutos.toString().padStart(2, '0')}:
                    {temp.segundos.toString().padStart(2, '0')}
                  </p>
                )}
              </div>
              <div className="acciones">
                <button onClick={() => editarHabito(h)}>Editar</button>
                <button onClick={() => borrarHabito(h._id)}>Borrar</button>
                {puedeComp && (
                  <button 
                    onClick={() => completarHabito(h._id)}
                    className="completar-btn"
                  >
                    Completar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Habitos;