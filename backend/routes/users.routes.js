const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT id, username
       FROM users
       ORDER BY username ASC`
    );

    res.json(result.rows);

  } catch (error) {

    console.error('Greška kod dohvaćanja korisnika:', error);

    res.status(500).json({
      message: 'Greška na serveru.'
    });

  }
});

module.exports = router;