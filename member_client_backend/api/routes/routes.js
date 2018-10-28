var CONF = require('../config.json');
const mc =require("../mailchimp.js");

var appRouter = function (app, db) {

    app.get("/profile/:account", async function (req, res) {
        let account = req.params.account;
        if (account.length >= 3 && account.length <= CONF.api.routes['/profile/:account'].max) {
            db.collection('profiles').find({_id: account}).toArray((err, result) => {
                if (err) return console.log(err);

                res.status(200).send(result);
            });

        }
        else {
            res.status(400).send({ message: 'invalid account supplied' });
        }
    });
    
    app.post("/profiles", async function (req, res) {
      let accounts = req.body
      if (accounts.length >= 1 && accounts.length <= CONF.api.routes['/profiles'].max) {
        db.collection('profiles').find({_id:{ $in: accounts }} ).toArray((err, result) => {
          if (err) return console.log(err);
            res.status(200).send(result);
        });
      }
      else {
        res.status(400).send({ message: 'invalid accounts supplied' });
      }
    });

    app.post("/subscribe", async function (req, res) {
        let data = req.body;
        if (data.email && data.language) {
            let msg = await mc.mailchimpAddToList(data.email, data.language);
            res.status(200).send({ message: msg });
        }
        else {
            res.status(400).send({ message: 'invalid request!' });
        }
    });

}

module.exports = appRouter;