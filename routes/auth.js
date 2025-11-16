const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USER_FILES = path.join(__dirname, '..', 'user_files');

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}
function writeUsers(obj) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(obj, null, 2));
}

function isValidPassword(password) {
  if (!password || password.length < 8) return false;
  let hasUpper = /[A-Z]/.test(password);
  let hasLower = /[a-z]/.test(password);
  let hasDigit = /[0-9]/.test(password);
  let hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
}

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || username.trim().length === 0) {
      return res.render('register', { error: 'Username required' });
    }
    if (!isValidPassword(password)) {
      return res.render('register', { error: 'Password must be >=8 chars and include upper, lower, digit and special char' });
    }
    const users = readUsers();
    if (users[username]) {
      return res.render('register', { error: 'Username already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    users[username] = { password: hash, createdAt: new Date().toISOString() };
    writeUsers(users);
    // create user folder
    const userDir = path.join(USER_FILES, username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    res.redirect('/login');
  } catch (err) {
    res.status(500).render('register', { error: 'Registration failed. Please try again.' });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readUsers();
    if (!users[username]) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, users[username].password);
    if (!valid) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    // Save session
    req.session.user = username;
    res.redirect('/files/dashboard');
  } catch (err) {
    res.status(500).render('login', { error: 'Login failed. Please try again.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
});

module.exports = router;
