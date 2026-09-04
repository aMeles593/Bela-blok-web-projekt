const express = require('express');
const router = express.Router();

const { saveGame } = require('../controllers/games.controllers');

router.post('/', saveGame);

module.exports = router;