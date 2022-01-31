// =======================================
//              DEPENDENCIES
// =======================================
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require("firebase-admin");
// =======================================
//         INITIALIZE EXPRESS APP
// =======================================
const app = express();
// =======================================
//        CONFIGURE SERVER SETTING
// =======================================
require('dotenv').config();
// =======================================
//       EXPOSE OUR CONFIG VARIABLES
// =======================================
const { MONGODB_URL, PORT = 4000, GOOGLE_CREDENTIALS } = process.env;

const serviceAccount = JSON.parse(GOOGLE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// =======================================
//           DATABASE CONNECTION
// =======================================
mongoose.connect(MONGODB_URL);
// =======================================
//    DATABASE CONNECTION ERROR/SUCCESS
// =======================================
const db = mongoose.connection;
db.on('connected', () => console.log('Connected to MongoDB'));
db.on('disconnected', () => console.log('Disconnected from MongoDB'));
db.on('error', (err) => console.log('MongoDB Error: ' + err.message));
// =======================================
//           SET UP PEOPLE MODEL
// =======================================
const peopleSchema = new mongoose.Schema({
    name: String,
    image: String,
    title: String,
    uid: String
}, { timestamps: true });

const People = mongoose.model('People', peopleSchema);
// =======================================
//               MIDDLEWARE
// =======================================
app.use(express.json()); // this creates req.body using incoming JSON from our req's
app.use(morgan('dev'));
app.use(cors());

app.use(async function(req, res, next) {
    try {
        const token = req.get('Authorization');
        if(!token) return next();

        const user = await admin.auth().verifyIdToken(token.replace("Bearer ", ""));
        if(!user) throw new Error('Something went wrong');

        req.user = user;
        next();

    } catch (error) {
        res.status(400).json(error);
    }
});

function isAuthenticated(req, res, next) {
    if(!req.user) return res.status(401).json({message: 'you must be logged in first'})
    next();
}

// =======================================
//               TEST ROUTE
// =======================================
app.get('/', (req, res) => {
    res.send('welcome to the people api');
});
// =======================================
//                 ROUTES
// =======================================
// INDEX
app.get('/people', isAuthenticated, async (req, res) => {
    try {
        res.json(await People.find({uid: req.user.uid}));
    } catch (error) {
        res.status(400).json(error);
    }
});
// CREATE
app.post('/people', isAuthenticated, async (req, res) => {

    try {
        req.body.uid = req.user.uid;
        res.json(await People.create(req.body));
    } catch (error) {
        res.status(400).json(error);
    }
});
// UPDATE
app.put('/people/:id', async (req, res) => {
    try {
        res.json(await People.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }));
    } catch (error) {
        res.json(400).json(error);
    }
});
// DELETE
app.delete('/people/:id', async (req, res) => {
    try {
        res.json(await People.findByIdAndDelete(req.params.id))
    } catch (error) {
        res.json(400).json(error);
    }
});
// =======================================
//              APP LISTENER
// =======================================
app.listen(PORT, () => {
    console.log(`Express is listening on port: ${PORT}`);
});