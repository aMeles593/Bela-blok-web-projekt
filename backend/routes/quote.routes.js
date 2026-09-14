const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/random');

    if (!response.ok) {
      throw new Error(`Quote API greška: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data[0]) {
      return res.status(500).json({
        message: 'Nije moguće dohvatiti citat.'
      });
    }

    res.json({
      quote: data[0].q,
      author: data[0].a
    });

  } catch (error) {
    console.error('Greška kod dohvaćanja citata:', error);

    res.status(500).json({
      message: 'Greška pri dohvaćanju citata.'
    });
  }
});

module.exports = router;