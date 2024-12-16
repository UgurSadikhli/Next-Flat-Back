import express from 'express';
import { initDb, addApartment, addUser, getApartments,toggleApartmentForUser, getApartmentById,deleteAnnouncementById, getUsers, getUserById,deleteUserById, getUserByEmail } from './config/db.js'; // Import DB methods
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get the current directory path
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(cors({
    origin: '*',
}));

app.use(bodyParser.json());

// Initialize database
initDb();

// Define a folder for storing uploads
const uploadFolder = path.join(__dirname, 'uploads');

// Ensure upload folder exists before handling file uploads
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder); // Store files in the upload folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique file names
    }
});

const upload = multer({ storage });

// Routes remain unchanged
app.get('/apartments', (req, res) => {
    const apartments = getApartments();
    res.json(apartments);
});

app.get('/apartments/:id', (req, res) => {
    const apartment = getApartmentById(req.params.id);
    if (apartment) {
        res.json(apartment);
    } else {
        res.status(404).json({ message: 'Apartment not found' });
    }
});

app.post('/apartments', (req, res) => {
    const newApartment = addApartment(req.body);
    toggleApartmentForUser(newApartment.author_id, newApartment.id);
   
    res.status(201).json(newApartment);
});

app.get('/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});

app.get('/users/:id', (req, res) => {
    const user = getUserById(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.delete('/users/:id', (req, res) => {
    const user = getUserById(req.params.id);
    deleteUserById(req.params.id);
    
    if (user) {
        res.status(201).json({ message: 'apartment deleted' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.delete('/apartments/:id', (req, res) => {
    const apartment = getApartmentById(req.params.id);
    deleteAnnouncementById(req.params.id);
    toggleApartmentForUser(apartment.author_id, apartment.id);
    
    if (apartment) {
        res.status(201).json({ message: 'apartment deleted' });
    } else {
        res.status(404).json({ message: 'apartment not found' });
    }
});

app.post('/users', (req, res) => {
    const newUser = addUser(req.body);
    res.status(201).json(newUser);
});

const JWT_SECRET = "mySuperSecretKey123!";

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = getUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials name incorrect' });
    }

    let isPasswordValid = password === user.password;

    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials: password is incorrect' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
    });

    res.status(200).json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.profile_image,
        },
    });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
};

app.get('/user-profile', verifyToken, (req, res) => {
    const user = getUsers().find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
        id: user.id,
        email: user.email,
    });
});


app.post('/upload-avatar', verifyToken, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = getUsers().find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Update user's profile with the uploaded avatar URL
    const avatarUrl = `/uploads/${req.file.filename}`;
    user.profile_image = avatarUrl;

    // Save the updated user info in the database
    res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl,
    });
});

// Serve static files in the uploads folder
app.use('/uploads', express.static(uploadFolder));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
