const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/greet', (req, res) => {
  res.json({ greeting: 'Hello from Express!' });
});

app.post('/api/calculate', (req, res) => {
  const { operation, x, y } = req.body;
  let result;
  switch (operation) {
    case 'add':
      result = x + y;
      break;
    case 'multiply':
      result = x * y;
      break;
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }
  res.json({ result });
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  // Simulated user data
  const user = { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  res.json(user);
});

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});