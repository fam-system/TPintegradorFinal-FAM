import { useState, useRef } from 'react';
import { Button, Card, Col, Form, FormGroup, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import '../components/Login.css';
import API_URL from '../services/api';

function Login({ onLogin }) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState({ nombreUsuario: false, pass: false });
  const [errorMessage, setErrorMessage] = useState('');

  const nombreUsuarioRef = useRef(null);
  const passRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!nombreUsuario) {
      setErrors(prev => ({ ...prev, nombreUsuario: true }));
      nombreUsuarioRef.current.focus();
      return;
    }

    if (!pass) {
      setErrors(prev => ({ ...prev, pass: true }));
      passRef.current.focus();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ingreso/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreUsuario, pass })
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const data = await response.json();

      if (data.status && data.user) {
        const { user, token } = data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);

        if (user.idRol === 4) {
          navigate('/empleado');
        } else if (user.idRol === 2) {
          navigate('/encargado');
        } else if (user.idRol === 3) {
          navigate('/oficinaTecnica');
        } else {
          setErrorMessage('Rol de usuario desconocido');
        }
      } else {
        setErrorMessage('Credenciales incorrectas');
      }
      
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrorMessage('Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <div className="login-page">
      <Card className="login-container">
        <Card.Body>
          <Row className="mb-4">
            <h5 className="welcome-title">¡Bienvenidos a FAM!</h5>
          </Row>
          <Form onSubmit={handleSubmit}>
            <FormGroup className="mb-4">
              <Form.Label>Usuario:</Form.Label>
              <Form.Control
                type="text"
                className={`input-email ${errors.nombreUsuario ? 'border border-danger' : ''}`}
                placeholder="Ingresar usuario"
                value={nombreUsuario}
                onChange={(e) => {
                  setNombreUsuario(e.target.value);
                  setErrors(prev => ({ ...prev, nombreUsuario: false }));
                }}
                ref={nombreUsuarioRef}
              />
            </FormGroup>

            <FormGroup className="mb-4">
              <Form.Label>Contraseña:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresar contraseña"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setErrors(prev => ({ ...prev, pass: false }));
                }}
                ref={passRef}
              />
            </FormGroup>

            {errorMessage && (
              <p className="text-danger text-center">{errorMessage}</p>
            )}

            <Row>
              <Col className="login-button-container">
                <Button variant="secondary" type="submit">
                  Iniciar sesión
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;