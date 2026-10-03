const Expense = require('../models/Expense');
const Collection = require('../models/AbstrakCol');


const getPaginatedExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const filter = await buildExpenseFilter(req.query);
        const sortOrder = buildSortOrder(req.query.sort);

        console.log('Filter object:', JSON.stringify(filter));
        console.log('Sort order:', JSON.stringify(sortOrder));

        const totalExpenses = await Expense.countDocuments(filter);
        console.log(`Total expenses count: ${totalExpenses}`);
        
        const totalPages = Math.ceil(totalExpenses / limit);
        console.log(`Total pages: ${totalPages}`);

        const expenses = await Expense.find(filter).sort(sortOrder).skip(skip).limit(limit).lean();
        console.log('Retrieved expenses:', JSON.stringify(expenses, null, 2));

        const nextPage = page < totalPages ? page + 1 : null;
        console.log(`Current page: ${page}, Next page: ${nextPage}`);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                expenses,
                currentPage: page,
                totalPages, // Ensure totalPages is included in the response
            });
        } else {
            res.render('expenses', {
                expenses: JSON.stringify(expenses),
                currentPage: page,
                totalPages,
                nextPage,
                lastUpdatedDate: new Date(), // Assuming this needs to be the current date
                "grid-add-button": "Expense",
                "grid-title": "EXPENSES"
            });
        }
    } catch (err) {
        console.error('Error fetching paginated expenses:', err);
        res.status(500).send('Server Error');
    }
};


// Function to get all collections
const getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.find({}).lean();
        res.json(collections);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.render('expenses', { expenses });
    } catch (err) {
        res.status(500).send(err);
    }
};

const buildExpenseFilter = async (query) => {
    const { sort, paymentMethod, collection, category, startDate, endDate, quantityType, quantityValue } = query;

    let filter = {}; // Use 'let' to allow modifications
    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
        console.log(`Filter by paymentMethod: ${paymentMethod}`);
    }
    if (collection) {
        filter.collectionName = collection;
        console.log(`Filter by collection: ${collection}`);
    }
    if (category) {
        filter.category = category;
        console.log(`Filter by category: ${category}`);
    }
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            filter.date.$gte = new Date(startDate).setHours(0, 0, 0, 0); // Start of the day
            console.log(`Filter by startDate: ${new Date(startDate).toISOString()}`);
        }
        if (endDate) {
            filter.date.$lte = new Date(endDate).setHours(23, 59, 59, 999); // End of the day
            console.log(`Filter by endDate: ${new Date(endDate).toISOString()}`);
        }
    }
    if (quantityType && quantityValue) {
        const parsedQuantityValue = parseInt(quantityValue, 10); // Ensure quantityValue is an integer
        switch (quantityType) {
            case 'lower':
                filter.quantity = { $lt: parsedQuantityValue };
                console.log(`Filter by quantity lower than: ${parsedQuantityValue}`);
                break;
            case 'higher':
                filter.quantity = { $gt: parsedQuantityValue };
                console.log(`Filter by quantity higher than: ${parsedQuantityValue}`);
                break;
            case 'equal':
                filter.quantity = { $eq: parsedQuantityValue };
                console.log(`Filter by quantity equal to: ${parsedQuantityValue}`);
                break;
            default:
                break;
        }
    }

    console.log('Final filter object:', filter);
    return filter;
};


const buildSortOrder = (sort) => {
    let sortOrder = {};
    if (sort) {
        if (sort === 'amountasc') {
            sortOrder.amount = 1;
            console.log('Sorting by amount ascending');
        } else if (sort === 'amountdesc') {
            sortOrder.amount = -1;
            console.log('Sorting by amount descending');
        } else if (sort === 'dateasc') {
            sortOrder.date = 1;
            console.log('Sorting by date ascending');
        } else if (sort === 'datedesc') {
            sortOrder.date = -1;
            console.log('Sorting by date descending');
        }
    } else {
        sortOrder.date = -1; // Default sort by date in descending order
        console.log('Default sorting by date descending');
    }

    return sortOrder;
};

const getExpense = async (req, res) => {
    const expenseId = req.params.id;
    console.log(`Received request to get expense with ID: ${expenseId}`);

    try {
        let expense = await Expense.findById(expenseId).lean();
        
        if (!expense) {
            console.log(`Expense with ID: ${expenseId} not found.`);
            return res.status(404).send('Expense not found');
        }

        console.log(`Expense retrieved: ${JSON.stringify(expense)}`);
        res.send(expense);
    } catch (err) {
        console.error(`Error retrieving expense with ID: ${expenseId}`, err);
        res.status(500).send('Server Error');
    }
};
const addExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!expense) {
            return res.status(404).send();
        }
        res.send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).send();
        }
        res.send(expense);
    } catch (err) {
        res.status(500).send(err);
    }
};

const fetchExpenseGraphs = async (req, res) => {
    try {
        // Fetch all expenses
        const expenses = await Expense.find({}).lean();
        console.log('All Expenses:', expenses);

        // Perform the aggregation for expenses by category
        const expenseAggregations = await Expense.aggregate([
            { $project: {
                category: 1,
                totalCost: { $multiply: ['$amount', '$quantity'] }
            }},
            { $group: {
                _id: '$category',
                totalAmount: { $sum: '$totalCost' }
            }},
            { $project: {
                _id: 0,
                category: '$_id',
                totalAmount: 1
            }},
            { $sort: { totalAmount: -1 } }
        ]);

        console.log('Expenses by Category:', expenseAggregations);

        // Perform the aggregation for expenses by collection and category
        const collectionAggregations = await Expense.aggregate([
            { $project: {
                collectionName: 1,
                category: 1,
                totalCost: { $multiply: ['$amount', '$quantity'] }
            }},
            { $group: {
                _id: { collectionName: '$collectionName', category: '$category' },
                totalAmount: { $sum: '$totalCost' }
            }},
            { $project: {
                _id: 0,
                collectionName: '$_id.collectionName',
                category: '$_id.category',
                totalAmount: 1
            }},
            { $sort: { collectionName: 1, totalAmount: -1 } }
        ]);

        console.log('Expenses by Collection and Category:', collectionAggregations);

        res.json({ expenseAggregations, collectionAggregations });
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).send('Internal Server Error');
    }
}

// No need for date range helper function since we are fetching all data




module.exports = {
    getPaginatedExpenses,
    getAllCollections,
    getAllExpenses,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchExpenseGraphs
};
