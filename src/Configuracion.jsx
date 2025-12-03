import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Configuracion.css';


const Configuracion = () => {
  const userId = localStorage.getItem('userId');
  const [usuario, setUsuario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    avatar: ''
  });
  const [configuracion, setConfiguracion] = useState({
    tema: 'claro',
    notificaciones: true,
    recordatorios: true
  });
  const [seguridad, setSeguridad] = useState({
    passwordActual: '',
    nuevoPassword: '',
    confirmarPassword: ''
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');

  // Obtener datos del usuario
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/usuarios/${userId}`);
        const { nombre, email, telefono, fecha_nacimiento, genero, avatar, configuracion: config } = res.data;
        
        setUsuario({
          nombre,
          email,
          telefono: telefono || '',
          fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento).toISOString().split('T')[0] : '',
          genero: genero || '',
          avatar: avatar || '/avatar-default.png'
        });
        
        if (config) {
          setConfiguracion(config);
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
        setError("No se pudieron cargar los datos de configuración");
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, [userId]);

  // Manejar cambios en los inputs
  const handleUsuarioChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleConfiguracionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSeguridadChange = (e) => {
    const { name, value } = e.target;
    setSeguridad(prev => ({ ...prev, [name]: value }));
  };

  // Subir imagen de avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await axios.put(
        `http://localhost:3000/api/usuarios/${userId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setUsuario(prev => ({ ...prev, avatar: res.data.avatar }));
      setMensaje('Avatar actualizado correctamente');
    } catch (error) {
      console.error("Error al subir avatar:", error);
      setError("No se pudo actualizar el avatar");
    }
  };

  // Guardar cambios
  const guardarPerfil = async () => {
    try {
      const datosActualizados = {
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        fecha_nacimiento: usuario.fecha_nacimiento,
        genero: usuario.genero
      };
      
      await axios.put(`http://localhost:3000/api/usuarios/${userId}`, datosActualizados);
      setMensaje('Perfil actualizado correctamente');
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      setError("No se pudo guardar el perfil");
    }
  };

  const guardarConfiguracion = async () => {
    try {
      await axios.put(`http://localhost:3000/api/usuarios/${userId}/configuracion`, configuracion);
      setMensaje('Preferencias actualizadas correctamente');
      
      // Aplicar tema seleccionado
      document.body.classList.toggle('tema-oscuro', configuracion.tema === 'oscuro');
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      setError("No se pudieron guardar las preferencias");
    }
  };

  const cambiarPassword = async () => {
    if (seguridad.nuevoPassword !== seguridad.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const passwordCifrada = cifrarVigenere(
        seguridad.nuevoPassword,
        process.env.VIGENERE_KEY || "ClaveSecreta123"
      );

      await axios.put(`http://localhost:3000/api/usuarios/${userId}/password`, {
        passwordActual: seguridad.passwordActual,
        nuevoPassword: passwordCifrada
      });
      
      setSeguridad({
        passwordActual: '',
        nuevoPassword: '',
        confirmarPassword: ''
      });
      setMensaje('Contraseña cambiada correctamente');
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setError(error.response?.data?.message || "No se pudo cambiar la contraseña");
    }
  };

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, error]);

  if (cargando) {
    return <div className="cargando">Cargando configuración...</div>;
  }

  return (
    <div className="configuracion-container">
      <h2>⚙️ Configuración</h2>

      <div className="configuracion-tabs">
        <button
          className={activeTab === 'perfil' ? 'active' : ''}
          onClick={() => setActiveTab('perfil')}
        >
          Perfil
        </button>
        <button
          className={activeTab === 'preferencias' ? 'active' : ''}
          onClick={() => setActiveTab('preferencias')}
        >
          Preferencias
        </button>
        <button
          className={activeTab === 'seguridad' ? 'active' : ''}
          onClick={() => setActiveTab('seguridad')}
        >
          Seguridad
        </button>
      </div>

      {error && (
        <div className="mensaje error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {mensaje && (
        <div className="mensaje exito">
          {mensaje}
          <button onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <div className="configuracion-contenido">
        {activeTab === 'perfil' && (
          <div className="seccion-perfil">
            <h3>Perfil de Usuario</h3>
            <div className="avatar-container">
              <img 
                src={usuario.avatar} 
                alt="Avatar" 
                className="avatar"
                onError={(e) => {
                  e.target.src = '/avatar-default.png';
                }}
              />
              <div className="avatar-actions">
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-input" className="btn-cambiar-avatar">
                  Cambiar Avatar
                </label>
                <p>Formatos soportados: JPG, PNG (Max. 2MB)</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={usuario.nombre}
                onChange={handleUsuarioChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={usuario.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={usuario.telefono}
                onChange={handleUsuarioChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={usuario.fecha_nacimiento}
                onChange={handleUsuarioChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género:</label>
              <select
                id="genero"
                name="genero"
                value={usuario.genero}
                onChange={handleUsuarioChange}
              >
                <option value="">Seleccionar...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>

            <button className="btn-guardar" onClick={guardarPerfil}>
              Guardar Cambios
            </button>
          </div>
        )}

        {activeTab === 'preferencias' && (
          <div className="seccion-preferencias">
            <h3>Preferencias de la Aplicación</h3>

            <div className="form-group">
              <label htmlFor="tema">Tema:</label>
              <select
                id="tema"
                name="tema"
                value={configuracion.tema}
                onChange={handleConfiguracionChange}
              >
                <option value="claro">Claro</option>
                <option value="oscuro">Oscuro</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="notificaciones"
                name="notificaciones"
                checked={configuracion.notificaciones}
                onChange={handleConfiguracionChange}
              />
              <label htmlFor="notificaciones">Recibir notificaciones</label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="recordatorios"
                name="recordatorios"
                checked={configuracion.recordatorios}
                onChange={handleConfiguracionChange}
              />
              <label htmlFor="recordatorios">Activar recordatorios</label>
            </div>

            <button className="btn-guardar" onClick={guardarConfiguracion}>
              Guardar Preferencias
            </button>
          </div>
        )}

        {activeTab === 'seguridad' && (
          <div className="seccion-seguridad">
            <h3>Seguridad y Privacidad</h3>

            <div className="form-group">
              <label htmlFor="passwordActual">Contraseña Actual:</label>
              <input
                type="password"
                id="passwordActual"
                name="passwordActual"
                value={seguridad.passwordActual}
                onChange={handleSeguridadChange}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nuevoPassword">Nueva Contraseña:</label>
              <input
                type="password"
                id="nuevoPassword"
                name="nuevoPassword"
                value={seguridad.nuevoPassword}
                onChange={handleSeguridadChange}
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarPassword">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={seguridad.confirmarPassword}
                onChange={handleSeguridadChange}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <div className="requisitos-password">
              <p>La contraseña debe contener:</p>
              <ul>
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una mayúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial</li>
              </ul>
            </div>

            <button className="btn-guardar" onClick={cambiarPassword}>
              Cambiar Contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;