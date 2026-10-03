$(document).ready(function(){
    $(".main-picture").click(function(event){
        $("#imageInput").click();
    });

    $("#imageInput").click(function(event){
        event.stopPropagation();
    });

    $(".exit").click(function(event){
        $(".add-collection-modal").hide();
    });

    $("#collection-name-input").keyup(function(event){
        if($(this).val() == ""){
            $(this).removeClass("correct-input");
            $(this).addClass("wrong-input");
        } else {
            $(this).removeClass("wrong-input");
            $(this).addClass("correct-input");
        }

        $.ajax({
            url: "/api/collections/checkName",
            type: "POST",
            data: {name: $(this).val()},
            success: function(data){
                if(data.success){
                    $("#collection-name-input").removeClass("wrong-input");
                    $("#collection-name-input").addClass("correct-input");
                } else {
                    $("#collection-name-input").removeClass("correct-input");
                    $("#collection-name-input").addClass("wrong-input");
                }
            }
        });
    
    });

    
    $("#imageInput").change(function(event){
        var file = this.files[0];
        var reader = new FileReader();
        
        $(".collection-photo-container").remove();

        mediaContainer = $(".main-picture")
        reader.onload = function(e){
            const photoContainer = document.createElement('div');
            photoContainer.className = 'collection-photo-container';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'collection-photo';
            photoContainer.appendChild(img);

            mediaContainer.append(photoContainer);

        }
        reader.readAsDataURL(file);
    });

    $(".submit-collection-button").click(function(){
        var name = $("#collection-name-input").val();
        var description = $("#collection-description-input").val();
        var image = $("#imageInput")[0].files[0];
        var formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("collectionPicture", image);
        $.ajax({
            url: "/api/collections/add",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(data){
                if(data.success)
                    window.location.href = "/collections";
            }
        });
    });
});