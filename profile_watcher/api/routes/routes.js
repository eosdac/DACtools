var CONF = require('../config.json')

var appRouter = function (app, db) {

    app.get("/profile/:account", async function (req, res) {

        let account = req.params.account;
        if (account.length >= 3 && account.length <= CONF.api.routes['/profile/:account'].max) {
            db.collection('test').find({_id: account}).toArray((err, result) => {
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
        db.collection('test').find({_id:{ $in: accounts }} ).toArray((err, result) => {
          if (err) return console.log(err);
            res.status(200).send(result);
        });
      }
      else {
        res.status(400).send({ message: 'invalid accounts supplied' });
      }
    });

}

module.exports = appRouter;
