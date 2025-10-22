const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'loveSecret', resave: false, saveUninitialized: true }));

// Dummy user and message store
let users = { girlfriend: bcrypt.hashSync('mypassword', 10) };
let messages = [];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && bcrypt.compareSync(password, users[username])) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send('Invalid login 💔');
  }
});

// Message route
app.post('/message', (req, res) => {
  if (req.session.user) {
    messages.push({ user: req.session.user, text: req.body.message });
    res.redirect('/');
  } else {
    res.send('Please log in first 💔');
  }
});

// Messages API
app.get('/messages', (req, res) => {
  if (req.session.user) {
    res.json(messages);
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LoveNest running on http://localhost:${PORT} 💖`));