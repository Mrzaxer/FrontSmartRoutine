
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './inicio.jsx';
import Login from './login.jsx'; // Asegúrate de que el archivo existe en src
import Principal from './principal.jsx'; // Asegúrate de que el archivo existe en src
import Admin from './admin.jsx';;
import Registro from './registro.jsx';
import Respaldar from './respaldar.jsx';
import GraficaSensor from './GraficaSensor.jsx'; // Asegúrate de que el archivo existe en src
import ProgresoHabitos from './progresoHabitos.jsx';
import Habitos from './Habitos.jsx';
import Logros from './Logros.jsx';
import ChartWrapper from './ChartWrapper.jsx';
import Configuracion from './Configuracion.jsx';
const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/respaldar" element={<Respaldar />} />
        <Route path="/GraficaSensor" element={<GraficaSensor />} />
        <Route path="/ProgresoHabitos" element={<ProgresoHabitos />} />
        <Route path="/Habitos" element={<Habitos />} />
        <Route path="/Logros" element={<Logros />} />
        <Route path="/ChartWrapper" element={<ChartWrapper />} />
        <Route path="/Configuracion" element={<Configuracion />} />
      </Routes>
    </Router>
  );
}

export default App;


