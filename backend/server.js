const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const gamesRoutes = require('./routes/games.routes');
const statisticsRoutes = require('./routes/statistics.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/history-games', gamesRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend radi!'
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');

    res.json({
      message: 'Baza radi!',
      time: result.rows[0].now
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Greška pri spajanju na bazu'
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend radi na http://localhost:${PORT}`);
});