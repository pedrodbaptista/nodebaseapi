const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRouters = require('./api/routes/product');
const orderRouters = require('./api/routes/order');
const userRouters = require('./api/routes/user');

mongoose.connect('mongodb://pdbtestdb:' + process.env.MONGO_ATLAS_PW + '@cluster0-shard-00-00-upn4w.mongodb.net:27017,cluster0-shard-00-01-upn4w.mongodb.net:27017,cluster0-shard-00-02-upn4w.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
//make uploads public but the best way is to create a new entry for upload (route)
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    req.header('Access-Control-Allow-Origin', '*');
    req.header(
        "Access-Control-Allow-Header",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === 'OPTIONS')
    {
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

// Routes
app.use('/products', productRouters);

app.use('/orders', orderRouters);

app.use('/users', userRouters);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;