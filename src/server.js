import express from 'express';
import { initDb, addApartment, addUser, getApartments, getApartmentById, getUsers, getUserById } from './config/db.js'; // Import DB methods
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors()); 
app.use(cors({
    origin: '*',  
}));

// Use JSON body parser middleware
app.use(bodyParser.json());


// Initialize the database when the app starts
initDb();

// Endpoint to get all apartments
app.get('/apartments', (req, res) => {
    const apartments = getApartments();
    res.json(apartments);
});

// Endpoint to get a single apartment by ID
app.get('/apartments/:id', (req, res) => {
    const apartment = getApartmentById(req.params.id);
    if (apartment) {
        res.json(apartment);
    } else {
        res.status(404).json({ message: 'Apartment not found' });
    }
});

// Endpoint to create a new apartment
app.post('/apartments', (req, res) => {
    const newApartment = addApartment(req.body); // Add the apartment to DB
    res.status(201).json(newApartment); // Send back the newly created apartment
});

// Endpoint to get all users
app.get('/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});

// Endpoint to get a single user by ID
app.get('/users/:id', (req, res) => {
    const user = getUserById(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Endpoint to create a new user
app.post('/users', (req, res) => {
    const newUser = addUser(req.body); // Add the user to DB
    res.status(201).json(newUser); // Send back the newly created user
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
