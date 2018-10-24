var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");
var app = express();
const MongoClient = require('mongodb').MongoClient;
var CONF = require('./config.json')
const mongoConfig = CONF.db.url;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


MongoClient.connect(mongoConfig,{ useNewUrlParser: true }).then(client => {
    console.log('mongo connected');
    let db = client.db(CONF.db.name);
    routes(app, db);
    var server = app.listen(CONF.api.port, function () {
        console.log("Server running on port.", server.address().port);
    });
})
.catch(e => {console.log(e); return null;} );
