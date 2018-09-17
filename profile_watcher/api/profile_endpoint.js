var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");
var app = express();
const MongoClient = require('mongodb').MongoClient;

const mongoConfig = 'mongodb://kasperfish:kasper123@ds151012.mlab.com:51012/eosdac';


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


MongoClient.connect(mongoConfig,{ useNewUrlParser: true }).then(client => {
    console.log('mongo connected');
    let db = client.db('eosdac');
    routes(app, db);
    var server = app.listen(3000, function () {
        console.log("Server running on port.", server.address().port);
    });
})
.catch(e => {console.log(colors.red(e)); return null;} );