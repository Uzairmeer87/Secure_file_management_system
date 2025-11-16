const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const JWT_SECRET = 'verysecret!';

const router = express.Router();

// JWT middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Helper: metadata path
function metaPath(filename) {
  return path.join(UPLOADS_DIR, filename + '.meta.json');
}

// GET /api/files - list files & metadata
router.get('/', auth, (req, res) => {
  fs.ensureDirSync(UPLOADS_DIR);
  const files = fs.readdirSync(UPLOADS_DIR).filter(f => !f.endsWith('.meta.json'));
  let out = files.map(name => {
    let meta = {};
    try { meta = fs.readJsonSync(metaPath(name)); } catch {}
    return { name, ...meta };
  });
  res.json(out);
});

// POST /api/files/upload - upload file and metadata
router.post('/upload', [auth, upload.single('file')], (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const meta = {
    name: file.originalname,
    size: file.size,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  fs.writeJsonSync(metaPath(file.originalname), meta, { spaces: 2 });
  res.json({ success: true });
});

// POST /api/files/create - create an empty or content-filled file
router.post('/create', auth, (req, res) => {
  let { name, content = '' } = req.body;
  if (!name || typeof name !== 'string' || /[\/\\:*?"<>|]/.test(name) || name.length > 64 || name.startsWith('.')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  const filePath = path.join(UPLOADS_DIR, name);
  if (fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'File already exists' });
  }
  // Write file
  fs.writeFileSync(filePath, content);
  // Metadata
  const meta = {
    name,
    size: Buffer.byteLength(content),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  fs.writeJsonSync(metaPath(name), meta, { spaces: 2 });
  res.json({ success: true });
});

// GET /api/files/:name - get file content
router.get('/:name', auth, (req, res) => {
  const name = req.params.name;
  const filePath = path.join(UPLOADS_DIR, name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.type('text/plain').send(fs.readFileSync(filePath, 'utf8'));
});

// PUT /api/files/:name - update file content and updatedAt
router.put('/:name', auth, (req, res) => {
  const name = req.params.name;
  const filePath = path.join(UPLOADS_DIR, name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.writeFileSync(filePath, req.body.content);
  let meta = fs.readJsonSync(metaPath(name));
  meta.updatedAt = new Date().toISOString();
  fs.writeJsonSync(metaPath(name), meta, { spaces: 2 });
  res.json({ success: true });
});

// DELETE /api/files/:name - delete file and metadata
router.delete('/:name', auth, (req, res) => {
  const name = req.params.name;
  fs.removeSync(path.join(UPLOADS_DIR, name));
  fs.removeSync(metaPath(name));
  res.json({ success: true });
});

// GET /api/files/:name/meta - get metadata JSON
router.get('/:name/meta', auth, (req, res) => {
  const name = req.params.name;
  if (!fs.existsSync(metaPath(name))) return res.sendStatus(404);
  res.json(fs.readJsonSync(metaPath(name)));
});

module.exports = router;
