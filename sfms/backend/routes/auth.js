const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const JWT_SECRET = 'verysecret!';

const router = express.Router();

// Helper: read users
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return fs.readJsonSync(USERS_FILE);
}
// Helper: write users
function writeUsers(users) {
  fs.writeJsonSync(USERS_FILE, users, { spaces: 2 });
}

// POST /api/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  let users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const hashed = bcrypt.hashSync(password, 8);
  users.push({ username, password: hashed });
  writeUsers(users);
  res.json({ success: true });
});

// POST /api/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  let users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
