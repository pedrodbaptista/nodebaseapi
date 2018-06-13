const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer'); 
const checkAuth = require('../middleware/check_auth');

const ProductController = require('../controllers/product');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalName);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else { 
        // it can be with a message like
        // cb(new Error('some message'), false);
        cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter
});

router.get('/', ProductController.getAll);

router.post('/', checkAuth, upload.single('productImage'), ProductController.create);

router.get('/:productId', ProductController.getById);

router.patch('/:productId', checkAuth, ProductController.update)

router.delete('/:productId', checkAuth, ProductController.delete);

module.exports = router;