const Voucher = require('../models/Voucher');

const getVouchers = async (req, res) => {
    const { code, orderDate } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'Voucher code is required' });
    }
    if (!orderDate) {
        return res.status(400).json({ error: 'Order date is required' });
    }

    console.log('Voucher Code:', code);
    console.log('Order Date:', orderDate);

    try {
        const voucher = await Voucher.findOne({ code: code.trim() });
        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }

        const orderDateObj = new Date(orderDate);
        if (orderDateObj < new Date(voucher.startDate) || orderDateObj > new Date(voucher.expirationDate)) {
            return res.status(400).json({ error: 'Voucher is not valid for the given order date' });
        }

        res.json(voucher);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}


module.exports = { getVouchers };