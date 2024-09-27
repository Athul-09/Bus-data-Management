const express = require('express');
const cors = require('cors');
const { createConnection } = require('mysql2');
const { hash, compare } = require('bcrypt');
const { json } = require('body-parser');


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
app.post('/api/register',  async(req, res) => {
  const { usn,fullName, email, password } = req.body;

  try {
      // Hash the password
      const hashedPassword =  await hash(password, 10);

      // Insert user data into the database
      const sql = 'INSERT INTO passenger (username,name, email, password) VALUES (?,?, ?, ?)';
      const values = [usn,fullName, email, hashedPassword];

      connection.query(sql, values, (err, results) => {
          if (err) {
              console.error('Error registering user:', err);
              res.status(500).json({ error: 'Internal server error' });
          } else {
              res.status(201).json({ message: 'User registered successfully' });
          }
      });
  } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(PORT,(req, res) => {
  console.log("listening to port"+PORT)
})