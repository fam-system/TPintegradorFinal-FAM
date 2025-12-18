import React, { useState } from 'react';
import '../App.css';
import Header from '../components/Header';
import AsignarTareas from '../components/EncargadoComp/AsignarTareas';
import ListaIncidenciasRecientes from '../components/EncargadoComp/ListaIncidenciasRecientes';
import ListaProcesosPendientes from '../components/EncargadoComp/ListaProcesosPendientes';
import IncidenciasOperario from '../components/EmpleadoComp/IncidenciasOperario';

const Encargado = ({ setUser }) => {
  const [incidence, setIncidence] = useState('');
  const [type, setType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [idProceso, setIdProceso] = useState(null); // Debes obtenerlo según tu lógica

  // Handlers
  const handleIncidenceChange = (e) => setIncidence(e.target.value);
  const handleTypeChange = (e) => setType(e.target.value);
  const handleImageSelect = (imgPath) => setSelectedImage(imgPath);

  return (
    <div className="app encargado-container">
      <Header setUser={setUser} />
      <div className="asignar-procesos-row">
        <AsignarTareas />
        <ListaProcesosPendientes />
      </div>
      <div className="incidencias-wrapper">
        <ListaIncidenciasRecientes />
        <IncidenciasOperario
          incidence={incidence}
          onChange={handleIncidenceChange}
          type={type}
          onTypeChange={handleTypeChange}
          onSelectImage={handleImageSelect}
          selectedImage={selectedImage}
          showBuscarButton={true}
          rol={2} // Encargado
          idProceso={idProceso} // Debes pasar el idProceso correcto según tu lógica
        />
      </div>
    </div>
  );
};

export default Encargado;