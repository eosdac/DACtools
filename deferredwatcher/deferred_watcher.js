const fetch = require('node-fetch');
const mongoose = require('mongoose');
const eosjs = require('eosjs');
const {TextEncoder,TextDecoder} = require('util');

const rpc_endpoint = 'https://eu.eosdac.io';
const url = rpc_endpoint + '/v1/chain/get_scheduled_transactions';
const mongo_uri = 'mongodb://localhost:27017/eos_deferred';

const defaultPrivateKey = "5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr"; // useraaaaaaaa
const signatureProvider = new eosjs.JsSignatureProvider([defaultPrivateKey]);
const rpc = new eosjs.JsonRpc(rpc_endpoint, { fetch });


var api = new eosjs.Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });



let tx_history = {};
mongoose.connect(mongo_uri);

var Schema = mongoose.Schema;
var deferredSchema = new Schema({
    trx_id: { type: String, required:true, index: {unique:true} },
    sender: { type: String, index:true },
    sender_id: String,
    payer: String,
    delay_until: { type:Date, index:-1 },
    expiration: { type:Date, index:-1 },
    published: { type: Date, index:-1 },
    transaction: String,
    transaction_obj: {}
});


async function preSave(next){
    try {
        this.transaction_obj = await api.deserializeTransactionWithActions(this.transaction);
    }
    catch (e){}

    next();
}
deferredSchema.pre("save", preSave);


var Deferred = mongoose.model('Deferred', deferredSchema);




const processTransactions = async transactions => {
  transactions.forEach((tx) => {
    var eq = Deferred.where({trx_id:tx.trx_id});
    var tx_obj = new Deferred(tx);

    eq.findOne((err, existing) => {
        if (err || !existing){
          console.log('Adding new transaction ' + tx.trx_id);
          tx_obj.save(function (err, saved) {
            if (err) {return console.error(err);}
          });
        }
    });

  });
};

const process = async lower => {
  try {
    lower = lower || '';
    const body = '{"lower_bound":"'+lower+'", "limit":100}';
    try {
      const response = await fetch(url, { method: 'POST', body: body });
      const json = await response.json();

      processTransactions(json.transactions);

      if (json.more){
        process(json.more);
      }
      else {
        setTimeout(() => {process()}, 5000);
        console.log("Restarting");
        //process();
      }
    }
    catch (e){
      console.error(e);
      setTimeout(() => {process(lower)}, 5000);
      return;
    }

    //console.log(json);
  } catch (error) {
    console.error(error);
  }
};


process();
