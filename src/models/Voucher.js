const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true }
});

module.exports = mongoose.model('Voucher', voucherSchema);