

var appRouter = function (app, db) {

    app.get("/profile/:account", async function (req, res) {

        let account = req.params.account;

        if (account.length >= 3) {
            db.collection('test').find({_id: account}).toArray((err, result) => {
                if (err) return console.log(err);

                res.status(200).send(result);
            });
            
        } 
        else {
            res.status(400).send({ message: 'invalid account supplied' });
        }
    });




}

module.exports = appRouter;