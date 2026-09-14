const express = require('express');
const multer = require('multer');
const db = require('../db');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Dozvoljene su samo JPG, PNG i WEBP slike.'));
    }
  }
});

// Dohvaćanje korisnika
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

// UPLOAD profilne slike
router.post('/:id/profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!req.file) {
      return res.status(400).json({
        message: 'Nije odabrana slika.'
      });
    }

    const result = await db.query(
      `UPDATE users
       SET profile_image = $1,
           profile_image_type = $2
       WHERE id = $3
       RETURNING id, username`,
      [
        req.file.buffer,
        req.file.mimetype,
        userId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Korisnik nije pronađen.'
      });
    }

    res.json({
      message: 'Profilna slika uspješno spremljena.',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Greška kod uploada slike:', error);

    res.status(500).json({
      message: 'Greška pri spremanju profilne slike.'
    });
  }
});

// REMOVE PROFILE IMAGE
router.delete('/:id/profile-image', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const result = await db.query(
      `UPDATE users
       SET profile_image = NULL,
           profile_image_type = NULL
       WHERE id = $1
       RETURNING id, username`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Korisnik nije pronađen.'
      });
    }

    res.json({
      message: 'Profilna slika uspješno uklonjena.',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Greška kod uklanjanja slike:', error);

    res.status(500).json({
      message: 'Greška pri uklanjanju profilne slike.'
    });
  }
});

// DOWNLOAD / prikaz profilne slike
router.get('/:id/profile-image', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const result = await db.query(
      `SELECT profile_image, profile_image_type
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Korisnik nije pronađen.'
      });
    }

    const user = result.rows[0];

    if (!user.profile_image) {
      return res.status(404).json({
        message: 'Korisnik nema profilnu sliku.'
      });
    }

    res.set('Content-Type', user.profile_image_type);
    res.send(user.profile_image);

  } catch (error) {
    console.error('Greška kod dohvaćanja slike:', error);

    res.status(500).json({
      message: 'Greška pri dohvaćanju profilne slike.'
    });
  }
});

module.exports = router;