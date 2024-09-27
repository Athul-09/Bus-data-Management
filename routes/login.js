const express = require('express');
const cors = require('cors');
const { createConnection } = require('mysql2');
const { hash, compare } = require('bcrypt');
const { json } = require('body-parser');
const app = express();
app.use(cors());
app.use(express.json());

// Login route
app.post('/api/login', async (req, res) => {
  const { usn, password } = req.body;

  try {
    // Fetch user data from the database based on the provided username
    const sql = 'SELECT * FROM passenger WHERE username = ?';
    const values = [usn];

    connection.query(sql, values, async (err, results) => {
      if (err) {
        console.error('Error authenticating user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (results.length === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        const user = results[0];

        // Compare the provided password with the hashed password from the database
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          res.status(401).json({ error: 'Invalid credentials' });
        } else {
          // Here, you can generate and return a JWT token for authentication
          res.status(200).json({ message: 'Login successful' });
        }
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log("Listening to port " + PORT);
});
