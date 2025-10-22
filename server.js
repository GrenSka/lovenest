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
  'Nana<33': 'MyPrettyGirl<3',
  'admin': 'lovemaster'
};

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password); // Debug
  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send('Login failed 💔');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Message submission
app.post('/message', (req, res) => {
  if (req.session.user === 'Nana<33') {
    const newMessage = {
      user: 'Nana<33',
      text: req.body.message,
      time: new Date().toISOString()
    };
    messages.push(newMessage);
    fs.writeFileSync('messages.json', JSON.stringify(messages));
    res.redirect('/');
  } else {
    res.send('Only Nana<33 can send messages 💌');
  }
});

// Message viewing
app.get('/messages', (req, res) => {
  if (req.session.user === 'Nana<33') {
    const visibleMessages = messages.filter(m => m.user !== 'Nana<33');
    res.json(visibleMessages);
  } else if (req.session.user === 'admin') {
    res.json(messages);
  } else {
    res.status(403).send('Please log in 💔');
  }
});

// Poem access
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

app.get('/login', (req, res) => {
  res.redirect('/');
});