let tagList, variations = [];
let name, price, sku, materials, editingProductId, picture;

const ROW_VARIATION = '.product-form-variation'
const ROW_STOCK = ".product-form-stock"
const ROW_MANUCOST = ".product-form-manucost"


function deleteRow(event) {
    // if there is only one add product variation row do not remove
    rowCount = document.getElementsByClassName('add-product-variation-row').length
    console.log(rowCount)
    if (rowCount != 1) {
        $(this).closest('.add-product-variation-row').remove();
    }

}

function popupClick(event){
    event.stopPropagation(); // do not bubble up to the DOM window
    var $popup = $(this).closest('.container').find('.product-options-popup');
    $(".product-options-popup").not($popup).hide(); 
    $popup.toggle(); 
}

function closePopup(event){
    if (!$(event.target).closest('.product-options-popup').length && !$(event.target).hasClass('three-dots-product-option')) {
        $(".product-options-popup").hide();
    }
}

function createImage(source){
    mediaContainer = $(".main-picture")
    const photoContainer = document.createElement('div');
    photoContainer.className = 'product-photo-container';

    const img = document.createElement('img');
    img.src = source;
    img.className = 'product-photo';
    photoContainer.appendChild(img);

    mediaContainer.append(photoContainer);
}

function displayUploadedImage(event) {

    var file = this.files[0];
    var reader = new FileReader();
    
    $(".product-photo-container").remove();
    reader.onload = function(e){
        createImage(e.target.result);
    }
    reader.readAsDataURL(file);
}


function listenToTagEntry(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var tag = $(this).val().trim();
        if (tag) {
            addTag(tag);
            $(this).val('');
        }
    }
}

function addTag(tag) {
    if (tagList.includes(tag)) {
        console.log('Tag already exists:', tag);
        return;
    }

    tagList.push(tag);

    var tagElement = $('<div>').addClass('material').text(tag);
    var removeButton = $('<span>').addClass('remove-material').text('×').click(function() {
        var index = tagList.indexOf(tag);
        if (index !== -1) {
            tagList.splice(index, 1);
        }
        $(this).parent().remove();
    });
    tagElement.append(removeButton);
    $('#material-list').append(tagElement);
}

function validateProductName() {
    const name = $(this).val();

    if (name === ""){
        $('#product-name-input').removeClass('correct-input').addClass('wrong-input');
    } else {
        $.ajax({
            url: '/api/products/check-name',
            type: 'POST',
            data: {
                name: name,
                id: editingProductId
            },
            success: function(data) {
                if(data.success){
                    $('#product-name-input').removeClass('wrong-input').addClass('correct-input');
                } else {
                    $('#product-name-input').addClass('wrong-input');
                }
            }
        });
    }
}

function validateStockInput() {
    const targetCell = $(this);
    const value = Number(targetCell.val()); 

    if (value >= 0) {
        targetCell.removeClass('wrong-input').addClass('correct-input'); 
    } else {
        targetCell.removeClass('correct-input').addClass('wrong-input'); 
    }
}

function validatePriceInput() {
    if(Number($(this).val()) > 0) {
        $(this).removeClass('wrong-input').addClass('correct-input');
    } else {
        $(this).removeClass('correct-input').addClass('wrong-input');
    }
}


function validateSKUInput() {
    if($(this).val() === "") {
        $('#product-sku-input').removeClass('correct-input').addClass('wrong-input');
    } else {
        $.ajax({
            url: '/api/products/check-sku',
            type: 'POST',
            data: {
                sku: $(this).val(),
                id: editingProductId
            },
            success: function(data) {
                if(data.success){
                    $('#product-sku-input').removeClass('wrong-input').addClass('correct-input');
                } else {
                    $('#product-sku-input').addClass('wrong-input');
                }
            }
        });
    }
}


function editProduct() {
    event.preventDefault();
    $('.add-product-title').text('Edit Product');

    const $container = $(this).closest('.container');
    editingProductId = $container.data('id');
    const productName = $container.data('name');
    const productPrice = $container.data('price');
    const productSku = $container.data('sku');
    const productMaterials = $container.data('materials').split(',');
    const productPicture = $container.data('picture');

    populateForm(editingProductId, productName, productPrice, productSku, productMaterials, productPicture);
    $('.add-product-modal').fadeIn();
}

function clearForm() {
    toForm1Click();
    $('.add-product-title').text('Add Product');
    editingProductId = null;
    $('#product-name-input').val('').removeClass('correct-input wrong-input');
    $('#product-price-input').val('').removeClass('correct-input wrong-input');
    $('#product-sku-input').val('').removeClass('correct-input wrong-input');
    $('#material-list').empty();
    tagList = [];
    $('.main-picture img').remove();
    $('<img>').attr('src', "/assets/upload-icon.png").attr('alt', "upload").attr('id', 'upload-icon').appendTo('.main-picture');
    const variationContainer = $('.add-row-frame');
    variationContainer.empty(); // Remove all rows

    addVariation();
}

function preloadTag(tag) {
    let tagElement = $('<div>').addClass('material').text(tag);
    let removeButton = $('<span>').addClass('remove-material').text('×').click(function() {
        let index = tagList.indexOf(tag);
        if (index !== -1) {
            tagList.splice(index, 1);
        }
        $(this).parent().remove();
    });
    tagElement.append(removeButton);
    $('#material-list').append(tagElement);
}


function populateForm(id, name, price, sku, materials, picture) {
    $('#product-name-input').val(name).removeClass('correct-input wrong-input');
    $('#product-price-input').val(price).removeClass('correct-input wrong-input');
    $('#product-sku-input').val(sku).removeClass('correct-input wrong-input');
    tagList = materials;
    $('#material-list').empty();
    materials.forEach(material => preloadTag(material));

    console.log(tagList);
    $('.main-picture img').remove();

    fetchProductData(id);

    createImage(picture);
}

function fetchProductData(productId) {
    $.ajax({
        url: `/products/${productId}`,
        method: 'GET',
        success: function(response) {
            // console.log(response.variations);
            $('.add-row-frame').empty();

            response.variations.forEach(variation => {
                let newRow = $('<div>').addClass('add-product-variation-row');
                
                let deleteRowIcon = $('<span>').addClass('delete-row-icon').text('x').click(deleteRow);
                newRow.append(deleteRowIcon);

                let variationInput = $('<input>')
                    .attr('type', 'text')
                    .attr('placeholder', 'Variation')
                    .addClass('product-form-variation table-type')
                    .val(variation.variation);
                    
                let stockInput = $('<input>')
                    .attr('type', 'number')
                    .attr('placeholder', 'Stock')
                    .addClass('product-form-stock table-type')
                    .val(variation.stocks);
                    
                let costInput = $('<input>')
                    .attr('type', 'text')
                    .attr('placeholder', 'Manufacturing Cost')
                    .addClass('product-form-manucost table-type')
                    .val(variation.manufacturingCost);
                
                newRow.append(variationInput, stockInput, costInput);
                $('.add-row-frame').append(newRow);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error fetching product data:", error);
        }
    });
}

function deleteProduct(){
        event.preventDefault();
        const $container = $(this).closest('.container');
        const deleteProductId = $container.data('id');
        const productName = $container.data('name');
        const productPicture = $container.data('picture');
    
        Swal.fire({
            title: 'Are you sure?',
            html: `<p>Do you want to delete the product "<strong>${productName}</strong>"?</p><img src="${productPicture}" alt="${productName}" class="swal-product-image">`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Delete associated details?',
                    html: `<p>Do you also want to delete the associated details for "<strong>${productName}</strong>"?</p><img src="${productPicture}" alt="${productName}" class="swal-product-image">`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete associations',
                    cancelButtonText: 'No, keep associations'
                }).then((assocResult) => {
                    if (assocResult.isConfirmed) {
                        $.ajax({
                            url: '/api/products/delete/' + deleteProductId + '?deleteAssociations=true',
                            type: 'DELETE',
                            success: function(result) {
                                Swal.fire(
                                    'Deleted!',
                                    `Product "<strong>${productName}</strong>" and associations have been deleted.`,
                                    'success'
                                ).then(() => location.reload());
                            },
                            error: function(err) {
                                Swal.fire('Error', 'Error deleting product.', 'error');
                            }
                        });
                    } else if (assocResult.dismiss === Swal.DismissReason.cancel) {
                        $.ajax({
                            url: '/api/products/delete/' + deleteProductId + '?deleteAssociations=false',
                            type: 'DELETE',
                            success: function(result) {
                                Swal.fire(
                                    'Deleted!',
                                    `Product "<strong>${productName}</strong>" has been deleted, associations retained.`,
                                    'success'
                                ).then(() => location.reload());
                            },
                            error: function(err) {
                                Swal.fire('Error', 'Error deleting product.', 'error');
                            }
                        });
                    }
                });
            }
        });
}

function nextForm(event){
    event.preventDefault();
    name = $('#product-name-input').val();
    price = $('#product-price-input').val();
    sku = $('#product-sku-input').val();
    materials = tagList;
    picture = $(".product-photo-container")
    // console.log("hereee")

    if(name === "" || price === "" || sku === "" || materials.length === 0 || picture.length === 0){
        console.log(name, price, sku, materials, picture)
        fireErrorSwal("Please fill out all fields and ensure that a picture is uploaded!")
        return;
    }

    if(price <= 0){
        fireErrorSwal("Price must be greater than 0!")
        return; 
    }



    $(".form-1").hide();
    $(".form-2").show();
    $("#next-form-button").text("Submit");
    $("#back-form-button").show();
}

