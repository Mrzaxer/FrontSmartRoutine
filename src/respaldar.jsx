import { useState } from "react";
import "./respaldar.css";

export default function BackupDB() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/respaldo");
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // Verificar que sea un ZIP válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/zip')) {
        throw new Error('Respuesta no es un archivo ZIP');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `respaldo-${new Date().toISOString().split('T')[0]}.zip`; // Nombre con fecha
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Liberar memoria
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error("Error en el respaldo:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backup-container">
      <div className="backup-card">
        <h1 className="backup-title">Respaldo de Base de Datos</h1>
        <p className="backup-description">
          Haz clic en el botón para generar un respaldo completo en formato ZIP.
        </p>
        <button
          onClick={handleBackup}
          className="backup-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generando respaldo...
            </>
          ) : (
            "Generar Respaldo"
          )}
        </button>
      </div>
    </div>
  );
}