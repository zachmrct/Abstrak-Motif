const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true},
    collectionName: { type: String, required: true},
    date: {type: Date,required: true},
    amount: {type: Number,required: true},
    quantity: {type: Number,required: true},
    paymentMethod: {type: String,required: true},
    category: { type: String, required: true},
    description: {type: String,required: true},
    receiptUrl: {type: String,required: false}
});

module.exports = mongoose.model('Expense', expenseSchema);
