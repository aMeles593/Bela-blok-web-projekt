const express = require('express');
const router = express.Router();

const {
  saveGame,
  getGames
} = require('../controllers/games.controllers');

router.post('/', saveGame);

router.get('/', getGames);

module.exports = router;