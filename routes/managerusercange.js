const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 5500;

const connection = mysql.createConnection({
    host: //db host,
    user: //db username,
    password: // db password,
    database: //db name
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(cors());
app.use(express.json());

app.post('/api/update-username', (req, res) => {
    // code to update username
});

app.post('/api/update-password', (req, res) => {
    // code to update password
});

// New route to update profile
app.post('/api/update-profile', (req, res) => {
    const { newUsername, newPassword } = req.body;

    // Validate newUsername and newPassword
    if (!newUsername || !newPassword) {
        return res.status(400).json({ message: 'New username and password are required.' });
    }

    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Failed to hash password.' });
        }

        // Update username and hashed password in the database
        connection.query('UPDATE manager SET username = ?, password = ? WHERE manager_id = 1', [newUsername, hash], (error, results) => {
            if (error) {
                console.error('Error updating profile:', error);
                return res.status(500).json({ message: 'Failed to update profile.' });
            }

            return res.status(200).json({ message: 'Profile updated successfully.' });
        });
    });
});

app.post('/api/add-bus', (req, res) => {
    const { busNo, routeNo, startingTime, departureplace, destination, availability, busType } = req.body;

    const sql = 'INSERT INTO buses (BusNo, RouteNo, DepartureTime, DeparturePlace, Destination, Availability, BusType) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [busNo, routeNo, startingTime, departureplace, destination, availability, busType];

    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error adding bus:', err);

            // Check if the error is due to a trigger (duplicate key)
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'Bus with the same RouteNo and DepartureTime already exists' });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        } else {
            res.status(201).json({ message: 'Bus added successfully' });
        }
    });
});

app.post('/api/delete-bus', (req, res) => {
    const busId = req.body.busId;

    // SQL query to delete a bus by ID
    const sql = 'DELETE FROM buses WHERE BusId = ?';

    connection.query(sql, [busId], (error, results) => {
        if (error) {
            console.error('Error deleting bus:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Bus deleted successfully' });
        } else {
            res.status(404).json({ error: 'Bus not found' });
        }
    });
});

app.post('/api/update-bus', (req, res) => {
    const { busId, startingTime, departurePlace, destination } = req.body;

    // Fetch the current values of the bus attributes from the database
    const fetchSql = 'SELECT DepartureTime, DeparturePlace, Destination FROM buses WHERE BusId = ?';
    connection.query(fetchSql, [busId], (fetchError, fetchResults) => {
        if (fetchError) {
            console.error('Error fetching bus details:', fetchError);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (fetchResults.length === 0) {
            res.status(404).json({ error: 'Bus not found' });
            return;
        }

        const currentStartingTime = fetchResults[0].DepartureTime;
        const currentDeparturePlace = fetchResults[0].DeparturePlace;
        const currentDestination = fetchResults[0].Destination;

        // Use the current values if the parameters are not provided
        const updatedStartingTime = startingTime !== undefined ? startingTime : currentStartingTime;
        const updatedDeparturePlace = departurePlace !== undefined ? departurePlace : currentDeparturePlace;
        const updatedDestination = destination !== undefined ? destination : currentDestination;

        // Update the bus with the new values
        const sql = 'UPDATE buses SET DepartureTime = ?, DeparturePlace = ?, Destination = ? WHERE BusId = ?';
        const values = [updatedStartingTime, updatedDeparturePlace, updatedDestination, busId];

        connection.query(sql, values, (error, results) => {
            if (error) {
                console.error('Error updating bus:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (results.affectedRows > 0) {
                res.status(200).json({ message: 'Bus updated successfully' });
            } else {
                res.status(404).json({ error: 'Bus not found' });
            }
        });
    });
});


app.get('/api/get-buses', (req, res) => {
    // SQL query to select all buses
    const sql = 'SELECT * FROM buses';

    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching buses:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Add new route for stored procedure here
app.post('/api/get-buses-by-departure-place', (req, res) => {
    const { departurePlace } = req.body;

    connection.query('CALL GetBusesByDeparturePlace(?)', [departurePlace], (error, results) => {
        if (error) {
            console.error('Error fetching buses by departure place:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results[0]); // Assuming the result is returned as the first parameter
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
