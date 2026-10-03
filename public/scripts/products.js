$(document).ready(function() {
    let currentProductIndex = 0;
    let salesChart, profitChart;

    // Function to destroy existing charts
    function destroyCharts() {
        if (salesChart) {
            salesChart.destroy();
        }
        if (profitChart) {
            profitChart.destroy();
        }
    }

    // Pop up 
    $(".three-dots-product-option").click(popupClick);

    $(document).click(closePopup);

    // Add product form
    $('.grid-header-add-button').on('click', function() {
        clearForm();
        $('.add-product-modal').fadeIn();
    });

    $(".main-picture").click(function(event) {
        $("#imageInput").click();
    });

    $('.exit-form').on('click', function() {
        // Clear form
        clearForm();
        $('.add-product-modal').fadeOut();
    });

    $("#imageInput").change(displayUploadedImage);

    $("#imageInput").click(function(event) {
        event.stopPropagation();
    });

    $('#material-input').keydown(listenToTagEntry);

    $('#product-name-input').on('keyup', validateProductName);

    $('#product-price-input').on('keyup', validatePriceInput);

    $('#product-sku-input').on('keyup', validateSKUInput);

    $("#next-form-button").click(toForm2Click);

    $(".add-row-button").click(addVariation);

    $("#back-form-button").click(toForm1Click);

    $(".product-form-stock").on('keyup', validateStockInput);

    $(document).on('input', '.product-form-stock', validateStockInput); // Bind the dynamically added stuff

    $(".product-form-manucost").on('keyup', validatePriceInput);

    $(document).on('input', '.product-form-manucost', validatePriceInput); // Bind the dynamically added stuff

    // Edit product form
    $(".edit-product").click(editProduct);

    // Delete product
    $(".delete-product").click(deleteProduct);

    // Delete row in form
    $('.delete-row-icon').each(deleteRow);

    function fetchViewProductDetails(productId) {
        $.ajax({
            url: `/products/${productId}`,
            method: 'GET',
            success: function(response) {
                var variationsHtml = '';
                response.variations.forEach(function(variation) {
                    variationsHtml += `
                        <div class="variation-row">
                            <div class="bubble"><p>VARIATION: <span class="variation-detail">${variation.variation}</span></p></div>
                            <div class="bubble"><p>STOCK: <span class="stock-detail">${variation.stocks}</span></p></div>
                            <div class="bubble"><p>SOLD: <span class="sold-detail">${variation.totalSold || 0}</span></p></div>
                            <div class="bubble"><p>MANUFACTURING COST: <span class="manucost-detail">${variation.manufacturingCost}</span></p></div>
                        </div>
                    `;
                });
                $(".product-variations").html(variationsHtml);
            },
            error: function(xhr, status, error) {
                console.error("Error fetching product data:", error);
            }
        });
    }

    function fetchViewProductMetrics(productId) {
        $.ajax({
            url: `/products/metrics/${productId}`,
            method: 'GET',
            success: function(response) {
                var product = response.product;
                var metrics = response.metrics;
    
                $('#dynamic-product-name').text(product.name);
                $('#product-name').text(product.name);
                $('#product-price').text(product.sellingPrice);
                $('#product-sku').text(product.sku);
                $('#product-material').text(product.material);
    
                var metricsHtml = `
                    <div class="metrics-row">
                        <div class="bubble"><p>SOLD: <span class="sold-detail">${metrics.totalSold}</span></p></div>
                        <div class="bubble"><p>TOTAL SALES AMOUNT: <span class="sales-amount-detail">${metrics.totalSalesAmount}</span></p></div>
                    </div>
                    <div class="metrics-row">
                        <div class="bubble"><p>COST PRICE: <span class="cost-price-detail">${metrics.costPrice}</span></p></div>
                        <div class="bubble"><p>TOTAL COST: <span class="total-cost-detail">${metrics.totalCost}</span></p></div>
                    </div>
                    <div class="metrics-row">
                        <div class="bubble"><p>GROSS PROFIT: <span class="gross-profit-detail">${metrics.grossProfit}</span></p></div>
                        <div class="bubble"><p>RETURN RATE: <span class="return-rate-detail">${metrics.returnRate.toFixed(2)}%</span></p></div>
                    </div>
                `;
    
                $(".product-metrics").html(metricsHtml);
            },
            error: function(xhr, status, error) {
                console.error("Error fetching product data:", error);
            }
        });
    }
    
    function fetchProductGraphs(productId) {
        $.ajax({
            url: `/product-graphs/${productId}`,
            method: 'GET',
            success: function(response) {
                var product = response.product;
                var metrics = response.metrics;
                var trendData = response.trendData;

                var salesOverTime = trendData.salesOverTime.map(data => data.sales);
                var profitOverTime = trendData.profitOverTime.map(data => data.profit);
                var salesDates = trendData.salesOverTime.map(data => new Date(data.date).toLocaleDateString());
                var profitDates = trendData.profitOverTime.map(data => new Date(data.date).toLocaleDateString());

                var salesChartCtx = document.getElementById('salesChart').getContext('2d');
                var profitChartCtx = document.getElementById('profitChart').getContext('2d');

                destroyCharts(); // Destroy existing charts

                salesChart = new Chart(salesChartCtx, {
                    type: 'line',
                    data: {
                        labels: salesDates,
                        datasets: [{
                            label: 'Sales Over Time',
                            data: salesOverTime,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            x: { title: { display: true, text: 'Date' } },
                            y: { title: { display: true, text: 'Sales' } }
                        }
                    }
                });

                profitChart = new Chart(profitChartCtx, {
                    type: 'line',
                    data: {
                        labels: profitDates,
                        datasets: [{
                            label: 'Profit Over Time',
                            data: profitOverTime,
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            x: { title: { display: true, text: 'Month' } },
                            y: { title: { display: true, text: 'Profit' } }
                        }
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error("Error fetching product graphs:", error);
            }
        });
    }
    
    function fetchViewProductInfo(productId) {
        $.ajax({
            url: `/products/info/${productId}`,
            method: 'GET',
            success: function(response) {
                var product = response.product;
                var metrics = response.metrics;
    
                $('#dynamic-product-name').text(product.name);
                $('#product-name').text(product.name);
                $('#product-price').text(product.sellingPrice);
                $('#product-sku').text(product.sku);
                $('#product-material').html(product.material.map(material => `<span class="material-tag">${material}</span>`).join(' '));
                
                // Assuming there's a placeholder for the product image
                var productInfoHtml = `
                <p class="stock-indicator ${metrics.remainingInventory > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${metrics.remainingInventory > 0 ? `${metrics.remainingInventory} in stock` : 'Out of stock'}
                </p>
                <p class="product-detail-container">Name: <span class="product-detail">${product.name}</span></p>
                <p class="product-detail-container">Price: <span class="product-detail">${product.price}</span></p>
                <p class="product-detail-container">SKU: <span class="product-detail">${product.SKU}</span></p>
                <p class="product-detail-container">Material: 
                    <span class="product-detail">
                        ${product.material.map(material => `<span class="material-tag">${material}</span>`).join(' ')}
                    </span>
                </p>
            `;
        
            
    
                $(".product-info").html(productInfoHtml);
            },
            error: function(xhr, status, error) {
                console.error("Error fetching product info:", error);
            }
        });
    }
    
    function fetchAndUpdateProductDetails(productId, productPicture) {
        console.log(`Updating product details for product ID: ${productId}`);
        fetchViewProductInfo(productId);
        fetchViewProductMetrics(productId);
        fetchProductGraphs(productId);
        fetchViewProductDetails(productId);

        // Set the product image
        console.log(`Product Image: ${productPicture}`);
        $(".product-img").attr("src", productPicture);
    }

    function viewProduct(index) {
        console.log(`Viewing product at index: ${index}`);
        currentProductIndex = index;
        const container = $('.product-pic').eq(index).closest('.container');
        const productId = container.data('id');
        const productPicture = container.data('picture'); // Get the picture URL from the data attribute
        console.log(`Product ID: ${productId}`);
        console.log(`Product Picture: ${productPicture}`);
        fetchAndUpdateProductDetails(productId, productPicture);
        $(".product-card-modal").fadeIn();
        showSection(1);
    }
    
    // Bind the click event for viewing product details
    $(".product-pic").click(function() {
        const index = $(this).closest('.container').index();
        console.log(`Product picture clicked, index: ${index}`);
        viewProduct(index);
    });


    $(".close-product-card").click(closeCard);

    // Close product card function
    function closeCard() {
        $(".product-card-modal").fadeOut();
    }

    $(".prev-product").click(function() {
        if (currentProductIndex > 0) {
            viewProduct(currentProductIndex - 1);
        }
    });
    
    $(".next-product").click(function() {
        if (currentProductIndex < $('.product-pic').length - 1) {
            viewProduct(currentProductIndex + 1);
        }
    });

    // Show specific section of the product card
    function showSection(sectionNumber) {
        $(".product-card-section").removeClass("active");
        $("#section-" + sectionNumber).addClass("active");

        if (sectionNumber === 1) {
            $(".next-section").show();
            $(".previous-section").hide();
        } else if (sectionNumber === 2) {
            $(".next-section").hide();
            $(".previous-section").show();
        }
    }

    $(".next-section").click(function() {
        showSection(2);
    });

    $(".previous-section").click(function() {
        showSection(1);
    });

    // Initialize buttons visibility on load
    showSection(1); // Show the first section initially

    // Next and Back button functionality
    $(".next-section").click(function() {
        showSection(2);
    });
    $(".previous-section").click(function() {
        showSection(1);
    });
});
