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

  const API_URL = 'https://backsmartroutine-2syq.onrender.com/api/usuarios';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      } else {
        console.error('No se recibió token en la respuesta:', data);
      }

      if (data.usuario) {
        localStorage.setItem('userData', JSON.stringify(data.usuario));
        const usuarioId = data.usuario.id || data.usuario._id;
        if (usuarioId) {
          localStorage.setItem('userId', usuarioId);
        }
      }

      setShowSuccess(true);

      setTimeout(() => {
        if (data.usuario && data.usuario.rol === 'admin') {
          navigate('/admin');
        } else {
          navigate('/principal');
        }
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
      <div className="login-background"></div>
      <div className="login-box">
        <div className="logo-container">
          <img src={logop} alt="Logo" className="logo" />
          <h1 className="app-title">SMART ROUTINE</h1>
          <p className="app-subtitle">Organiza tu vida, alcanza tus metas</p>
        </div>
        
        <h2>Iniciar sesión</h2>

        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div>
              {error.includes('conexión') ? (
                <>
                  <strong>Error de conexión</strong>
                  <p>Verifica tu conexión a internet y que la API esté en línea</p>
                </>
              ) : (
                <p>{error}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
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
          </div>

          <div className="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
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
          </div>

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

        <div className="login-footer">
          <p>¿No tienes cuenta? <button onClick={handleRegister} className="register-button">Regístrate</button></p>
          <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
      </div>

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="checkmark-circle">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle-bg" cx="26" cy="26" r="25"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h3>¡Autenticación exitosa!</h3>
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