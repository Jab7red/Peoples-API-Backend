// =======================================
//              DEPENDENCIES
// =======================================
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
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
const { MONGODB_URL, PORT = 4000 } = process.env;
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
//               MIDDLEWARE
// =======================================
app.use(express.json()); // this creates req.body using incoming JSON from our req's
app.use(morgan('dev'));
app.use(cors());
// =======================================
//               TEST ROUTE
// =======================================
app.get('/', (req, res) => {
    res.send('welcome to the people api');
});
// =======================================
//              APP LISTENER
// =======================================
app.listen(PORT, () => {
    console.log(`Express is listening on port: ${PORT}`);
});