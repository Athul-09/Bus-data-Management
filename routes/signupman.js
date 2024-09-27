const express = require('express');
const cors = require('cors');
const { createConnection } = require('mysql2');
const { hash } = require('bcrypt');

const app = express();
const PORT = 5500;

const connection = createConnection({
  host: //db host,
  user: //db username,
  password: // db password,
  database: //db name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.use(cors());
app.use(express.json());

app.post('/api/register-manager', async (req, res) => {
  const { username, fullName, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Insert manager data into the database
    const sql = 'INSERT INTO manager (username, name, email, password) VALUES (?, ?, ?, ?)';
    const values = [username, fullName, email, hashedPassword];

    connection.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error registering manager:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(201).json({ message: 'Manager registered successfully' });
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log('Listening to port ' + PORT);
});
