
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './inicio.jsx';
import Login from './login.jsx'; // Asegúrate de que el archivo existe en src
import Principal from './principal.jsx'; // Asegúrate de que el archivo existe en src
import Admin from './admin.jsx';;
import Registro from './registro.jsx';
import Respaldar from './respaldar.jsx';
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
      </Routes>
    </Router>
  );
}

export default App;


