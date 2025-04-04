import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './registro.css';

function Registro() {
  const API_URL = 'https://routineappi.onrender.com';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    password: '',
    rol: 'usuario',
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error cuando se edita el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+52\s\d{2}\s\d{4}\s\d{4}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato: +52 XX XXXX XXXX';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMensaje({ texto: 'Por favor corrige los errores', tipo: 'error' });
      return;
    }

    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar');
      }

      // Registro exitoso
      setMensaje({ 
        texto: '¡Registro exitoso! Redirigiendo...', 
        tipo: 'success' 
      });
      
      // Guardar token y redirigir después de 2 segundos
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', formData.correo);
      
      setTimeout(() => {
        navigate(data.usuario.rol === 'admin' ? '/admin' : '/principal');
      }, 2000);

    } catch (error) {
      console.error('Error en registro:', error);
      setMensaje({ 
        texto: error.message || 'Error al conectar con el servidor', 
        tipo: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Crear Cuenta</h2>
        
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
            <button onClick={() => setMensaje({ texto: '', tipo: '' })}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'error' : ''}
              required
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono (+52 XX XXXX XXXX)"
              value={formData.telefono}
              onChange={handleChange}
              className={errors.telefono ? 'error' : ''}
              required
            />
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              className={errors.correo ? 'error' : ''}
              required
            />
            {errors.correo && <span className="error-message">{errors.correo}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default Registro;