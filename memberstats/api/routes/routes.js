var CONF = require('../config.json');


var appRouter = function (app, db) {

    app.get("/memberstats/", async function (req, res) {

    
            db.collection('memberstats').find().toArray((err, result) => {
                if (err) return console.log(err);

                res.status(200).send(result);
            });



    });
    


}

module.exports = appRouter;
