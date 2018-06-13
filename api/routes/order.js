const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .exec()
        .then(docs => {
            console.log(docs);
            const response = {
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        product: doc.product,
                        quantity: doc.quantity,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
        });
        return order
            .save()
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Create order successfully',
            createdOrder: {
                _id: result._id,
                product: result.productId,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('product quantity _id')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc){
                res.status(200).json({
                    order: doc,
                    request: {
                        type: 'GET',
                        description: 'Get all orders',
                        url: 'http://localhost:3000/orders'
                    }
                });
            } else {
                res.status(404).json({message: 'No valid entry for provided id'})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/',
                    data: {
                        product: 'ObjectId',
                        quantity: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;