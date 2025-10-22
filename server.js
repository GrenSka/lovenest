const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();

// Serve static files from "public"
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

// Homepage route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>Welcome back, ${req.session.user} 💕</h1>
      <ul>${messages.map(m => `<li><strong>${m.user}:</strong>: ${m.text}</li>`).join('')}</ul>
      <form action="/message" method="POST">
        <textarea name="message" placeholder="Write something sweet..." required></textarea>
        <button type="submit">Send</button>
      </form>
      <a href="/logout">Go back</a>
    `);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LoveNest running on http://localhost:${PORT} 💖`));