function validateForm2(){
    const uniqueVariations = []
    const productVariations = []
    const variations = $('.add-product-variation-row');
    const allFilled = true;

    // console.log(vs"variations)

    for (let i = 0; i < variations.length; i++) {
        const variation = {};
        variation.variation = $(variations[i]).find(ROW_VARIATION).val();
        variation.stocks = parseInt($(variations[i]).find(ROW_STOCK).val()); 
        variation.manufacturingCost = parseFloat($(variations[i]).find(ROW_MANUCOST).val());
       
        $('input.table-type').each(function() {
            if ($(this).val() === '') {
                fireErrorSwal("Please fill out all fields")
                allFilled = false;
            }
        });

        if(!allFilled){return;}
        
        if (!variation.variation || variation.stocks < 0 || variation.manufacturingCost <= 0) {
            fireErrorSwal("Please fill out all fields and ensure that stock and manufacturing cost are valid numbers!")
            return;
        }

        if(uniqueVariations.includes(variation.variation)){
            fireErrorSwal("Variations must be unique!")
            return;
        }

        uniqueVariations.push(variation.variation);
        productVariations.push(variation);
    }

    return productVariations

}

function updateForm(name, price, sku, materials, existingProductId) {
    variations = validateForm2();

    var formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("SKU", sku);
    formData.append("material", JSON.stringify(materials));
    formData.append("variations", JSON.stringify(variations));
    formData.append("picture", $("#imageInput")[0].files[0]);


    if(variations === undefined){
        return;
    }
    

    $.ajax({
        url: `/api/products/update/${existingProductId}`,
        method: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Product updated',
                text: 'The product has been updated successfully.',
                showConfirmButton: false // Hide the default "OK" button
            });

            // Close the modal after 3 seconds (for example)
            setTimeout(() => {
                Swal.close(); 
                window.location.reload();
            }, 1500);
        },
        error: function(xhr, status, error) {
            Swal.fire('Error', 'There was an error updating the product.', 'error');
        }
    });

}

function submitProduct(event) {
    event.preventDefault();

    const name = $('#product-name-input').val();
    const price = parseFloat($('#product-price-input').val()); // Convert price to float
    const sku = $('#product-sku-input').val();
    const material = $('#material-list').children().map(function() { return $(this).text().replace("×", ""); }).get();
    const existingProductId = editingProductId;
    const image = $("#imageInput")[0].files[0];
    const collectionId = $('.main').data('id');

    if (existingProductId) {
        updateForm(name, price, sku, material, existingProductId);
        return;
    }

    variations = validateForm2();

    if(variations === undefined){
        return;
    }
    
    console.log(variations);
    console.log(material);

    var formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("SKU", sku);
    formData.append("material", JSON.stringify(material));
    formData.append("picture", image);
    formData.append("variations", JSON.stringify(variations));
    formData.append("collectionId", collectionId);


    $.ajax({
        url: '/api/products/add',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(data){
            window.location.reload();
        }
    });
}

function toForm1Click(event){
    $(".form-1").show();
    $(".form-2").hide();
    $("#next-form-button").text("Next");
    $("#back-form-button").hide();
}

function toForm2Click(event){
    
    $("#next-form-button").text() === "Submit" ? submitProduct(event) : nextForm(event);    





}


function clearForm() {
    $('.form-1').show();
    $('.form-2').hide();
    $('#next-form-button').text('Next');
    $('#back-form-button').hide();


    $('.add-product-title').text('Add Product');
    editingProductId = null;
    $('#product-name-input').val('').removeClass('correct-input wrong-input');
    $('#product-price-input').val('').removeClass('correct-input wrong-input');
    $('#product-sku-input').val('').removeClass('correct-input wrong-input');
    $('#material-list').empty();
    tagList = [];
    $('.main-picture img').remove();
    $('<img>').attr('src', "/assets/upload-icon.png").attr('alt', "upload").attr('id', 'upload-icon').appendTo('.main-picture');
    const variationContainer = $('.add-row-frame');
    variationContainer.empty(); // Remove all rows
    addVariation();

}


function addVariation() {
    var newVariationRow = $('<div>').addClass('add-product-variation-row'); 
    newVariationRow.append('<span class="delete-row-icon">x</span>');
    $(newVariationRow).find('.delete-row-icon').click(deleteRow);
    newVariationRow.append('<input type="text" placeholder="Variation" class="product-form-variation table-type">');
    $(newVariationRow).find('.product-form-variation').on('keyup', validateProductName);
    newVariationRow.append('<input type="number" placeholder="Stock" class="product-form-stock table-type">');
    $(newVariationRow).find('.product-form-stock').on('keyup', validateStockInput)
    newVariationRow.append('<input type="number" placeholder="Manufacturing Cost" class="product-form-manucost table-type">');
    $(newVariationRow).find('.product-form-manucost').on('keyup', validatePriceInput)
    $('.add-row-frame').append(newVariationRow);
}

