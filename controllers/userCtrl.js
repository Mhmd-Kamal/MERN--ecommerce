// jshint esversion:8

const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'email already exists' });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: 'password is at least 6 characters long.' });
      }

      // password encryption

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new User({ name, email, password: passwordHash });

      //   MongoDB save
      newUser.save();

      // Create JWT to authentication
      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/user/refresh_token',
      });

      res.json({ accessToken });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshToken;
      if (!rf_token)
        return res.status(400).json({ msg: 'please login or register' });

      jwt.verify(rf_token, REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: 'please login or register' });

        const accessToken = createAccessToken({ id: user.id });
        res.json({ user, accessToken });
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = userCtrl;
