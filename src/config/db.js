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



const toggleApartmentForUser = (userId, apartmentId) => {
    const db = readDb(); // Чтение базы данных
    if (!db) {
        console.error('Failed to load database');
        return false;
    }

    // Ищем пользователя
    const userIndex = db.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        console.error(`User with ID ${userId} not found`);
        return false;
    }

    // Проверяем наличие массива apartment_ids
    const user = db.users[userIndex];
    if (!Array.isArray(user.apartment_ids)) {
        user.apartment_ids = []; // Инициализация, если массива нет
    }

    // Если apartmentId уже есть, удаляем его, иначе добавляем
    if (user.apartment_ids.includes(apartmentId)) {
        // Удаление apartmentId
        user.apartment_ids = user.apartment_ids.filter(id => id !== apartmentId);
        console.log(`Apartment ID ${apartmentId} removed from user ID ${userId}`);
    } else {
        // Добавление apartmentId
        user.apartment_ids.push(apartmentId);
        console.log(`Apartment ID ${apartmentId} added to user ID ${userId}`);
    }

    // Пытаемся записать изменения
    const success = writeDb(db);
    if (!success) {
        console.error('Failed to write to database');
        return false;
    }

    return true;
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

const deleteUserById = (id) => {
    const db = readDb(); 
    const userIndex = db.users.findIndex(user => user.id === id);
  
    if (userIndex === -1) {
      console.log('User not found');
      return false; 
    }
  
    db.users.splice(userIndex, 1);
  
    writeDb(db);
  
    console.log(`User with ID ${id} has been deleted`);
    return true; 
  };

  const deleteAnnouncementById = (id) => {
    const db = readDb(); 
    const announcementIndex = db.apartments.findIndex(apartment => apartment.id === id);
  
    if (announcementIndex === -1) {
      console.log('apartment not found');
      return false; 
    }
  
    db.apartments.splice(announcementIndex, 1);
  
    writeDb(db);
  
    console.log(`apartment with ID ${id} has been deleted`);
    return true; 
  };


const getUserByEmail = (email) => {
    const db = readDb();
    return db.users.find(user => user.email === email);
};


  

export { initDb, readDb, writeDb, addApartment,toggleApartmentForUser, addUser,deleteAnnouncementById, getApartments, getApartmentById, getUsers, getUserById,getUserByEmail,deleteUserById };
