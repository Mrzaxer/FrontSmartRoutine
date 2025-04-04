
import { Link } from 'react-router-dom';
import './admin.css'; // Asegúrate de que se importa el CSS correcto

function Admin() {
  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <ul>
          <li><Link to="/respaldar">Gestión de usuarios</Link></li>
          <li><Link to="/">Cerrar sesión</Link></li>
        </ul>
      </nav>

      <div className="admin-content">
        <h1>Bienvenido al panel de administración</h1>
       
      </div>
    </div>
  );
}

export default Admin;
