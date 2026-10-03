const mongoose = require('mongoose');

const orderInfoSchema = new mongoose.Schema({
    orderNumber: String,
    dateCreated: Date,
    // time: String,
    // fulfillBy: String,
    totalOrderQuantity: Number,
    // contactEmail: String,
    items: [{
        itemName: String,
        variant: String,
        sku: String,
        quantity: Number,
        // quantityRefunded: Number,
        price: Number,
        // weight: Number,
        // customText: String,
        // depositAmount: Number,
        // deliveryTime: String
    }],
    paymentStatus: String,
    paymentMethod: String,
    // couponCode: String,
    // giftCardAmount: Number,
    shippingRate: Number,
    // totalTax: Number,
    total: Number,
    // currency: String,
    // refundedAmount: Number,
    // netAmount: Number,
    // additionalFees: Number,
    fulfillmentStatus: String,
    // trackingNumber: String,
    // fulfillmentService: String,
    // deliveryMethod: String,
    // shippingLabel: String,
    orderedFrom: String
}, { collection: 'orderInfo' });

module.exports = mongoose.model('OrderInfo', orderInfoSchema);
