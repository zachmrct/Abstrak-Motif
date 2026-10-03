// modules
const _ = require('dotenv').config(); 
const path = require('path');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const exphbs = require('express-handlebars');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const mongoConnector = require('./src/models/db.js');
const router = require('./src/routes/router.js');
const { loadCollections, loadProducts, loadUsers, processCsvData, loadVouchers  } = require('./src/routes/loader.js');

const app = express();

function initializeSessionManagement(){
    app.use(session({
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        store: new MemoryStore({
          checkPeriod: 86400000 
        }),
        resave: false,
        secret: 'keyboard cat',
        saveUninitialized: true
    }));
}


async function connectToDB (){
    try {
        mongoConnector();
        console.log(`Now connected to DB`);

    } catch (err){
        console.log(`Connection to DB failed`)
        console.log(err);
    }

}
const productsJson = "src/models/data/Orders.csv";

async function initializeLoad(){
    await loadCollections();
    await loadProducts();
    await loadUsers();
    await processCsvData(productsJson);
    await loadVouchers();
}

function initializeHandlebars() {
    const { allowProtoMethodsByDefault, allowProtoPropertiesByDefault } = require('@handlebars/allow-prototype-access');
    // const exphbs = require('express-handlebars');
    app.engine("hbs", exphbs.engine({
        extname: "hbs",
        defaultLayout: false,
        helpers: {
            stockStatus: function(stock) {
                if (stock == 0) {
                    return "no";
                } else if (stock <= 3) {
                    return "low";
                } else {
                    return "high";
                }
            },
            formatDate: function(date) {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return new Date(date).toLocaleDateString(undefined, options);
            },
            json: function(context) {
                return JSON.stringify(context);
            },
            eq: function (a, b) {
                return a === b;
            }
        },
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }
    }));
    app.set("view engine", "hbs");
    app.set("views", "./src/views");
}





function initializeStaticFolders() {
    app.use(express.static(path.join(__dirname, 'public')));

}

async function main() {
    initializeSessionManagement();
    initializeStaticFolders();
    initializeHandlebars();

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(router);
    // use routing file

    app.listen(process.env.SERVER_PORT, connectToDB());

    await initializeLoad();
    
}

main()