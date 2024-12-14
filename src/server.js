import express from 'express';
import { initDb, addApartment, addUser, getApartments, getApartmentById, getUsers, getUserById,getUserByEmail } from './config/db.js'; // Import DB methods
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const app = express();

app.use(cors()); 
app.use(cors({
    origin: '*',  
}));


app.use(bodyParser.json());



initDb();


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
  

    let isPasswordValid = false;

if (password === user.password) {
  isPasswordValid = true; 
} else {
  isPasswordValid = false;  
}

if (!isPasswordValid) {
  return res.status(401).json({ message: 'Invalid credentials: password is incorrect' });
}
  
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', 
    });
  
    res.status(200).json({ token,
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

    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user.id,
      email: user.email,

    });
  });



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
