import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './registro.css';

function Registro() {
  const API_URL = 'http://localhost:3000/api/usuarios';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    fecha_nacimiento: '',
    genero: '',
    rol: 'usuario',
  });

  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al registrar el usuario');
      }

      setShowSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error.message || 'Error desconocido al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Registro de Usuario</h2>

        {error && (
          <p className="error-message">
            {error.includes('conexión') ? (
              <>
                Error de conexión. Verifica: <br />
                1. Tu conexión a internet <br />
                2. Que la API esté en línea
              </>
            ) : (
              error
            )}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={formData.telefono}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="fecha_nacimiento"
            placeholder="Fecha de nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
          />
          <select name="genero" value={formData.genero} onChange={handleChange}>
            <option value="">Selecciona género (opcional)</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              'Registrar'
            )}
          </button>
        </form>

        <Link to="/login" className="login-link">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="checkmark">✓</div>
            <p>¡Registro exitoso!</p>
            <p>Redirigiendo al login...</p>
            <div className="progress-bar">
              <div className="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registro;
