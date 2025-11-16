const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();
const DATA_DIR = path.join(__dirname, 'data');
const USER_FILES = path.join(__dirname, 'user_files');

// Ensure folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USER_FILES)) fs.mkdirSync(USER_FILES, { recursive: true });

// if users.json doesn't exist, create it
const usersFile = path.join(DATA_DIR, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify({}), 'utf8');

app.use(helmet());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session({
  name: 'sfms.sid',
  secret: process.env.SESSION_SECRET || 'set-a-strong-secret-here',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60 } // 1 hour
}));

// Make username available in views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/files', fileRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SFMS app running at http://localhost:${PORT}`);
});
