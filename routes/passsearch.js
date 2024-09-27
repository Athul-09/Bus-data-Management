const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5500;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: //db host,
    user: //db username,
    password: // db password,
    database: //db name
});

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Endpoint to search buses based on 'from', 'to', 'busId', 'routeId', and 'busType'
app.post('/api/search-buses', (req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const busIdRouteId = req.body.busIdRouteId;
  const busType = req.body.busType;

  // SQL query to search for buses based on 'from', 'to', 'busId', 'routeId', and 'busType'
  const sql = 'SELECT * FROM buses WHERE (DeparturePlace = ? AND Destination = ?) OR (BusId = ? OR RouteNo = ?) AND BusType = ?';

  pool.query(sql, [from, to, busIdRouteId, busIdRouteId, busType], (error, results) => {
    if (error) {
      console.error('Error searching buses:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
