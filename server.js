const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Load messages
let messages = [];
if (fs.existsSync('messages.json')) {
  messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'lovenest-secret',
  resave: false,
  saveUninitialized: true
}));

// Only two users
const users = {
  'Sana<33': 'MyPrettyGirl<3',
  'admin': 'praedos@1'
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send('Login failed 💔');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.post('/message', (req, res) => {
  if (req.session.user === 'Sana<33') {
    const newMessage = {
      user: 'Sana<33',
      text: req.body.message,
      time: new Date().toISOString()
    };
    messages.push(newMessage);
    fs.writeFileSync('messages.json', JSON.stringify(messages));
    res.redirect('/');
  } else {
    res.send('Only Sana<33 can send messages 💌');
  }
});

app.get('/messages', (req, res) => {
  if (req.session.user === 'Sana<33') {
    const visibleMessages = messages.filter(m => m.user !== 'Sana<33');
    res.json(visibleMessages);
  } else if (req.session.user === 'admin') {
    res.json(messages);
  } else {
    res.status(403).send('Please log in 💔');
  }
});

app.get('/poem', (req, res) => {
  if (req.session.user) {
    const poem = fs.readFileSync('poem.txt', 'utf8');
    res.send(poem);
  } else {
    res.status(403).send('Please log in 💔');
  }
});

app.listen(PORT, () => {
  console.log(`LoveNest running at http://localhost:${PORT}`);
});