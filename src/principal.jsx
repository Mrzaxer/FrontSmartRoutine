import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './principal.css';
import habitosIcon from '/imagenes/habitos-icono.png';
import logo from '/imagenes/necesidades.png';

// Componentes
import Habitos from './Habitos';
import ProgresoUsuario from './progresoHabitos';
import Logros from './Logros';
import Configuracion from './Configuracion';
import GraficaSensor from './GraficaSensor';

const Principal = ({ userId }) => {
  const API_URL = 'http://localhost:3000';
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('inicio');
  const [datosCardiacos, setDatosCardiacos] = useState([]);

  // Obtener datos del sensor cardíaco
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sensores/${userId}`);
        const data = await res.json();

        console.log("Datos recibidos del backend:", data);

        const filtrado = data
          .filter(d => d.tipo_sensor === 'cardiaco')
          .map(d => ({
            ...d,
            timestamp: new Date(d.timestamp)
          }));

        console.log("Datos filtrados (cardiaco):", filtrado);

        setDatosCardiacos(filtrado);
      } catch (err) {
        console.error('Error al cargar datos del sensor cardíaco', err);
      }
    };

    if (userId) fetchDatos();
  }, [userId]);

  // Función que renderiza el contenido según la sección activa
  const renderSection = () => {
    switch(activeSection) {
      case 'inicio':
        return (
          <div className="welcome-section">
            <h2>Bienvenido a SmartRoutine</h2>
            <p>Tu aplicación para el seguimiento de hábitos y salud</p>
            <div className="welcome-cards">
              <div className="welcome-card">
                <h3>Mis Hábitos</h3>
                <p>Administra tus hábitos diarios</p>
              </div>
              <div className="welcome-card">
                <h3>Mi Progreso</h3>
                <p>Revisa tus estadísticas</p>
              </div>
              <div className="welcome-card">
                <h3>Sensores</h3>
                <p>Monitorea tus datos de salud</p>
              </div>
            </div>
          </div>
        );
      case 'habitos':
        return <Habitos userId={userId} />;
      case 'progreso':
        return <ProgresoUsuario userId={userId} />;
      case 'logros':
        return <Logros userId={userId} />;
      case 'configuracion':
        return <Configuracion userId={userId} />;
      case 'grafica':
        return <GraficaSensor userId={userId} />;  // Así debe verse
      default:
        return (
          <div className="welcome-section">
            <h2>Bienvenido a SmartRoutine</h2>
          </div>
        );
    }
  };

  return (
    <div className="principal-container">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => setActiveSection('inicio')}>
          <img src={logo} alt="Logo" className="navbar-logo" />
          <span className="navbar-title">SmartRoutine</span>
        </div>
        
        <div className="navbar-menu">
          <button 
            className={`nav-link ${activeSection === 'habitos' ? 'active' : ''}`}
            onClick={() => setActiveSection('habitos')}
          >
            Hábitos
          </button>
          <button 
            className={`nav-link ${activeSection === 'progreso' ? 'active' : ''}`}
            onClick={() => setActiveSection('progreso')}
          >
            Progreso
          </button>
          <button 
            className={`nav-link ${activeSection === 'logros' ? 'active' : ''}`}
            onClick={() => setActiveSection('logros')}
          >
            Logros
          </button>
          <button 
            className={`nav-link ${activeSection === 'grafica' ? 'active' : ''}`}
            onClick={() => setActiveSection('grafica')}
          >
            Sensores
          </button>
          <button 
            className={`nav-link ${activeSection === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveSection('configuracion')}
          >
            Configuración
          </button>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            navigate('/');
          }}
        >
          Cerrar sesión
        </button>
      </nav>

      <main className="principal-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default Principal;