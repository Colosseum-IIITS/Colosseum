// Get the modal and buttons
const modal = document.getElementById('modal');
const editButton = document.querySelector('.edit-button');
const closeButton = document.querySelector('.close');
const changePictureButton = document.querySelector('.change-picture');
const removePictureButton = document.querySelector('.remove-picture');
const fileInput = document.getElementById('file-input');

// When the user clicks on the Edit button, open the modal
editButton.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// When the user clicks on the Close button, close the modal
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// When the user clicks the Change Picture button, trigger file input
changePictureButton.addEventListener('click', () => {
    fileInput.click();
    modal.style.display = 'none'; // Close the modal
});

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
removePictureButton.addEventListener('click', () => {
    const confirmation = confirm('Are you sure you want to remove your profile picture?');
    if (confirmation) {
        document.querySelector('.profile-picture img').src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...'; // Placeholder image
        alert('Profile picture removed.');
        modal.style.display = 'none'; // Close the modal after the action
    }
});

// // Handle form submission to update profile
// document.getElementById('profileForm').addEventListener('submit', async function (event) {
//     event.preventDefault();

//     const formData = new FormData(this);
//     for (const [key, value] of formData.entries()) {
//         console.log(`${key}: ${value}`);  // Log the form data to see what's being sent
//     }
//     try {
//         const response = await fetch('/player/api/updateProfile', {
//             method: 'POST',
//             body: formData,
//             headers: {
//                 'Authorization': `Bearer ${yourJWT}`, // Ensure yourJWT is defined
//             },
//         });
//         const data = await response.json();
//         console.log(data);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });
