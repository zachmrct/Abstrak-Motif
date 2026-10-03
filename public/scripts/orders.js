$(document).ready(() => {
    let cart = [];
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageNumber = document.getElementById('page-number');
    let totalPagesPagination = parseInt(document.getElementById('total-pages').textContent);

    let currentFilters = {
        sort: '',
        fulfillmentStatus: '',
        orderedFrom: '',
        paymentStatus: '',
        startDate: '',
        endDate: ''
    };

    let voucherDiscount = 0; // Initialize voucher discount

    const isFiltersApplied = (filters) => {
        return filters.sort || filters.fulfillmentStatus || filters.orderedFrom || filters.paymentStatus || filters.startDate || filters.endDate;
    };

    const loadPage = async (page) => {
        try {
            const response = await fetch(`/orders?page=${page}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            const { orders } = result;
            const tbody = document.getElementById('orders-body');
            tbody.innerHTML = '';
            orders.forEach(order => {
                const orderNumber = order.orderNumber || 'N/A';
                const dateCreated = order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : 'N/A';
                const totalOrderQuantity = order.totalOrderQuantity || 'N/A';
                const paymentMethod = order.paymentMethod || 'N/A';
                const fulfillmentStatus = order.fulfillmentStatus || 'N/A';
                const paymentStatus = order.paymentStatus || 'N/A';
                const total = order.total ? `₱${order.total}` : 'N/A';
                const shippingRate = order.shippingRate || 'N/A';
                const orderedFrom = order.orderedFrom || 'N/A';
                const tr = document.createElement('tr');
                tr.classList.add('orders-row');
                tr.innerHTML = `
                    <td>${orderNumber}</td>
                    <td>${dateCreated}</td>
                    <td>${totalOrderQuantity}</td>
                    <td>${paymentMethod}</td>
                    <td>${fulfillmentStatus}</td>
                    <td>${paymentStatus}</td>
                    <td>${total}</td>
                    <td>${shippingRate}</td>
                    <td>${orderedFrom}</td>
                `;
                tbody.appendChild(tr);

                // Add event listener for click to open the modal
                tr.addEventListener('click', () => openViewModal(orderNumber));
                // Set the cursor to pointer
                tr.style.cursor = 'pointer';
            });
            pageNumber.textContent = page;
            if (page === 1) {
                prevButton.style.display = 'none';
            } else {
                prevButton.style.display = 'inline';
            }
            if (page === totalPagesPagination) {
                nextButton.style.display = 'none';
            } else {
                nextButton.style.display = 'inline';
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    };

    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage < totalPagesPagination) {
            if (isFiltersApplied(currentFilters)) {
                filterResult(currentPage + 1);
            } else {
                loadPage(currentPage + 1);
            }
        }
    });

    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage > 1) {
            if (isFiltersApplied(currentFilters)) {
                filterResult(currentPage - 1);
            } else {
                loadPage(currentPage - 1);
            }
        }
    });

    // Initial load
    loadPage(1);

    function openViewModal(orderNumber){
        fetchOrderDetails(orderNumber);
        $('.view-product-modal').show();
    }

    $('.exit-view-product-modal').click(function(){
        $('.view-product-modal').hide();

        // clear the modal
        $('#order-number').text('');
        $('#date').text('');
        $('#time').text('');
        $("#order-source").text('');
        $("#order-total").text('');
        $("#order-itemtotal").text('');
        $("#order-shipping").text('');
        $('.items').empty();
    });

    const fetchOrderDetails = (orderNumber) => {
        $.ajax({
            url: '/api/orders/' + orderNumber,
            type: 'GET',
            success: function(response) {
                console.log(response);

                $('#order-number').text(response.orderNumber);
                $('#date').text(moment(response.dateCreated).format('MMMM D, YYYY'));
                $('#time').text(response.time);
                $("#order-source").text(response.orderedFrom);
                $("#order-total").text(response.total);
                $("#order-itemtotal").text(response.total - response.shippingRate);
                $("#order-shipping").text(response.shippingRate);

                // Clear existing items
                $('.items').empty();

                // Append new items
                response.items.forEach(item => {
                    const itemDetails = `
                        <div class="itemdetails">
                            <div class="nameandpic">
                                <img src="/uploads/products/${item.picture}" alt="${item.itemName}" class='itempic'>
                                <p>${item.itemName}</p>
                            </div>
                            <span class="price">${item.price}</span>
                            <span class="quantity">${item.quantity}</span>
                            <span class="variation">${item.variant}</span>
                        </div>
                    `;
                    $('.items').append(itemDetails);
                });
            },
            error: function(error) {
                console.error('Error fetching order:', error);
            }
        });
    };

    const addOrderModal = document.getElementById('add-order-modal');
    const productListModal = document.getElementById('product-list-modal');
    const productGallery = document.getElementById('product-gallery');
    const addButton = document.querySelector('.grid-header-add-button');
    const closeButton = document.querySelector('.exitordermodal');
    const plusSign = document.getElementById('plus-sign');
    const productCloseButton = document.querySelector('.exit-product-list');
    const productDetailsModal = document.getElementById('product-details-modal');
    const exitProductDetailsButton = document.querySelector('.exit-product-details');

    const openModal = (modal) => {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    };

    const closeModal = (modal) => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    addButton.addEventListener('click', () => openModal(addOrderModal));

    closeButton.addEventListener('click', () => closeModal(addOrderModal));

    plusSign.addEventListener('click', async () => {
        console.log('Opening product list modal...')
        openModal(productListModal);
        closeModal(addOrderModal);

        try {
            const response = await fetch('api/getAbstrakInvento', {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const products = await response.json();
            productGallery.innerHTML = '';
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('container');
                productDiv.dataset.id = product._id;
                productDiv.dataset.name = product.name;
                productDiv.dataset.price = product.price;
                productDiv.dataset.sku = product.SKU;
                productDiv.dataset.materials = product.material;
                productDiv.dataset.picture = `/uploads/products/${product.picture}`;
                
                productDiv.innerHTML = `
                    <div class="product-pic-container">
                        <div class="product-actual-photo-container">
                            <img src="/uploads/products/${product.picture}" alt="" class="product-pic">
                        </div>
                    </div>
                    <div class="product-name">
                        <p class="product-name-text">${product.name}</p>
                        <p class="product-stock ${product.totalStock > 0 ? 'high-stock' : 'no-stock'}">${product.totalStock} in stock</p>            
                    </div>
                `;
                productGallery.appendChild(productDiv);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    });

    productCloseButton.addEventListener('click', () => {
        closeModal(productListModal);
        openModal(addOrderModal);
    });

    window.addEventListener('click', (event) => {
        if (event.target === addOrderModal) closeModal(addOrderModal);
        if (event.target === productListModal) closeModal(productListModal);
    });

    const openProductDetailsModal = async (product) => {
        const productName = product.dataset.name;
        const productSku = product.dataset.sku;
        const productImgSrc = product.querySelector('.product-pic').src;

        document.querySelector('.name').textContent = `${productName}`;
        document.querySelector('.sku').textContent = `SKU: ${productSku}`;
        document.querySelector('.img').src = productImgSrc;

        try {
            const response = await fetch(`/api/product?sku=${productSku}`);
            if (!response.ok) {
                throw new Error('Product not found');
            }
            const productData = await response.json();

            const variationSelect = document.querySelector('.variations');
            let quantityDisplay = document.querySelector('.quantity');
            const priceDisplay = document.querySelector('.price-value');

            variationSelect.innerHTML = '';
            productData.variations.forEach(variation => {
                const option = document.createElement('option');
                option.value = variation.variation;
                option.textContent = variation.variation;
                variationSelect.appendChild(option);
            });

            const updatePrice = () => {
                const selectedVariation = productData.variations.find(variation => variation.variation === variationSelect.value);
                const quantity = parseInt(document.querySelector('.cartquantity').textContent, 10);
                const totalPrice = productData.price * quantity;
                priceDisplay.textContent = totalPrice.toFixed(2);
            };

            const minusButton = document.querySelector('.minus');
            const plusButton = document.querySelector('.plus');
            const addToCartButton = document.querySelector('.add-to-cart');

            // Remove previous event listeners
            const cloneMinusButton = minusButton.cloneNode(true);
            const clonePlusButton = plusButton.cloneNode(true);
            const cloneAddToCartButton = addToCartButton.cloneNode(true);

            minusButton.replaceWith(cloneMinusButton);
            plusButton.replaceWith(clonePlusButton);
            addToCartButton.replaceWith(cloneAddToCartButton);

            // Re-select the buttons after replacing
            const newMinusButton = document.querySelector('.minus');
            const newPlusButton = document.querySelector('.plus');
            const newAddToCartButton = document.querySelector('.add-to-cart');

            // Reset quantity to 1
            document.querySelector('.cartquantity').textContent = 1;

            newMinusButton.addEventListener('click', () => {
                let quantity = parseInt(document.querySelector('.cartquantity').textContent, 10);
                if (quantity > 1) {
                    quantity--;
                    document.querySelector('.cartquantity').textContent = quantity;
                    updatePrice();
                }
            });

            newPlusButton.addEventListener('click', () => {
                let quantity = parseInt(document.querySelector('.cartquantity').textContent, 10);
                quantity++;
                document.querySelector('.cartquantity').textContent = quantity;
                updatePrice();
            });

            variationSelect.addEventListener('change', () => {
                quantityDisplay.textContent = 1; // Reset quantity to 1 when variation changes
                updatePrice();
            });
            updatePrice(); // Initial price update

            newAddToCartButton.addEventListener('click', () => {
                const selectedVariation = productData.variations.find(variation => variation.variation === variationSelect.value);
                const quantity = parseInt(document.querySelector('.cartquantity').textContent, 10);

                const existingItem = cart.find(item => item.name === productName && item.variation === selectedVariation.variation);

                if (existingItem) {
                    existingItem.quantity += quantity;
                    existingItem.total += productData.price * quantity;
                    renderCartItems();
                } else {
                    // Item does not exist, add new item to cart
                    const order = {
                        id: productData._id,
                        name: productName,
                        sku: productSku,
                        variation: selectedVariation.variation,
                        quantity: quantity,
                        price: productData.price,
                        total: productData.price * quantity,
                        imgSrc: productImgSrc
                    };
                    cart.push(order);
                    renderCartItems();
                    console.log('Order added to cart:', order);
                }

                closeModal(productDetailsModal);
                openModal(productListModal);
            });

        } catch (error) {
            console.error('Error fetching variations:', error);
        }

        openModal(document.getElementById('product-details-modal'));
        closeModal(document.getElementById('product-list-modal'));
    };

    const renderCartItems = () => {
        const cartItemsContainer = document.getElementById('cartitems');
        cartItemsContainer.innerHTML = '';

        console.log('Rendering cart items:', cart);

        const itemsTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

        cart.forEach(item => {
            console.log('Rendering item:', item);
            const itemDetails = document.createElement('div');
            itemDetails.classList.add('itemdetails');
            itemDetails.innerHTML = `
                <div class="nameandpic">
                    <img src="${item.imgSrc}" alt="${item.name}" class="itempic">
                    <span>${item.name} (${item.variation})</span>
                </div>
                <span class="priceperitem">₱${item.price.toFixed(2)}</span>
                <span class="quantity">${item.quantity} pc</span>
                <span class="totalprice">₱${(item.price * item.quantity).toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(itemDetails);
        });

        document.querySelector('.payment-itemtotal').textContent = `₱${itemsTotal.toFixed(2)}`;

        // Update total amount (items total + shipping)
        updateTotal();
    };

    // Function to update total amount based on items total and shipping fee
    const updateTotal = () => {
        const shippingFee = parseFloat(document.querySelector('.shipping-fee').value) || 0;

        // Calculate total amount including shipping fee
        const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + shippingFee - voucherDiscount;

        // Display shipping fee in the UI
        document.querySelector('.payment-shipping').textContent = `₱${shippingFee.toFixed(2)}`;

        // Display total amount in the UI
        document.querySelector('.payment-total').textContent = `₱${totalAmount.toFixed(2)}`;

        // Display discount in the UI
        document.querySelector('.payment-discount').textContent = `₱${voucherDiscount.toFixed(2)}`;
    };

    // Event listener for shipping fee input field
    document.querySelector('.shipping-fee').addEventListener('input', updateTotal);

    // Function to handle submission of the order

    document.querySelector('.exit-product-details').addEventListener('click', () => {
        document.getElementById('product-details-modal').style.display = 'none';
    });

    document.querySelector('.submitbtn').addEventListener('click', async () => {
        const orderedFrom = document.querySelector('.orderedfrom').value;
        const orderNo = document.querySelector('.order-num').value;
        const shippingFee = parseFloat(document.querySelector('.shipping-fee').value);
        const orderDate = document.querySelector('.order-date').value;
        const fulfillmentStatus = document.querySelector('.fulfillmentstatus').value;
        const paymentMethod = document.querySelector('.paymentmethod').value;
        const paymentStatus = document.querySelector('.paymentstatus').value;
        const voucherBorderColor = document.querySelector('#voucher').style.borderColor;

        const checkOrderNoExists = async (orderNo) => {
            try {
                const response = await fetch(`/orders/checkOrderNo?orderNo=${orderNo}`);
                const data = await response.json();
                return data.success;
            } catch (error) {
                console.error('Error checking order number:', error);
                return false;
            }
        };

        const checkStockAvailability = async (cartItems) => {
            try {
                const response = await fetch('/products/checkStock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: cartItems })
                });

                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error checking stock:', error);
                return { success: false };
            }
        };

        if (!orderedFrom || !orderDate || !fulfillmentStatus || !paymentMethod || !paymentStatus || !orderNo) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Please complete all fields.'
            });
            return;
        } else if (shippingFee < 0 || isNaN(shippingFee)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Shipping fee must be a valid value in Php.'
            });
            return;
        } else if (orderNo < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Enter a valid order number.'
            });
            return;
        } else if (!await checkOrderNoExists(orderNo)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Order number already exists. Please enter a different order number.'
            });
            return;
        } else if (cart.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Cart is still empty.'
            });
            return;
        }

        const stockCheckResult = await checkStockAvailability(getCartItemsForOrder());
        if (!stockCheckResult.success) {
            const stockIssues = stockCheckResult.stockIssues.map(issue => issue.message).join(', ');
            Swal.fire({
                icon: 'error',
                title: 'Stock Issue',
                text: `There are stock issues with the following items: ${stockIssues}`
            });
            return;
        }

        if (voucherBorderColor === 'red') {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Voucher',
                text: 'The current voucher entered is non-existent or already expired. There would be no discount/s on this order. Do you want to continue?',
                showCancelButton: true,
                confirmButtonText: 'Yes, continue',
                cancelButtonText: 'No, change voucher'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    saveOrder(orderNo,
                        orderedFrom,
                        shippingFee,
                        orderDate,
                        fulfillmentStatus,
                        paymentMethod,
                        paymentStatus);
                } else {
                    // Do nothing, user chose to change the voucher
                }
            });
        } else {
            saveOrder(orderNo,
                orderedFrom,
                shippingFee,
                orderDate,
                fulfillmentStatus,
                paymentMethod,
                paymentStatus);
        }
    });

    const saveOrder = async (orderNo, orderedFrom, shippingFee, orderDate, fulfillmentStatus, paymentMethod, paymentStatus) => {
        const orderData = {
            orderNo: orderNo,
            date: orderDate,
            totalOrderQuantity: cart.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: cart.reduce((acc, item) => acc + item.total, 0) + shippingFee - voucherDiscount,
            items: getCartItemsForOrder(),
            paymentStatus: paymentStatus,
            paymentMethod: paymentMethod,
            fulfillmentStatus: fulfillmentStatus,
            orderedFrom: orderedFrom,
            shippingRate: shippingFee
        };

        try {
            const response = await fetch('/orders/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to save order');
            }

            const data = await response.json();
            console.log("Order saved successfully:", data);
            window.location.reload(); // Example: reload the page after successful save
        } catch (error) {
            console.error("Error saving order:", error);
            // Optionally handle error case, e.g., show an alert or message
        }
    };

    const getCartItemsForOrder = () => {
        return cart.map(item => ({
          itemName: item.name,
          quantity: item.quantity,
          variant: item.variation, 
          SKU: item.sku,
          _id: item.id,
          price: item.price
        }));
    };

    productGallery.addEventListener('click', (event) => {
        const product = event.target.closest('.container');
        if (product) {
            openProductDetailsModal(product);
        }
    });

    exitProductDetailsButton.addEventListener('click', () => {
        closeModal(productDetailsModal);
        openModal(productListModal);
    });

    const initialize = () => {
        loadPage(parseInt(pageNumber.textContent));
    };

    // Upload popup -- sprint 3 revisions
    const uploadButton = document.getElementById('toggle-upload');
    const uploadModal = document.getElementById('upload-modal');
    const exitUploadButton = document.querySelector('.exit-upload-modal');
    const csvFileInput = document.getElementById('csvFileInput');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadArea = document.getElementById('upload-area');
    const uploadForm = document.getElementById('upload-form');
    const loader = document.getElementById('loader');
    const successMessage = document.getElementById('success-message');

    uploadButton.addEventListener('click', () => {
        uploadModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });

    exitUploadButton.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    csvFileInput.addEventListener('change', (event) => {
        const fileName = event.target.files[0].name;
        fileNameDisplay.textContent = `File: ${fileName}`;
    });

    uploadArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadArea.classList.add('dragging');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragging');
    });

    uploadArea.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadArea.classList.remove('dragging');
        const files = event.dataTransfer.files;
        csvFileInput.files = files;
        const fileName = files[0].name;
        fileNameDisplay.textContent = `File: ${fileName}`;
    });

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);

        loader.style.display = 'flex';
        console.log('Uploading file...');

        try {
            const response = await fetch('/upload-csv', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            console.log('CSV uploaded successfully:', result);

            loader.style.display = 'none';
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
                uploadModal.style.display = 'none';
                document.body.classList.remove('modal-open');
                location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error uploading CSV:', error);
            loader.style.display = 'none';
        }
    });

    // Search
    $('#toggle-search').click(function() {
        $('#search-bar').toggle();
    });

    $('#search-button').click(function() {
        const searchText = $('#search-input').val().toLowerCase();
        $('.orders-row').each(function() {
            const rowText = $(this).text().toLowerCase();
            const itemsText = $(this).data('itemslist') ? $(this).data('itemslist').toLowerCase() : '';
            if (rowText.includes(searchText) || itemsText.includes(searchText)) {
                highlightText($(this), searchText);
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        $('.pagination-container').hide();
    });

    $('#clear-search-button').click(function() {
        $('#search-input').val(''); 
        $('.orders-row').show(); 
        $('.pagination-container').show();
        removeHighlights();
    });

    const highlightText = (element, text) => {
        const innerHTML = element.html();
        const index = innerHTML.toLowerCase().indexOf(text.toLowerCase());
        if (index >= 0) {
            element.html(innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + text.length) + "</span>" + innerHTML.substring(index + text.length));
        }
    };

    const removeHighlights = () => {
        $('.highlight').each(function() {
            const parent = $(this).parent();
            $(this).replaceWith($(this).text());
            parent.html(parent.html()); 
        });
    };

    $('.filter-sort').on('click', function() {
        const offset = $(this).offset();
        const height = $(this).outerHeight();
        
        $('#filter-sort-modal').css({
            top: offset.top + height + 10 + 'px', // 10px for some spacing
            left: offset.left - 120 + 'px',
            display: 'block'
        });
    });

    $('#filter-sort-done').on('click', function() {
        $('#filter-sort-modal').hide();
    });

    // Optional: Hide the modal if clicked outside of it
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.filter-sort, #filter-sort-modal').length) {
            $('#filter-sort-modal').hide();
        }
    });

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    startDateInput.addEventListener('change', function() {
        const startDate = new Date(startDateInput.value);
        if (startDate) {
            const minEndDate = new Date(startDate);
            minEndDate.setDate(minEndDate.getDate() + 1); // Ensuring the end date is after the start date
            const minEndDateString = minEndDate.toISOString().split('T')[0];
            endDateInput.min = minEndDateString;
        }
    });

    endDateInput.addEventListener('focus', function() {
        const startDate = startDateInput.value;
        if (!startDate) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Please add a start date first.'
            });
            startDateInput.focus();
        }
    });

    $('#filter-sort-done').on('click', function() {
        const sort = $('.sorting').val();
        const fulfillmentStatus = $('.fulfillmentfilter').val();
        const orderedFrom = $('.orderfromfilter').val();
        const paymentStatus = $('.paymentstatusfilter').val();
        const startDate = $('#start-date').val();
        const endDate = $('#end-date').val();

        currentFilters = { sort, fulfillmentStatus, orderedFrom, paymentStatus, startDate, endDate };

        $('#filter-sort-modal').hide();

        filterResult(1); 
    });

    $('#filter-sort-clear').click(function() {
        $('#start-date').val('');
        $('#end-date').val('');
        $('#sorting').prop('selectedIndex', 0);
        $('#fulfillmentfilter').prop('selectedIndex', 0);
        $('#orderfromfilter').prop('selectedIndex', 0);
        $('#paymentstatusfilter').prop('selectedIndex', 0);
    });

    const filterResult = async (page) => {
        const query = $.param({ ...currentFilters, page });
        try {
            const response = await fetch(`/orders?${query}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            const { orders, totalPages } = result;
            const tbody = document.getElementById('orders-body');
            tbody.innerHTML = '';
            document.getElementById('total-pages').textContent = totalPages;
            orders.forEach(order => {
                const orderNumber = order.orderNumber || 'N/A';
                const dateCreated = order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : 'N/A';
                const totalOrderQuantity = order.totalOrderQuantity || 'N/A';
                const paymentMethod = order.paymentMethod || 'N/A';
                const fulfillmentStatus = order.fulfillmentStatus || 'N/A';
                const paymentStatus = order.paymentStatus || 'N/A';
                const total = order.total ? `₱${order.total}` : 'N/A';
                const shippingRate = order.shippingRate || 'N/A';
                const orderedFrom = order.orderedFrom || 'N/A';
                const tr = document.createElement('tr');
                tr.classList.add('orders-row');
                tr.innerHTML = `
                    <td>${orderNumber}</td>
                    <td>${dateCreated}</td>
                    <td>${totalOrderQuantity}</td>
                    <td>${paymentMethod}</td>
                    <td>${fulfillmentStatus}</td>
                    <td>${paymentStatus}</td>
                    <td>${total}</td>
                    <td>${shippingRate}</td>
                    <td>${orderedFrom}</td>
                `;
                tbody.appendChild(tr);

                // Add event listener for click to open the modal
                tr.addEventListener('click', () => openViewModal(orderNumber));
                // Set the cursor to pointer
                tr.style.cursor = 'pointer';
            });

            pageNumber.textContent = page;
            if (totalPages <= 1) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
            } else {
                if (page === 1) {
                    prevButton.style.display = 'none';
                } else {
                    prevButton.style.display = 'inline';
                }
                if (page === totalPages) {
                    nextButton.style.display = 'none';
                } else {
                    nextButton.style.display = 'inline';
                }
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    };
    
    const validateVoucher = () => {
        const voucherCode = $('#voucher').val();
        const orderDate = $('#order-date').val();
    
        if (!orderDate) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Please input the order date first.'
            });
            return;
        }
    
        if (voucherCode.length > 0) {
            $.ajax({
                url: '/api/search-voucher',
                method: 'GET',
                data: { code: voucherCode, orderDate: orderDate }, 
                success: function(response) {
                    $('#voucher').css('border-color', 'green');
    
                    // Update voucher discount and recalculate total
                    voucherDiscount = response.discountAmount;
                    updateTotal();
                },
                error: function(xhr) {
                    if (xhr.status === 404 || xhr.status === 400) {
                        $('#voucher').css('border-color', 'red');
                    } else {
                        $('#voucher').css('border-color', 'yellow');
                    }
                    // Reset voucher discount and recalculate total
                    voucherDiscount = 0;
                    updateTotal();
                }
            });
        } else {
            $('#voucher').css('border-color', '');
            // Reset voucher discount and recalculate total
            voucherDiscount = 0;
            updateTotal();
        }
    }
    
    $('#voucher').on('input', validateVoucher);
    $('#order-date').on('change', validateVoucher);

    initialize();
});
