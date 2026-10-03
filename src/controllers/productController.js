const Product = require('../models/Product');
const AbstrakCol = require('../models/AbstrakCol');
const OrderInfo = require('../models/OrderInfo');
const { addProductToCollection } = require('./collectionControllers');

async function fetchProductData(req, res) {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId).lean();
        if (!product) {
            console.log("Product not found");
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log("Fetched Product:", JSON.stringify(product, null, 2));

        const cleanedProductName = product.name.replace(/"/g, '').toLowerCase();
        console.log("Cleaned Product Name:", cleanedProductName);

        const orderAggregations = await OrderInfo.aggregate([
            { $unwind: '$items' },
            { $project: {
                cleanedItemName: { $toLower: { $replaceAll: { input: '$items.itemName', find: '"', replacement: '' } } },
                itemName: '$items.itemName',
                variant: '$items.variant',
                quantity: '$items.quantity',
                quantityRefunded: '$items.quantityRefunded'
            }},
            { $match: { cleanedItemName: cleanedProductName }},
            { $group: {
                _id: '$variant',
                totalSold: { $sum: '$quantity' },
                totalRefunded: { $sum: '$quantityRefunded' },
                netSold: { $sum: { $subtract: ['$quantity', '$quantityRefunded'] }}
            }},
            { $project: {
                _id: 0,
                variant: '$_id',
                totalSold: 1,
                totalRefunded: 1,
                netSold: 1
            }}
        ]);

        console.log("Order Aggregations:", JSON.stringify(orderAggregations, null, 2));

        const soldPerVariation = {};

        const variationMap = orderAggregations.reduce((map, agg) => {
            const variantKey = agg.variant.toLowerCase().replace(/^(size:|variation:)/, '').trim();
            map[variantKey] = agg;
            return map;
        }, {});

        console.log("Variation Map:", JSON.stringify(variationMap, null, 2));

        product.variations.forEach(variation => {
            const variationKey = variation.variation.trim().toLowerCase();
            const agg = variationMap[variationKey] || { totalSold: 0, totalRefunded: 0, netSold: 0 };
            variation.totalSold = agg.totalSold;
            variation.totalRefunded = agg.totalRefunded;
            variation.netSold = agg.netSold;
            soldPerVariation[variation.variation] = agg.totalSold;
            console.log(`Variation: ${variation.variation}, Total Sold: ${variation.totalSold}`);
        });

        console.log("Sold Per Variation:", JSON.stringify(soldPerVariation, null, 2));

        res.json(product);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function checkStock (req, res) {
    const items = req.body.items;
    console.log(items);

    try {
        const stockIssues = [];
        for (const item of items) {

            const product = await Product.findById(item._id);
            console.log(product);
            if (!product) {
                stockIssues.push({ itemId: item._id, message: 'Product not found' });
            } else {
                console.log(`variant: ${item.variant}`);
                console.log(`Product variations: ${JSON.stringify(product.variations)}`);
                console.log(product.variations);

                const trimmedVariant = item.variant.trim();
                
                let variation = null;
                for (const v of product.variations) {
                    console.log(v.get('variation'));
                    if (v.get('variation') === trimmedVariant) {
                        variation = v;
                        break;
                    }
                }

                if (!variation) {
                    stockIssues.push({ itemId: item._id, message: `Variation ${item.variant} not found` });
                } else if (item.quantity > variation.get('stocks')) {
                    stockIssues.push({ itemId: item._id, message: `Insufficient stock for variation ${item.variant}` });
                }
            }
        }

        if (stockIssues.length > 0) {
            res.json({ success: false, stockIssues: stockIssues });
        } else {
            res.json({ success: true });
        }
    } catch (err) {
        console.error('Error checking stock:', err);
        res.status(500).json({ success: false, message: 'Server error while checking stock.' });
    }
}

async function fetchProductMetrics(req, res) {
    try {
        const productId = req.params.id;
        console.log("Product ID:", productId);

        const product = await Product.findById(productId).lean();
        if (!product) {
            console.log("Product not found");
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log("Fetched Product:", JSON.stringify(product, null, 2));

        const cleanedProductName = product.name.replace(/"/g, '').toLowerCase();
        console.log("Cleaned Product Name:", cleanedProductName);

        const orderAggregations = await OrderInfo.aggregate([
            { $unwind: '$items' },
            { $project: {
                cleanedItemName: { $toLower: { $replaceAll: { input: '$items.itemName', find: '"', replacement: '' } } },
                itemName: '$items.itemName',
                variant: '$items.variant',
                quantity: '$items.quantity',
                quantityRefunded: '$items.quantityRefunded'
            }},
            { $match: { cleanedItemName: cleanedProductName }},
            { $group: {
                _id: '$variant',
                totalSold: { $sum: '$quantity' },
                totalRefunded: { $sum: '$quantityRefunded' },
                netSold: { $sum: { $subtract: ['$quantity', '$quantityRefunded'] }}
            }},
            { $project: {
                _id: 0,
                variant: '$_id',
                totalSold: 1,
                totalRefunded: 1,
                netSold: 1
            }}
        ]);

        console.log("Order Aggregations:", JSON.stringify(orderAggregations, null, 2));

        const soldPerVariation = {};

        const variationMap = orderAggregations.reduce((map, agg) => {
            const variantKey = agg.variant.toLowerCase().replace(/^(size:|variation:)/, '').trim();
            map[variantKey] = agg;
            return map;
        }, {});

        console.log("Variation Map:", JSON.stringify(variationMap, null, 2));

        product.variations.forEach(variation => {
            const variationKey = variation.variation.trim().toLowerCase();
            const agg = variationMap[variationKey] || { totalSold: 0, totalRefunded: 0, netSold: 0 };
            variation.totalSold = agg.totalSold;
            variation.totalRefunded = agg.totalRefunded;
            variation.netSold = agg.netSold;
            soldPerVariation[variation.variation] = agg.totalSold;
            console.log(`Variation: ${variation.variation}, Total Sold: ${variation.totalSold}, Total Refunded: ${variation.totalRefunded}, Net Sold: ${variation.netSold}`);
        });

        const metrics = calculateMetrics(product, soldPerVariation);
        console.log("Product Metrics:", JSON.stringify(metrics, null, 2));

        res.json({ product, metrics });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
}

function calculateMetrics(product, soldPerVariation) {
    const costPrice = calculateAverageManufacturingCost(product.variations);
    const initialInventory = calculateInitialInventory(product.variations);
    const sellingPrice = product.price || 0;
    const totalSold = Object.values(soldPerVariation).reduce((sum, sold) => sum + sold, 0);
    const totalSalesAmount = totalSold * sellingPrice;
    const totalCost = initialInventory * costPrice;
    const grossProfit = (sellingPrice - costPrice) * totalSold;
    const returnRate = calculateRateOfReturn(initialInventory, totalSalesAmount, costPrice);
    const profitMargin = (grossProfit / totalSalesAmount) * 100;
    const remainingInventory = initialInventory - totalSold;

    return {
        totalSold,
        totalSalesAmount: totalSalesAmount || 0,
        sellingPrice,
        costPrice: costPrice || 0,
        totalCost: totalCost || 0,
        grossProfit: grossProfit || 0,
        returnRate: returnRate || 0,
        profitMargin: profitMargin || 0,
        initialInventory,
        remainingInventory
    };
}


function calculateAverageManufacturingCost(variations) {
    let totalCost = 0;
    let count = 0;

    variations.forEach(variation => {
        console.log(`Variation: ${JSON.stringify(variation, null, 2)}`);
        if (variation.manufacturingCost !== undefined) {
            totalCost += variation.manufacturingCost;
            count++;
        }
    });

    console.log(`Total Manufacturing Cost: ${totalCost}, Count: ${count}`);

    if (count === 0) return 0;
    return totalCost / count;
}

function calculateInitialInventory(variations) {
    let totalInitialInventory = 0;

    variations.forEach(variation => {
        const initialStock = variation.stocks || 0;
        const totalSold = variation.totalSold || 0;

        const initialInventory = initialStock + totalSold;
        totalInitialInventory += initialInventory;

        console.log(`Variation: ${variation.variation}, Initial Inventory: ${initialInventory}`);
    });

    console.log(`Total Initial Inventory: ${totalInitialInventory}`);

    return totalInitialInventory;
}

function calculateRateOfReturn(initialInventory, totalSalesAmount, costPrice) {
    // Ensure no negative values are allowed
    if (initialInventory < 0 || totalSalesAmount < 0 || costPrice < 0) {
        throw new Error("Negative values are not allowed.");
    }

    const initialInvestment = initialInventory * costPrice;
    const netGain = totalSalesAmount - initialInvestment;

    // Handle division by zero
    if (initialInvestment === 0) return 0;

    return (netGain / initialInvestment) * 100;
}

async function fetchProductGraphs(req, res) {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId).lean();
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cleanedProductName = product.name.replace(/"/g, '').toLowerCase();
        console.log('cleanedProductName:', cleanedProductName);

        const orderAggregations = await OrderInfo.aggregate([
            { $unwind: '$items' },
            { $project: {
                cleanedItemName: { $toLower: { $replaceAll: { input: '$items.itemName', find: '"', replacement: '' } } },
                itemName: '$items.itemName',
                variant: '$items.variant',
                quantity: '$items.quantity',
                quantityRefunded: '$items.quantityRefunded',
                sellingPrice: '$items.price',
                costPrice: '$items.costPrice',
                dateCreated: '$dateCreated'
            }},
            { $match: { cleanedItemName: cleanedProductName }},
            { $group: {
                _id: { variant: '$variant', dateCreated: { $dateToString: { format: "%Y-%m", date: "$dateCreated" } } },
                totalSold: { $sum: '$quantity' },
                totalRefunded: { $sum: '$quantityRefunded' },
                netSold: { $sum: { $subtract: ['$quantity', '$quantityRefunded'] }},
                sellingPrice: { $first: '$sellingPrice' }, // Updated this line
                costPrice: { $first: '$costPrice' }, // Updated this line
                dateCreated: { $first: '$dateCreated' }
            }},
            { $project: {
                _id: 0,
                variant: '$_id.variant',
                totalSold: 1,
                totalRefunded: 1,
                netSold: 1,
                sellingPrice: 1, // Added this line
                costPrice: 1, // Added this line
                dateCreated: 1
            }},
            { $sort: { dateCreated: 1 } } // Sort by date for trend analysis
        ]);

        console.log('orderAggregations:', orderAggregations);

        const soldPerVariation = {};
        const variationMap = orderAggregations.reduce((map, agg) => {
            const variantKey = agg.variant.toLowerCase().replace(/^(size:|variation:)/, '').trim();
            map[variantKey] = agg;
            return map;
        }, {});

        console.log('variationMap:', variationMap);

        product.variations.forEach(variation => {
            const variationKey = variation.variation.trim().toLowerCase();
            const agg = variationMap[variationKey] || { totalSold: 0, totalRefunded: 0, netSold: 0, dateCreated: [], sellingPrice: 0, costPrice: 0 };
            variation.totalSold = agg.totalSold;
            variation.totalRefunded = agg.totalRefunded;
            variation.netSold = agg.netSold;
            soldPerVariation[variation.variation] = agg.totalSold;
        });

        console.log('product variations after processing:', product.variations);
        console.log('soldPerVariation:', soldPerVariation);

        const metrics = calculateMetrics(product, soldPerVariation);
        console.log('metrics:', metrics);

        const trendData = calculateTrendData(orderAggregations, metrics.sellingPrice, metrics.costPrice);
        console.log('trendData:', trendData);

        res.json({ product, metrics, trendData });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
}

function calculateTrendData(orderAggregations, sellingPrice, costPrice) {
    // Calculate sales over time by date
    const salesOverTime = orderAggregations.map(agg => ({
        date: agg.dateCreated,
        sales: agg.totalSold
    }));

    // Calculate profit over time by month
    const profitOverTime = orderAggregations.reduce((acc, agg) => {
        const monthYear = `${agg.dateCreated.getFullYear()}-${agg.dateCreated.getMonth() + 1}`;
        if (!acc[monthYear]) {
            acc[monthYear] = { date: new Date(agg.dateCreated.getFullYear(), agg.dateCreated.getMonth()), profit: 0 };
        }
        acc[monthYear].profit += (agg.totalSold * sellingPrice) - (agg.totalSold * costPrice);
        return acc;
    }, {});

    // Convert profitOverTime object to array
    const profitOverTimeArray = Object.values(profitOverTime);

    return { salesOverTime, profitOverTime: profitOverTimeArray };
}

async function getVariation(req, res) {
    try {
        const sku = req.query.sku;
        if (!sku) {
            return res.status(400).json({ message: 'SKU is required' });
        }

        const product = await Product.findOne({ SKU: sku }); // Correct Mongoose query
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// async function getVariation(req, res) {
//     try {
//         const { sku } = req.query;

//         if (!sku) {
//             return res.status(400).json({ error: 'SKU is required' });
//         }

//         // Find product by SKU
//         const product = await Product.findOne({ SKU: sku }).lean();

//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         res.json(product.variations);
//     } catch (error) {
//         console.error('Error fetching product variations:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

async function deleteProductById(req, res) {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const associatedCollections = await AbstrakCol.find({ pieces: productId });

        if (associatedCollections.length > 0) {
            if (req.query.deleteAssociations === 'true') {
                await AbstrakCol.updateMany({ pieces: productId }, { $pull: { pieces: productId } });
                await Product.findByIdAndDelete(productId);
                return res.send('Product and associations deleted');
            } else if (req.query.deleteAssociations === 'false') {
                await Product.findByIdAndDelete(productId);
                return res.send('Product deleted, associations retained');
            } else {
                return res.status(400).send('Invalid deleteAssociations query parameter');
            }
        } else {
            await Product.findByIdAndDelete(productId);
            return res.send('Product deleted');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).send('Server error');
    }
}


async function checkName(req, res) {
    const {name, id }= req.body;

    Product.findOne({ name: name }).lean().then(product => {
        console.log(product);

    if(product && product._id != id) {
        res.send({ success: false, message: 'Product name is not available' })
      } else {
        res.send({ success: true, message: 'Product name is available' })
      }
  
     
    }).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });   

}

async function addProduct(req, res) {
    const { name, price, SKU, material, variations, collectionId } = req.body;

    const newProduct = new Product({
        name,
        picture: req.file.filename ,
        price,
        SKU,
        material: JSON.parse(material),
        variations: JSON.parse(variations)
    });


    try{
        await newProduct.save();
        addProductToCollection(collectionId, newProduct._id);
        res.send({ success: true, message: 'Product added successfully' });
        
    } catch (err) {
        console.log("error in add product: " + err)
    }
    
}

async function fetchSizeStockCost(req, res) {
  const productId = req.params.id;
  console.log("Fetched Product:");
  console.log(productId);
  try {
      const product = await Product.findById(productId).lean();
      console.log(product);
      
      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);  // Send the product data as a JSON response
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching product data" });
  }
}

async function updateProduct(req, res) {
  const productId = req.params.id;

  const { name, price, SKU, material, variations } = req.body;

  const updates = {
        name,
        price,
        SKU,
        material: JSON.parse(material),
        variations: JSON.parse(variations),
    };

    if(req.file) {
        updates.picture = req.file.filename;
    }

  try {
      // Find the product by ID and update its details
      const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

      if (!updatedProduct) {
          return res.status(404).json({ error: 'Product not found' });
      }

      res.json(updatedProduct); // Return the updated product
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
  }
}

async function checkSKU(req, res) {
    const sku = req.body.sku;

    Product
      .findOne({ SKU: sku })
      .lean()
      .then(product => {
        
        if(product && product._id != req.body.id) {
          res.send({ success: false, message: 'SKU is not available' })
        } else {
          res.send({ success: true, message: 'SKU is available' })
        }
      })
      .catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
      });   


}

module.exports = {
    fetchProductData,
    fetchProductMetrics,
    fetchProductGraphs,
    deleteProductById,
    checkName,
    checkSKU,
    fetchSizeStockCost,
    updateProduct,
    addProduct,
    getVariation,
    checkStock
};