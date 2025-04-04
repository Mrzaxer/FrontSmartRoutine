import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import logop from '/imagenes/necesidades.png';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // URL base de la API
  const API_URL = 'https://routineappi.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!correo || !password) {
      setError('Por favor, ingrese su correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar datos de autenticación
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', correo);
      localStorage.setItem('userData', JSON.stringify(data.usuario));

      setShowSuccess(true);

      setTimeout(() => {
        navigate(data.usuario.rol === 'admin' ? '/admin' : '/principal');
      }, 1500);

    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logop} alt="Logo" className="logo" />
        <h2>Iniciar sesión</h2>
        
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
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              setError('');
            }}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
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
                Procesando...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <button 
          onClick={handleRegister} 
          className="register-button"
          disabled={loading}
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="checkmark">✓</div>
            <p>¡Autenticación exitosa!</p>
            <p>Redirigiendo...</p>
            <div className="progress-bar">
              <div className="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;