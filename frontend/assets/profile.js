document.addEventListener('DOMContentLoaded', function () {
    // Get the modal and buttons
    const modal = document.getElementById('modal');
    const editButton = document.getElementById('editPictureButton');
    const closeButton = document.querySelector('.close');
    const changePictureButton = document.querySelector('.change-picture');
    const removePictureButton = document.querySelector('.remove-picture');
    const fileInput = document.getElementById('file-input');

    // If editButton is not found, output an error to the console
    if (!editButton) {
        console.error("Edit button not found. Make sure the HTML contains the 'edit-button' class.");
    } else {
        // When the user clicks on the Edit button, open the modal
        editButton.addEventListener('click', (event) => {
            event.stopPropagation();
            modal.style.display = 'flex';
        });
    }

    // When the user clicks on the Close button, close the modal
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // When the user clicks the Change Picture button, trigger file input
    if (changePictureButton) {
        changePictureButton.addEventListener('click', () => {
            fileInput.click();
            modal.style.display = 'none'; // Close the modal
        });
    }

    // When a file is selected, update the profile picture
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.querySelector('.profile-picture img').src = e.target.result; // Update profile picture
            };
            reader.readAsDataURL(file);
        }
    });

    // Add event listener to the "Remove Picture" button
    if (removePictureButton) {
        removePictureButton.addEventListener('click', () => {
            const confirmation = confirm('Are you sure you want to remove your profile picture?');
            if (confirmation) {
                document.querySelector('.profile-picture img').src = '/images/default-profile.png'; // Default image
                alert('Profile picture removed.');
                modal.style.display = 'none'; // Close the modal after the action
            }
        });
    }
});