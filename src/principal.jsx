import { useState, useEffect } from 'react';
import './Principal.css';

const Principal = ({ userId }) => {
  // Lista inicial de hábitos predefinidos
  const habitosPredefinidos = [
    { id: 1, nombre: "Beber agua", categoria: "Salud", seleccionado: false },
    { id: 2, nombre: "Meditar 10 min", categoria: "Bienestar", seleccionado: false },
    { id: 3, nombre: "Ejercicio matutino", categoria: "Fitness", seleccionado: false },
    { id: 4, nombre: "Leer 30 min", categoria: "Aprendizaje", seleccionado: false },
    { id: 5, nombre: "Dormir 8 horas", categoria: "Salud", seleccionado: false },
    { id: 6, nombre: "Planificar el día", categoria: "Productividad", seleccionado: false }
  ];

  // Estados del componente
  const [habitos, setHabitos] = useState(habitosPredefinidos);
  const [habitosSeleccionados, setHabitosSeleccionados] = useState([]);
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar hábitos desde el backend
  const cargarHabitosUsuario = async () => {
    if (!userId) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      
      const response = await fetch(`/api/habitos?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar hábitos');
      }
      
      const data = await response.json();
      
      // Actualizar la lista de hábitos marcando los seleccionados
      const habitosActualizados = habitosPredefinidos.map(habito => ({
        ...habito,
        seleccionado: data.some(h => h.id === habito.id)
      }));
      
      // Agregar hábitos personalizados que no están en los predefinidos
      const habitosPersonalizados = data.filter(h => 
        !habitosPredefinidos.some(pre => pre.id === h.id)
      ).map(h => ({ ...h, seleccionado: true }));
      
      setHabitos([...habitosActualizados, ...habitosPersonalizados]);
      setHabitosSeleccionados([...habitosActualizados.filter(h => h.seleccionado), ...habitosPersonalizados]);
    } catch (err) {
      console.error("Error cargando hábitos:", err);
      setError("No se pudieron cargar los hábitos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  // Función para guardar hábitos en el backend
  const guardarHabitosUsuario = async (habitosAGuardar) => {
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    try {
      const response = await fetch('/api/habitos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          habitos: habitosAGuardar.map(({ id, nombre, categoria }) => ({ id, nombre, categoria }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar hábitos');
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error guardando hábitos:", err);
      setError("No se pudieron guardar los hábitos. Intenta nuevamente.");
      throw err;
    }
  };

  // Cargar hábitos al montar el componente o cambiar userId
  useEffect(() => {
    cargarHabitosUsuario();
  }, [userId]);

  // Función para alternar selección de hábito
  const toggleHabito = async (id) => {
    try {
      const nuevosHabitos = habitos.map(habito => 
        habito.id === id ? { ...habito, seleccionado: !habito.seleccionado } : habito
      );
      
      setHabitos(nuevosHabitos);
      const nuevosSeleccionados = nuevosHabitos.filter(h => h.seleccionado);
      setHabitosSeleccionados(nuevosSeleccionados);
      
      // Guardar en el backend
      await guardarHabitosUsuario(nuevosSeleccionados);
    } catch (err) {
      console.error("Error al alternar hábito:", err);
    }
  };

  // Función para agregar nuevo hábito personalizado
  const agregarHabitoPersonalizado = async () => {
    if (nuevoHabito.trim() === '') {
      setError("Por favor ingresa un nombre para el hábito");
      return;
    }
    
    try {
      const nuevo = {
        id: Date.now(), // Usamos timestamp como ID temporal
        nombre: nuevoHabito.trim(),
        categoria: "Personalizado",
        seleccionado: true
      };
      
      const nuevosHabitos = [...habitos, nuevo];
      const nuevosSeleccionados = [...habitosSeleccionados, nuevo];
      
      setHabitos(nuevosHabitos);
      setHabitosSeleccionados(nuevosSeleccionados);
      setNuevoHabito('');
      setError(null);
      
      // Guardar en el backend
      await guardarHabitosUsuario(nuevosSeleccionados);
    } catch (err) {
      console.error("Error agregando hábito:", err);
      setError("Error al agregar hábito. Intenta nuevamente.");
    }
  };

  // Función para eliminar hábito personalizado
  const eliminarHabitoPersonalizado = async (id) => {
    try {
      const nuevosHabitos = habitos.filter(h => h.id !== id);
      const nuevosSeleccionados = habitosSeleccionados.filter(h => h.id !== id);
      
      setHabitos(nuevosHabitos);
      setHabitosSeleccionados(nuevosSeleccionados);
      
      // Guardar en el backend
      await guardarHabitosUsuario(nuevosSeleccionados);
    } catch (err) {
      console.error("Error eliminando hábito:", err);
      setError("Error al eliminar hábito. Intenta nuevamente.");
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <p>Cargando tus hábitos...</p>
      </div>
    );
  }

  return (
    <div className="habit-management-container">
      <h1 className="habit-management-title">Gestión de Hábitos Diarios</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="habit-panels-wrapper">
        {/* Panel izquierdo - Hábitos disponibles */}
        <div className="habits-panel">
          <h2>Hábitos disponibles</h2>
          
          <div className="add-habit-form">
            <input
              type="text"
              value={nuevoHabito}
              onChange={(e) => {
                setNuevoHabito(e.target.value);
                setError(null);
              }}
              placeholder="Crear nuevo hábito..."
              className="habit-input"
              onKeyPress={(e) => e.key === 'Enter' && agregarHabitoPersonalizado()}
            />
            <button 
              className="add-habit-button"
              onClick={agregarHabitoPersonalizado}
              disabled={!userId}
            >
              Agregar
            </button>
          </div>

          <div className="habits-categories">
            {[...new Set(habitos.map(h => h.categoria))].map(categoria => (
              <div key={categoria} className="habit-category">
                <h3>{categoria}</h3>
                <div className="habits-list">
                  {habitos
                    .filter(h => h.categoria === categoria)
                    .map(habito => (
                      <div 
                        key={habito.id} 
                        className={`habit-item ${habito.seleccionado ? 'selected' : ''}`}
                        onClick={() => toggleHabito(habito.id)}
                      >
                        <span className="habit-checkbox">
                          {habito.seleccionado ? '✓' : ''}
                        </span>
                        <span className="habit-name">{habito.nombre}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho - Hábitos seleccionados */}
        <div className="selected-habits-panel">
          <h2>Mis hábitos</h2>
          
          {habitosSeleccionados.length > 0 ? (
            <ul className="selected-habits-list">
              {habitosSeleccionados.map(habito => (
                <li key={habito.id} className="selected-habit-item">
                  <span className="habit-name">{habito.nombre}</span>
                  {habito.categoria === "Personalizado" && (
                    <button 
                      className="delete-habit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarHabitoPersonalizado(habito.id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-habits-message">No has seleccionado hábitos aún</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Principal;