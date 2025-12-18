import React, { useEffect } from 'react';
import './Modal.css';

function Modal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Agregar dato',
  placeholder = 'Ingrese el dato',
  error = '',
  inputType = 'text',
  value = '',
  onChange = () => {},
  extraFields = [], // <-- NUEVO: permite campos adicionales
}) {
  useEffect(() => {
    if (isOpen) {
      // El valor y estado de los inputs los controla el componente padre
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(value); // Confirmación depende del padre
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-wrapper">
      <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close-button" onClick={handleClose} aria-label="Cerrar modal">
          ×
        </button>
        <h3 id="modal-title">{title}</h3>

        {/* Campo principal */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="modal-input"
          autoFocus
        />

        {/* Campos adicionales si los hay */}
        {extraFields.map((field, index) => (
          <div key={index}>
            {field.label && <label>{field.label}</label>}
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder || ''}
              className="modal-input"
            />
          </div>
        ))}

        {error && <p className="modal-error">{error}</p>}

        <button
          className="modal-ok-button"
          onClick={handleConfirm}
          disabled={!value.trim()}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default Modal; 