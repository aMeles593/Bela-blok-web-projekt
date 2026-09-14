const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const db = require('./db');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const gamesRoutes = require('./routes/games.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const quoteRoutes = require('./routes/quote.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/history-games', gamesRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/quote', quoteRoutes);

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

/* -------------------------------- */
/* SOCKET.IO                        */
/* -------------------------------- */

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket.IO korisnik spojen: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket.IO korisnik odspojen: ${socket.id}`);
  });

  /*
   * Četiri igrača:
   * Jedna ekipa ručno unosi bodove,
   * a druga se automatski računa od 162.
   */
  socket.on('calculate-four-player-points', (data) => {
    try {
      const { team, points } = data;

      const GAME_POINTS = 162;

      if (team !== 0 && team !== 1) {
        socket.emit('four-player-points-error', {
          message: 'Neispravan broj ekipe.'
        });
        return;
      }

      const numericPoints = Number(points);

      if (isNaN(numericPoints)) {
        socket.emit('four-player-points-error', {
          message: 'Bodovi moraju biti broj.'
        });
        return;
      }

      const safePoints = Math.max(
        0,
        Math.min(GAME_POINTS, numericPoints)
      );

      let team1Points;
      let team2Points;

      if (team === 0) {
        team1Points = safePoints;
        team2Points = GAME_POINTS - safePoints;
      } else {
        team2Points = safePoints;
        team1Points = GAME_POINTS - safePoints;
      }

      socket.emit('four-player-points-calculated', {
        team1Points,
        team2Points
      });

      console.log(
        `Socket.IO računanje: Tim ${team + 1} unio ${safePoints} -> ` +
        `Tim 1: ${team1Points}, Tim 2: ${team2Points}`
      );

    } catch (error) {
      console.error('Socket.IO greška:', error);

      socket.emit('four-player-points-error', {
        message: 'Greška pri računanju bodova.'
      });
    }
  });
});

/* -------------------------------- */
/* SERVER                           */
/* -------------------------------- */

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend radi na portu ${PORT}`);
});