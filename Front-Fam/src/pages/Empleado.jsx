import React, { useState } from 'react';
import '../App.css'; // si usas estilos globales
import Header from '../components/Header';
import TareaOperario from '../components/EmpleadoComp/TareaOperario';
import IncidenciasOperario from '../components/EmpleadoComp/IncidenciasOperario';

const Empleado = ({ setUser }) => {
  const [taskStarted, setTaskStarted] = useState(false);
  const [incidence, setIncidence] = useState('');
  const [type, setType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [tiempoProduccion, setTiempoProduccion] = useState(0);
  const handleResetIncidenceForm = () => {
  setIncidence('');
  setType('');
};

  const handleStartTask = () => setTaskStarted(true);
  const handleEndTask = () => setTaskStarted(false);
  const handleIncidenceChange = (e) => setIncidence(e.target.value);
  const handleTypeChange = (e) => setType(e.target.value);

  const handleSubmitIncidence = () => {
    alert(`Incidencia cargada:\nTipo: ${type}\nDescripción: ${incidence}`);
    setIncidence('');
    setType('');
  };

  const handleImageSelect = (imgPath) => setSelectedImage(imgPath);

  return (
    <div className="app">
      <Header setUser={setUser}
      tiempoProduccion={tiempoProduccion} />
      <TareaOperario
        taskStarted={taskStarted}
        onStart={handleStartTask}
        onEnd={handleEndTask}
        onTiempoFinalizado={(tiempo) => setTiempoProduccion(tiempo)}
      />
      <IncidenciasOperario
        incidence={incidence}
        onChange={handleIncidenceChange}
        onSubmit={handleSubmitIncidence}
        type={type}
        onTypeChange={handleTypeChange}
        onSelectImage={handleImageSelect}
        selectedImage={selectedImage}
        showBuscarButton={false}
        onSuccess={handleResetIncidenceForm}
      />
    </div>
  );
};

export default Empleado;
