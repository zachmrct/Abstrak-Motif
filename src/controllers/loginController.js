const User = require('../models/User');

async function loginUser(req, username, password) {
    try {
        const user = await User.findOne({ username });
        if (user) {
            if (user.password === password) {
                req.session.userId = user._id;
                req.session.username = user.username;
                req.session.profilePicture = user.profilePicture;
                req.session.userRole = user.role;
                req.session['loggedIn'] = true;
                return { success: true, redirectUrl: "/collections" }; // Redirect to collections
            } else {
                console.log('Password mismatch');
            }
        } else {
            console.log('User not found');
        }
        return { success: false, message: "Incorrect username or password." };
    } catch (error) {
        console.error('Error during login process:', error);
        return { success: false, message: "Internal Server Error", statusCode: 500 };
    }
}

async function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login'); 
    });
}

async function login(req, res) {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    const loginResult = await loginUser(req, username, password);

    if (loginResult.success) {
        console.log('Login successful');
        return res.redirect(loginResult.redirectUrl);
    } else {
        console.log(`Login failed: ${loginResult.message}`);
        const redirectUrl = loginResult.statusCode === 500 ? '/error' : `/login?loadError=true`;
        return res.redirect(redirectUrl);
    }
}

module.exports = { login, logout };
