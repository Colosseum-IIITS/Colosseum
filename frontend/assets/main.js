// Function to handle redirection to signin page with role parameter
function redirectToSignin(role) {
    window.location.href = `signin?role=${role}`;
}

// If you want to add any further interactivity
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
document.querySelectorAll('.play-word').forEach(word => {
    word.addEventListener('mouseover', event => {
        let iterations = 0;
        const interval = setInterval(() => {
            event.target.innerText = event.target.innerText
                .split("")
                .map((letter, index) => {
                    if (index < iterations) {
                        return event.target.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");
            if (iterations >= event.target.dataset.value.length) {
                clearInterval(interval);
            }
            iterations += 1 / 3;
        }, 30); 
    });
});