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

  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error de conexión con el servidor');
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
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telefono"
            placeholder="El formato debe ser +52 XX XXXX XXXX"
            value={formData.telefono}
            onChange={handleChange}
            required
            pattern="^\+52\s\d{2}\s\d{4}\s\d{4}$"
            title="El formato debe ser +52 XX XXXX XXXX"
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo Electrónico"
            value={formData.correo}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        
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
              'Registrar'
            )}
          </button>
        </form>

        <Link to="/login" className="login-link">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>

      {/* Modal de éxito */}
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