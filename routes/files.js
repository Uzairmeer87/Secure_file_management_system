const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USER_FILES = path.join(__dirname, '..', 'user_files');

// middleware to require auth
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// helper for file path safety
function userFilePath(username, filename) {
  // basic sanitize: remove .. and leading slashes
  const safeName = path.basename(filename);
  return path.join(USER_FILES, username, safeName);
}

router.get('/dashboard', requireAuth, (req, res) => {
  const user = req.session.user;
  const dir = path.join(USER_FILES, user);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const files = fs.readdirSync(dir);
  res.render('dashboard', { files, user });
});

// Create / Write file
router.post('/create', requireAuth, (req, res) => {
  const user = req.session.user;
  let { filename, content } = req.body;
  if (!filename) filename = 'untitled.txt';
  if (path.extname(filename) === '') filename += '.txt';
  const filePath = userFilePath(user, filename);
  try {
    fs.writeFileSync(filePath, content || '', 'utf8');
    res.redirect('/files/dashboard');
  } catch (e) {
    res.render('error', { error: 'Error creating file.' });
  }
});

// Read file
router.get('/read/:name', requireAuth, (req, res) => {
  const user = req.session.user;
  const filename = req.params.name;
  const filePath = userFilePath(user, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  const content = fs.readFileSync(filePath, 'utf8');
  res.render('read', { filename, content });
});

// Metadata
router.get('/metadata/:name', requireAuth, (req, res) => {
  const user = req.session.user;
  const filename = req.params.name;
  const filePath = userFilePath(user, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  const stat = fs.statSync(filePath);
  res.render('metadata', { filename, stat });
});

// Modify (rename or overwrite)
router.get('/modify/:name', requireAuth, (req, res) => {
  const user = req.session.user;
  const filename = req.params.name;
  const filePath = userFilePath(user, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  const content = fs.readFileSync(filePath, 'utf8');
  res.render('modify', { filename, content, message: null });
});

router.post('/modify/:name', requireAuth, (req, res) => {
  const user = req.session.user;
  const oldName = req.params.name;
  const { newName, newContent } = req.body;
  const oldPath = userFilePath(user, oldName);

  if (!fs.existsSync(oldPath)) return res.status(404).send('File not found');

  // rename if requested
  if (newName && newName.trim().length > 0 && newName !== oldName) {
    const newPath = userFilePath(user, newName);
    try {
      fs.renameSync(oldPath, newPath);
      // write new content if provided
      if (newContent !== undefined) fs.writeFileSync(newPath, newContent, 'utf8');
      return res.redirect('/files/dashboard');
    } catch (e) {
      return res.render('error', { error: 'Error renaming file' });
    }
  } else {
    // just overwrite content
    try {
      fs.writeFileSync(oldPath, newContent || '', 'utf8');
      return res.redirect('/files/dashboard');
    } catch (e) {
      return res.render('error', { error: 'Error writing file' });
    }
  }
});

// Delete file
router.post('/delete/:name', requireAuth, (req, res) => {
  const user = req.session.user;
  const filename = req.params.name;
  const filePath = userFilePath(user, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  try {
    fs.unlinkSync(filePath);
    res.redirect('/files/dashboard');
  } catch (e) {
    res.render('error', { error: 'Error deleting file' });
  }
});

module.exports = router;
