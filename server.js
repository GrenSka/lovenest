const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'loveSecret', resave: false, saveUninitialized: true }));

// Load messages from file
let messages = [];
if (fs.existsSync('messages.json')) {
  messages = JSON.parse(fs.readFileSync('messages.json'));
}

// Users
let users = {
  'Sana<33': bcrypt.hashSync('MyPrettyGirl<3', 10),
  'oorjiboorji': bcrypt.hashSync('praedos@1', 10)
};

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
    const newMessage = {
      user: req.session.user,
      text: req.body.message,
      time: new Date().toISOString()
    };
    messages.push(newMessage);
    fs.writeFileSync('messages.json', JSON.stringify(messages));
    res.redirect('/');
  } else {
    res.send('Please log in first 💔');
  }
});

// Messages API
app.get('/messages', (req, res) => {
  if (req.session.user) {
    if (req.session.user === 'admin') {
      res.json(messages); // Admin sees everything
    } else {
      const visibleMessages = messages.filter(m => m.user !== req.session.user);
      res.json(visibleMessages); // Sana<33 sees only others' messages
    }
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