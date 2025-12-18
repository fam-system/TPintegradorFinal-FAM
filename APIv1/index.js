require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const pool = require('./db');

const operarioRouter = require('./routes/operario');
const encargadoRouter = require('./routes/encargado');
const oficinaRouter = require('./routes/oficina');
const loginRouter = require('./routes/ingreso');

//const configContent = fs.readFileSync('config.json');
//const config = JSON.parse(configContent);
const port = process.env.PORT || 3000;
//config.version = '2025.05.08-14.38';
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/operario', operarioRouter);
app.use('/encargado', encargadoRouter);
app.use('/oficina', oficinaRouter);
//app.use('/administrador', adminRoutes);
app.use('/ingreso', loginRouter);

// Ruta Principal
app.get('/', (req, res) => {
  res.json({
    info: 'ok',
    status: true,
    message: 'home publica',
    timestamp: new Date().toISOString()
  });
});
app.get('/health/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.listen(port, () => {
  //console.log(`Servidor en Puerto ${port}`);
});
