const role = "<%= role %>";

    // Change form action based on the role
    const form = document.getElementById('signupForm');
    if (role === 'Player') {
        form.action = '/auth/player/signup';
    } else if (role === 'Organiser') {
        form.action = '/auth/org/signup';
    }