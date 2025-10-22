const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();

let users = { girlfriend: bcrypt.hashSync('mypassword', 10) };
let messages = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({ secret: 'loveSecret', resave: false, saveUninitialized: true }));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && bcrypt.compareSync(password, users[username])) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send('Invalid login 💔');
  }
});

app.post('/message', (req, res) => {
  if (req.session.user) {
    messages.push({ user: req.session.user, text: req.body.message });
    res.redirect('/');
  } else {
    res.send('Please log in first 💔');
  }
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>Welcome back, ${req.session.user} 💕</h1>
      <ul>${messages.map(m => `<li><strong>${m.user}:</strong> ${m.text}</li>`).join('')}</ul>
      <a href="/">Go back</a>
    `);
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

app.listen(3000, () => console.log('LoveNest running on http://localhost:3000 💖'));