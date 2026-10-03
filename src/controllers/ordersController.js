const OrderInfo = require('../models/OrderInfo');
const Product = require('../models/Product');
const multer = require('multer');
const { processCsvData } = require('../routes/loader');
const path = require('path');

let lastUpdatedDate = 'Never';

const storageCSV = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../models/data/'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadCSV = multer({ storage: storageCSV });

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const { sort, fulfillmentStatus, orderedFrom, paymentStatus, startDate, endDate } = req.query;

        // Build filter object
        let filter = {};
        if (fulfillmentStatus) {
            filter.fulfillmentStatus = fulfillmentStatus;
        }
        if (orderedFrom) {
            filter.orderedFrom = orderedFrom;
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (startDate || endDate) {
            filter.dateCreated = {};
            if (startDate) {
                filter.dateCreated.$gte = new Date(startDate).setHours(0, 0, 0, 0); // Start of the day
            }
            if (endDate) {
                filter.dateCreated.$lte = new Date(endDate).setHours(23, 59, 59, 999); // End of the day
            }
        }

        console.log('Filter:', filter);

        // Build sort object
        let sortOrder = { };
        if (sort) {
            if (sort === 'ordernumascending') {
                sortOrder.orderNumber = 1;
            } else if (sort === 'ordernumdescending') {
                sortOrder.orderNumber = -1;
            } else if (sort === 'orderdatelatest') {
                sortOrder.dateCreated = -1;
            } else if (sort === 'orderdateearliest') {
                sortOrder.dateCreated = 1;
            }
        }
        else {
            sortOrder.dateCreated = -1;
        }

        const totalOrders = await OrderInfo.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await OrderInfo.find(filter).sort(sortOrder).skip(skip).limit(limit).lean();
        console.log('Orders:', orders);

        const nextPage = page < totalPages ? page + 1 : null;

        console.log('Total Pages:', totalPages);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                orders,
                currentPage: page,
                totalPages, // Ensure totalPages is included in the response
            });
        } else {
            res.render('orders', {
                orders: JSON.stringify(orders),
                currentPage: page,
                totalPages,
                nextPage,
                lastUpdatedDate: new Date(), // Assuming this needs to be the current date
                "grid-add-button": "Order",
                "grid-title": "ORDERS"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

async function addOrder(req, res) {
    const { orderNo, date, totalOrderQuantity, items, paymentStatus, paymentMethod, fulfillmentStatus, orderedFrom, shippingRate, totalPrice } = req.body;

    const newOrder = new OrderInfo({
        orderNumber: orderNo,
        dateCreated: date,
        totalOrderQuantity: totalOrderQuantity,
        items: items,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        shippingRate: shippingRate,
        total: totalPrice,
        fulfillmentStatus: fulfillmentStatus,
        orderedFrom: orderedFrom
    });

    try {
        await newOrder.save();

        // Deduct inventory for each product in the order
        for (const item of items) {
            console.log(`Updating inventory for SKU: ${item.SKU}, Variation: ${item.variant}, Quantity: ${item.quantity}`);
            const product = await Product.findOneAndUpdate(
                { SKU: item.SKU, "variations.variation": item.variant },
                { $inc: { "variations.$.stocks": -item.quantity } },
                { new: true }
            );

            if (!product) {
                console.error(`Product with SKU: ${item.SKU} and Variation: ${item.variation} not found`);
            } else {
                console.log(`Updated product inventory: ${product}`);
            }
        }

        res.send({ success: true, message: 'Order added successfully' });
    } catch (err) {
        console.error("Error in add order: " + err);
        res.status(500).send('Server Error');
    }
}


const uploadCSVFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const csvFilePath = path.join(__dirname, '../models/data/', req.file.filename);
    try {
        const processedData = await processCsvData(csvFilePath);
        console.log('Processed Data:', processedData);

        // Verify processedData is an array
        if (!Array.isArray(processedData)) {
            console.error('Error: Processed data is not an array');
            throw new Error('Processed data is not an array');
        }
        
        lastUpdatedDate = new Date().toLocaleString();

        console.log('Processed CSV Data:', processedData);

        // Assuming processCsvData returns an array of orders
        for (let order of processedData) {
            console.log(`Updating inventory for order ID: ${order._id}, Fulfillment Status: ${order.fulfillmentStatus}`);
            await updateInventoryBasedOnFulfillmentStatus(order._id, order.fulfillmentStatus);
        }

        res.status(200).json({ message: 'File uploaded, processed, and inventory updated successfully.' });
    } catch (error) {
        console.error('Error processing CSV file:', error);
        res.status(500).json({ message: 'Error processing CSV file: ' + error.message });
    }
};

async function getAnOrder(req, res) {
    const orderId = req.params.id;
    const orderIdStr = orderId.toString();
    console.log(orderIdStr);

    try {
        let order = await OrderInfo.find({'orderNumber': orderId}).lean();
        order = order[0];
        // console.log(order);
        // res.send(order);
        for (let item of order.items) {

            item.itemName = item.itemName.replaceAll('"', '');
            let product = await Product.findOne({"SKU": item.sku});
            // console.log(product);
            if(product !== null){
                item.picture = product.picture;
            }
        }

        console.log(order);
        res.send(order);


    }   catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function checkOrderNo(req, res) {
    const orderNo = req.query.orderNo;
    try {
        const existingOrder = await OrderInfo.findOne({ orderNumber: orderNo });
        if (existingOrder) {
            res.json({ success: false, message: 'Order Number is already taken.' });
            console.log("Order Number is already taken.");
        } else {
            res.json({ success: true, message: 'Order Number is available.' });
        }
    } catch (err) {
        console.error('Error checking order number:', err);
        res.status(500).json({ success: false, message: 'Server error while checking order number.' });
    }
}

const updateInventoryBasedOnFulfillmentStatus = async (orderId, fulfillmentStatus) => {
    try {
        // Fetch the order
        const order = await OrderInfo.findById(orderId).lean();
        if (!order) {
            console.error('Order not found');
            return;
        }

        console.log(`Order found: ${JSON.stringify(order, null, 2)}`);
        const orderDate = new Date(order.dateCreated);

        for (const item of order.items) {
            console.log(`Processing SKU: ${item.sku}, Variation: ${item.variant}, Quantity: ${item.quantity}`);

            // Fetch the product based on SKU
            const product = await Product.findOne({ SKU: item.sku }).lean();
            if (!product) {
                console.error(`Product with SKU: ${item.sku} not found`);
                continue;
            }

            console.log(`Product found: ${JSON.stringify(product, null, 2)}`);
            const lastInventoryUpdate = new Date(product.lastInventoryUpdate);

            if (orderDate <= lastInventoryUpdate) {
                console.log(`Order date ${orderDate} is before or on the last inventory update date ${lastInventoryUpdate}. Skipping inventory update.`);
                continue;
            }

            // Clean and preprocess text for variation comparison
            const cleanVariant = item.variant.toLowerCase().replace(/^(size:|variation:)/, '').trim();
            console.log(`Cleaned variant: ${cleanVariant}`);

            const variation = product.variations.find(v => v.variation.trim().toLowerCase() === cleanVariant);

            if (!variation) {
                console.error(`Variation ${item.variant} not found for SKU ${item.sku}`);
                continue;
            }

            let updateQuantity = 0;
            const normalizedFulfillmentStatus = fulfillmentStatus.toLowerCase();
            if (normalizedFulfillmentStatus === 'fulfilled') {
                updateQuantity = -item.quantity;
                console.log(`Decreasing inventory for SKU: ${item.sku}, Variation: ${item.variant} by ${item.quantity} through order ${orderId}`);
            } else if (normalizedFulfillmentStatus === 'cancelled') {
                updateQuantity = item.quantity;
                console.log(`Increasing inventory for SKU: ${item.sku}, Variation: ${item.variant} by ${item.quantity} through order ${orderId}`);
            } else if (normalizedFulfillmentStatus === 'unfulfilled') {
                console.log(`No change in inventory for SKU: ${item.sku}, Variation: ${item.variant} as fulfillment status is unfulfilled through order ${orderId}`);
                continue;
            }

            // Check if the update will result in negative stock
            if (variation.stocks + updateQuantity < 0) {
                console.error(`Cannot update inventory for SKU: ${item.sku}, Variation: ${item.variant}. Insufficient stock.`);
                continue;
            }

            // Update the variation stock
            variation.stocks += updateQuantity;
            const currentDateTime = new Date();

            // Prepare updates object
            const updates = {
                variations: product.variations,
                //lastInventoryUpdate: currentDateTime,
            };

            try {
                // Find the product by ID and update its details
                const updatedProduct = await Product.findByIdAndUpdate(product._id, updates, { new: true });

                if (!updatedProduct) {
                    console.error('No document matched or no modification was made.');
                } else {
                    console.log('Update successful:', JSON.stringify(updatedProduct, null, 2));
                }
            } catch (err) {
                console.error('Update failed:', err);
            }

            console.log({
                _id: product._id,
                'variations.variation': item.variant
            });

            console.log({
                'variations.$.stocks': variation.stocks,
                lastInventoryUpdate: currentDateTime
            });

            console.log(`Inventory updated for SKU: ${item.sku}, Variation: ${item.variant}, New Stocks: ${variation.stocks}`);
            console.log(`Product last updated date set to: ${currentDateTime}`);
        }

        console.log('Inventory update completed.');
    } catch (err) {
        console.error('Error updating inventory based on fulfillment status:', err);
    }
};

module.exports = { updateInventoryBasedOnFulfillmentStatus, getOrders, getAnOrder, uploadCSVFile, addOrder, uploadCSV, checkOrderNo };
