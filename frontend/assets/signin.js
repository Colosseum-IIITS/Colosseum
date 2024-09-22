const role = "<%= role %>";

// Redirect to sign-up page with role if needed
function redirectToSignup() {
    window.location.href = `signup.html?role=${role}`;
}