// Global variable to store user data
let currentUserData = null;
$(document).ready(function() {
    // Function to open edit modal with user details
    $(".user-card").click(function() {
        var userId = $(this).data('id');

        // Check if the user is an admin
        $.ajax({
            url: '/checkIfAdmin', // Endpoint to check if user is an admin
            type: 'GET',
            data: { id: userId },
            success: function(response) {
                if (response.isAdmin) {
                   return;
                } else {
                    // Fetch user details if not an admin
                    $.ajax({
                        url: '/getUserDetails', // Endpoint to get user details
                        type: 'GET',
                        data: { id: userId },
                        success: function(user) {
                            $("#headername").text(`Edit ${user.firstName}'s profile`);
                            $("#edit-first-name-input").val(user.firstName);
                            $("#edit-last-name-input").val(user.lastName);
                            $("#edit-role-input").val(user.role);

                            // Store user data globally
                            currentUserData = {
                                id: user._id,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                role: user.role
                            };

                            $(".edit-user-modal").show();
                        },
                        error: function(error) {
                            console.log(error);
                            Swal.fire('Error', 'Failed to fetch user details', 'error');
                        }
                    });
                }
            },
            error: function(error) {
                console.log(error);
                Swal.fire('Error', 'Failed to check user role', 'error');
            }
        });
    });

    // Function to close the modals
    $(".exit, .exit-edit").click(function() {
        $(".add-user-modal, .edit-user-modal").hide();
    });

    // Function to save changes
    $(".submit-edit-user-button").click(function() {
        // Validate fields
        var firstName = $("#edit-first-name-input").val().trim();
        var lastName = $("#edit-last-name-input").val().trim();
        var role = $("#edit-role-input").val();
        
        if (!firstName || !lastName || !role) {
            Swal.fire('Validation Error', 'All fields are required.', 'warning');
            return;
        }

        // Check if there are changes
        if (currentUserData.firstName === firstName &&
            currentUserData.lastName === lastName &&
            currentUserData.role === role) {
            Swal.fire('No Changes', 'No changes were made.', 'info');
            return;
        }

        // Send updated data to server
        $.ajax({
            url: '/updateUserDetails', // Endpoint to update user details
            type: 'POST',
            data: {
                id: currentUserData.id,
                firstName: firstName,
                lastName: lastName,
                role: role
            },
            success: function(response) {
                Swal.fire('Success', 'User details updated successfully', 'success').then(() => {
                    // Hide the edit modal
                    $(".edit-user-modal").hide();
                    // Reload the page
                    location.reload();
                });
                
            },
            error: function(error) {
                console.log(error);
                Swal.fire('Error', 'Failed to update user details', 'error');
            }
        });
    });$(".exit").click(function(event){
        $(".add-user-modal").hide();
        $(".admin-roles").hide();
        $(".non-admin-roles").hide();
    });

    $("#add-admin-button").click(function(event){
        $(".add-user-modal").show();
        $(".admin-roles").show();
        document.querySelector(".admin-roles").selected = true;
    })

    $("#add-non-admin-button").click(function(event){
        $(".add-user-modal").show();
        $(".non-admin-roles").show();
        
        document.querySelector(".non-admin-roles").selected = true;
    })

    $(".main-picture").click(function(event){
        $("#image-input").click();
    });

    $("#image-input").click(function(event){
        event.stopPropagation();
    });

    $("#image-input").change(function(event){
        var file = this.files[0];
        var reader = new FileReader();

        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (validImageTypes.includes(file.type)) {
                console.log('Valid image file:', file.name);
                $(".user-photo-container").remove();

                mediaContainer = $(".main-picture")
                reader.onload = function(e){
                    const photoContainer = document.createElement('div');
                    photoContainer.className = 'user-photo-container';

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'user-photo';
                    photoContainer.appendChild(img);

                    mediaContainer.append(photoContainer);

                }
                reader.readAsDataURL(file);
                // You can handle the valid image here (e.g., upload to server)
            } else {
                Swal.fire('Error', 'Please upload an image.', 'error');
            }
        }
    });

    $("#email-input").keyup(function(event){
        $.ajax({
            url: "/api/users/checkEmail",
            type: "POST",
            data: {email: $(this).val()},
            success: function(data){
                if (data.success) {
                    $("#email-input").removeClass("wrong-input unavailable");
                    $("#email-input").addClass("correct-input available");
                    console.log("hi");
                }
                else {
                    $("#email-input").removeClass("correct-input available");
                    $("#email-input").addClass("wrong-input unavailable");
                }
            }
        });
    });

    $("#username").keyup(function(event){
        $.ajax({
            url: "/api/users/checkUsername",
            type: "POST",
            data: {username: $(this).val()},
            success: function(data){
                if (data.success) {
                    $("#username").removeClass("wrong-input unavailable");
                    $("#username").addClass("correct-input available");
                }
                else {
                    $("#username").removeClass("correct-input available");
                    $("#username").addClass("wrong-input unavailable");
                }
            }
        });
    });
    
    $("#role-selection").change(function(event) {
        console.log($("#role-selection").val());
    })

    $(".submit-user-button").click(function(){
        const $textInputs = $('.add-user-text-input');

        let filled = true; // Assume they all have values initially

        $textInputs.each(function() {
            const inputValue = $(this).val().trim(); // Get the trimmed value
            if (inputValue === '') {
                filled = false; // At least one input is empty
                return; // Exit the loop early
            }
        });
        
        if(!filled) {
            //If there is a field left blank, shoot an error message.
            Swal.fire('Error', 'Please don\'t leave any blank fields.', 'error');
        } else if(!checkPassword()) {
            //If password and password confirmation don't match, shoot an error message.
            Swal.fire('Error', 'Password does not match!', 'error');
        } else if($("#email-input").hasClass("unavailable")) {
            //If email is already taken, shoot an error message.
            Swal.fire('Error', 'Email is already taken!', 'error');
        } else if($("#username").hasClass("unavailable")) {
            //If username is already taken, shoot an error message.
            Swal.fire('Error', 'Username is already taken!', 'error');
        }
        else { //No errors. Should lead to a successful user creation.
            var firstName = $("#firstName-input").val().trim();
            var lastName = $("#lastName-input").val().trim();
            var password = $("#password").val().trim();
            var confirmPassword = $("#password-confirmation").val().trim();
            var email = $("#email-input").val().trim();
            var selectedRole = $("#role-selection").val();
            var username = $("#username").val().trim();
            var image = $("#image-input")[0].files[0];
            console.log(selectedRole);
            
            var formData = new FormData();
            
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("password", password);
            formData.append("confirmPassword", confirmPassword);
            formData.append("email", email);
            formData.append("selectedRole", selectedRole);
            formData.append("username", username);
            formData.append("profilePicture", image);
            $.ajax({
                url: "/api/users/add",
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                success: function(data){
                    Swal.fire({
                        icon: 'success',
                        title: 'User Created',
                        text: 'The user has been created successfully.',
                        showConfirmButton: false // Hide the default "OK" button
                    });
        
                    // Close the modal after 3 seconds (for example)
                    setTimeout(() => {
                        Swal.close(); 
                        window.location.reload();
                    }, 1500);
                },
                error: function(xhr, status, error) {
                    Swal.fire('Error', 'There was an error creating the user.', 'error');
                }
            });
        }
    });

    $('.add-user-text-input').on('keyup', validateField);

    $('#password-confirmation').on('keyup', checkPassword);
});

// Helper functions
function validateField(){
    if($(this).val() === "") {
        $(this).removeClass('correct-input').addClass('wrong-input');
    } else {
        $(this).removeClass('wrong-input').addClass('correct-input');
    }
}
function checkPassword() {
    const password = $('#password').val();
    const confirmation = $('#password-confirmation').val();

    if (password === confirmation) {
        $('#password').removeClass('wrong-input').addClass('correct-input');
        $('#password-confirmation').removeClass('wrong-input').addClass('correct-input');
        return true;
    } else {
        $('#password').removeClass('correct-input').addClass('wrong-input');
        $('#password-confirmation').removeClass('correct-input').addClass('wrong-input');
        return false;
    }
}
