const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const users = require('../models/data/data-users.json');
const User = require('../models/User')

/*
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function createUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        for (let user of users) {
            user.password = await hashPassword(user.password);
            const newUser = new User(user);
            await newUser.save();
        }

        console.log('Users have been created');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating users:', error);
    }
}
*/

async function checkExistingEmail(req, res) {
    const email = req.body.email;

    console.log(req.body.email);

    User.findOne({email: email}).then(user =>{
        if(user){
            console.log("Email taken.");
            res.send({ success: false, message: 'Email is already in use.'});
        } else {
            res.send({ success: true, message: 'Email is available.'})
        }
    })
}

async function checkExistingUsername(req, res) {
    const username = req.body.username;

    User.findOne({username: username}).then(user =>{
        if(user){
            res.send({ success: false, message: 'Username is already in use.'});
        } else {
            res.send({ success: true, message: 'Username is available.'})
        }
    })
}

async function createUser(req, res) {
    try {
        const { firstName, lastName, password, email, username, selectedRole } = req.body;
        let newUser;
        console.log("SELECTED ROLE: " + selectedRole);
        try {
                newUser = new User({
                firstName,
                lastName,
                password,
                email,
                username,
                role: selectedRole,
                profilePicture: req.file.filename
            })
        } catch (err) {
                newUser = new User({
                firstName,
                lastName,
                password,
                email,
                username,
                role: selectedRole,
                profilePicture: 'default.jpg'
            })
        }

        console.log(newUser);
        await newUser.save();
        res.send({ success: true, message: 'User successfully created!'})
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
}

async function viewDashboard(req, res) {
    try {
        const admins = await User.find({ role: 'admin' }).lean();
        const adminCount = admins.length;

        const nonAdmins = await User.find({ role: { $ne: 'admin' } }).lean();
        const nonAdminCount = nonAdmins.length;

        console.log(admins);
        console.log(nonAdmins);
        console.log("Admins: " + adminCount + " Non-admins: " + nonAdminCount);

        // Check if the current user is an admin
        const isAdmin = req.session.userRole === 'admin';

        res.render('users', { adminCount, admins, nonAdminCount, nonAdmins, isAdmin }); // Pass the isAdmin boolean to the 'users' template
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error!");
    }
}


async function getProfile(req, res) {
    try {
        const userId = req.session.userId; // Retrieve user ID from session
        if (!userId) {
            console.error('User ID is not available in req.session');
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findById(userId).select('-password'); // Exclude password field
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Fetched user profile:', user); // Add logging
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.session.userId; // Retrieve user ID from session
        const { firstName, lastName, role, password } = req.body;
        let profilePicture;

        if (req.file) {
            profilePicture = req.file.filename;
        }

        const updatedData = {
            firstName,
            lastName,
            role
        };

        if (profilePicture) {
            updatedData.profilePicture = profilePicture;
        }

        if (password) {
            // const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = password;
        }

        req.session.userRole = req.body.role;

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        console.log('Updated user profile:', user); // Add logging
        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

async function getNonAdminDetails (req, res){
    const userId = req.query.id;

    try {
        const user = await User.findById(userId).select('firstName lastName role');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch user details' });
    }
}

async function updateNonAdminDetails(req, res) {
    if (req.session.userRole !== 'admin') {
        return res.status(403).send({ success: false, message: 'Access denied. Admins only.' });
    }

    const { id, firstName, lastName, role } = req.body;

    try {
        await User.findByIdAndUpdate(id, { firstName, lastName, role });
        res.send({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Failed to update user details' });
    }
}

async function checkIfAdmin(req, res) {
    try {
        const userId = req.query.id;
        const user = await User.findById(userId);

        if (user) {
            res.json({ isAdmin: user.role === 'admin' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    viewDashboard,
    getProfile,
    updateProfile,
    getNonAdminDetails,
    updateNonAdminDetails,
    checkIfAdmin,
    checkExistingEmail,
    checkExistingUsername,
    createUser
}