function isAuthenticated(req, res, next) {
    res.locals.loggedIn = req.session.userId ? true : false;
    res.locals.loggedUsername = req.session.username;
    res.locals.userId = req.session.userId;
    res.locals.userRole = req.session.userRole;

    console.log(`User is logged in: ${res.locals.loggedIn}`);

    if (!res.locals.loggedIn) {
        res.redirect('/login');
    } else {
        next();
    }
}

function isAdmin(req, res, next) {
    if (req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admins only' });
    }
}

module.exports = { isAuthenticated, isAdmin };
