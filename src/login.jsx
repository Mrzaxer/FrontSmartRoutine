import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logop from '/imagenes/estilo.png';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar campos
    if (!correo || !password) {
      setError('Por favor, ingrese su correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      // Hacer la petición al backend para iniciar sesión
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);
        // Retrasar la redirección para que el usuario vea el mensaje
        setTimeout(() => {
          // Si el inicio de sesión es exitoso, redirigir según el rol
          if (data.usuario.rol === 'admin') {
            navigate('/admin');
          } else {
            navigate('/principal');
          }
        }, 2000);
      } else {
        // Mostrar mensaje de error del backend
        setError(data.message || 'Error al iniciar sesión.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
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
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        <button onClick={handleRegister} className="register-button">
          Registrar
        </button>
      </div>

      {/* Modal de éxito */}
      <div className={`success-modal ${showSuccess ? 'active' : ''}`}>
        <div className="success-modal-content">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#00a65a">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="success-message">¡Sesión iniciada correctamente!</p>
          <div className="success-loading-bar">
            <div className="success-loading-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;