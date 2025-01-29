import express from 'express';
import { initDb, addApartment, addUser, getApartments,toggleApartmentForUser, getApartmentById,deleteAnnouncementById, getUsers, getUserById,deleteUserById, getUserByEmail,updateUser } from './config/db.js'; // Import DB methods
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(cors({
    origin: '*',
}));

app.use(bodyParser.json());


let temporaryOtp = null;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'andrewmart1545@gmail.com', 
        pass: 'chkojvgmrlorkvml'    
    }
});


initDb();


const uploadFolder = path.join(__dirname, 'uploads');
const emailTemplate = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .email-container {
          width: 100%;
          padding: 20px;
          background-color: #ffffff;
          margin: 0;
          box-sizing: border-box;
        }
        .email-header {
          background-color: #D29E00; /* Golden color */
          padding: 20px;
          color: white;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .email-header img {
          max-width: 150px;
          margin-bottom: 20px;
        }
        .email-content {
          padding: 20px;
          font-size: 16px;
        }
        .email-content h2 {
          color: #D29E00; /* Golden color */
          text-align: center;
        }
        .content-section {
          margin-bottom: 20px;
        }
        .content-section label {
          font-weight: bold;
        }
        .content-section p {
          margin: 5px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          margin-top: 40px;
        }
        .footer a {
          color: #D29E00;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="${images[0] || ''}" alt="Company Logo">
          <h1>Announcement for ${title}</h1>
        </div>
        <div class="email-content">
          <h2>Details of Your Property</h2>
          <div class="content-section">
            <label>Title:</label>
            <p>${title}</p>
          </div>
          <div class="content-section">
            <label>Price:</label>
            <p>${price} ${currency}</p>
          </div>
          <div class="content-section">
            <label>Description:</label>
            <p>${description}</p>
          </div>
          <div class="content-section">
            <label>Location:</label>
            <p>${city}, ${country}</p>
          </div>
          <div class="content-section">
            <label>Service Type:</label>
            <p>${serviceType}</p>
          </div>
          <div class="content-section">
            <label>Payment Method:</label>
            <p>${paymentMethod}</p>
          </div>
          <div class="content-section">
            <label>Room Number:</label>
            <p>${roomNumber}</p>
          </div>
          <div class="content-section">
            <label>Area (in sq. meters):</label>
            <p>${kvmAmount}</p>
          </div>
          <div class="content-section">
            <label>Type of Home:</label>
            <p>${typeOfHome}</p>
          </div>
          <div class="content-section">
            <label>Street:</label>
            <p>${street}</p>
          </div>
          <div class="content-section">
            <label>Floor:</label>
            <p>${flour}</p>
          </div>
        </div>
        <div class="footer">
          <p>If you have any questions, don't hesitate to <a href="mailto:support@example.com">contact us</a>.</p>
        </div>
      </div>
    </body>
  </html>
`;


if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: '"Next Flat" <andrewmart1545@gmail.com>',
            to,
            subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
function generateOtpAndSendEmail(newUser) {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  
    // Send the OTP to the user via email
    sendEmail(
        newUser.email,
        'Your OTP for Registration',
        `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f9;
                  padding: 20px;
                  color: #333;
                }
                .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  padding-bottom: 20px;
                }
                .logo {
                  width: 150px;
                  margin-bottom: 20px;
                }
                .content {
                  font-size: 16px;
                  line-height: 1.5;
                  margin-bottom: 20px;
                }
                .otp-code {
                  font-size: 24px;
                  font-weight: bold;
                  color:rgb(210, 158, 0);
                  padding: 10px;
                  border-radius: 5px;
                  background-color:rgba(210, 158, 0, 0.2);
                  display: inline-block;
                  margin-top: 10px;
                }
                .footer {
                  font-size: 14px;
                  text-align: center;
                  color: #888;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="header">
                  <img src="https://via.placeholder.com/150" alt="Company Logo" class="logo"/>
                  <h1 style="color:rgb(210, 158, 0);">Hello ${newUser.name}!</h1>
                </div>
                <div class="content">
                  <p>Thank you for registering with us. To complete your registration, please use the OTP (One-Time Password) provided below.</p>
                  <p><span class="otp-code">${otp}</span></p>
                  <p>This code will expire in 10 minutes, so please enter it promptly.</p>
                  <p>If you didn't request this, please disregard this email.</p>
                </div>
                <div class="footer">
                  <p>Best regards,</p>
                  <p><strong>Next Flat inc.</strong></p>
                  <p><a href="https://nextflat.my/" style="color: #0072e5; text-decoration: none;">Visit our website</a></p>
                </div>
              </div>
            </body>
          </html>
        `
      );
      
  
    return otp; // Return OTP to store temporarily (in memory or database)
  }
const upload = multer({ storage });


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
    const user = getUserById(newApartment.author_id);
    sendEmail(user.email, 'New Property Announcement', emailTemplate);
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

app.post('/register', (req, res) => {
    const newUser = req.body;
   console.log(newUser.email);

    temporaryOtp = generateOtpAndSendEmail(newUser);
 
    res.status(200).json({ message: 'OTP sent to your email. Please enter it to proceed.' });
});
  
app.post('/verify-otp', (req, res) => {
   const { newUser, otp } = req.body;
  
if (temporaryOtp == otp) {
      console.log(newUser);
      const userData = addUser(newUser);
      res.status(201).json(userData);
} else {
    res.status(400).json({ message: 'Invalid OTP. Please try again.' });
}
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
            surname:user.surname,
            age:user.age,
            phone_num:user.phone_num,
            fav_apartments:user.fav_apartments
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

    
    const avatarUrl = `/uploads/${req.file.filename}`;
    user.profile_image = avatarUrl;


    res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl,
    });
});

app.put('/update-users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = updateUser(id, updates);
    if (updatedUser) {
        res.status(200).json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Serve static files in the uploads folder
app.use('/uploads', express.static(uploadFolder));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
