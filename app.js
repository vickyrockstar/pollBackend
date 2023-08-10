const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HttpError = require('./models/http-error');
const userRoutes = require('./routes/user-route');
const pollRoutes = require('./routes/poll-route');
const app = express();
var cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
/* app.options('/api/*', cors());
app.options('/api/*', (req, res) => {
    res.status(200).send(); // Respond with a 200 status for preflight requests
  }); */
app.use('/api/user', userRoutes);
app.use('/api/poll', pollRoutes);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.use((req, res, next) => {
    const error = new HttpError("could not find this route", 404);
    console.log(error)
    throw error;
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || "Unknown error occured" })
});

mongoose.connect('mongodb+srv://Chetana:chetanamj123@atlascluster.kgkrn95.mongodb.net/poll?retryWrites=true&w=majority')
    .then(() => { app.listen(process.env.PORT ); console.log("Server is up and connected to MongoDb") })
    .catch(err => { console.log(err) }) 
