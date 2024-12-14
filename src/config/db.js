import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const dbFilePath = path.join(__dirname, '../../db.json');

// Function to read JSON data from the file
const readDb = () => {
    try {
        const data = fs.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(data); 
    } catch (error) {
        console.log("Error reading DB file:", error);
        return { apartments: [], users: [] }; 
    }
};

// Function to write data to the JSON file
const writeDb = (data) => {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log("Database updated successfully!");
    } catch (error) {
        console.log("Error writing to DB file:", error);
    }
};

// Function to initialize the database (only run once to ensure the file exists)
const initDb = () => {
    if (!fs.existsSync(dbFilePath)) {
        const initialData = { apartments: [], users: [] }; // Default data
        writeDb(initialData);
    }
};

// Function to add an apartment to the database
const addApartment = (apartmentData) => {
    const db = readDb();
    const newApartment = { ...apartmentData, id: Date.now().toString() }; 
    db.apartments.push(newApartment);
    writeDb(db);
    return newApartment;
};

// Function to add a user to the database
const addUser = (userData) => {
    const db = readDb();
    const newUser = { ...userData, id: Date.now().toString() }; 
    db.users.push(newUser);
    writeDb(db);
    return newUser;
};

// Function to get all apartments
const getApartments = () => {
    const db = readDb();
    return db.apartments;
};

// Function to get a specific apartment by its ID
const getApartmentById = (id) => {
    const db = readDb();
    return db.apartments.find(apartment => apartment.id === id);
};

// Function to get all users
const getUsers = () => {
    const db = readDb();
    return db.users;
};

// Function to get a specific user by their ID
const getUserById = (id) => {
    const db = readDb();
    return db.users.find(user => user.id === id);
};

const getUserByEmail = (email) => {
    const db = readDb();
    return db.users.find(user => user.email === email);
};


export { initDb, readDb, writeDb, addApartment, addUser, getApartments, getApartmentById, getUsers, getUserById,getUserByEmail };
