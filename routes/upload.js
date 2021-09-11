// jshint esversion:8

const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

// Upload images on cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post('/upload', auth, authAdmin, (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ msg: 'no files uploaded.' });

    const { file } = req.files;

    if (file.size > 1024 * 1024) {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: 'file is too large.' });
    }

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: 'File format is incorrect.' });
    }

    cloudinary.uploader.upload(
      file.tempFilePath,
      { folder: 'test' },
      async (err, result) => {
        if (err) throw err;

        removeTmp(file.tempFilePath);

        res.json({ public_id: result.public_id, url: result.secure_url });
      }
    );
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

router.post('/destroy', auth, authAdmin, (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) return res.status(400).json({ msg: 'No image selected.' });

    cloudinary.uploader.destroy(public_id, (err, result) => {
      if (err) throw err;

      res.json({ msg: ' deleted image.' });
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = router;
