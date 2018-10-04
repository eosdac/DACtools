const eosjs = require('eosjs');
// const mysql = require('mysql');
const MongoClient = require('mongodb').MongoClient;
const colors = require('colors/safe');
var CONF = require('../api/config.json')

class WatchActions {

	constructor() {

		var self = this;

		this.listen_for_account = 'dacelections';

		this.sleep = 1;
		this.offset = 99999999999999999; //this is a hack

		this.start_account_action_seq = -1; //start from specific account action sequence. -1 = resume mode
		this.mongoConfig = CONF.db.url;

		this.latest_seq = null;

		this.eos = eosjs({
		    chainId: CONF.watcher.chainId, // 32 byte (64 char) hex string aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906
		    httpEndpoint: CONF.watcher.httpEndpoint,
		});
		console.log(colors.green('Connected to EOS network!') );

		this.daemon();
		// this.getAllActions();
	}

	async daemon(){
		var self = this;

		if(!this.db){
			this.db = await MongoClient.connect(this.mongoConfig,{ useNewUrlParser: true })
						.then(client => {
							console.log(colors.green('mongo connected'));
							let db = client.db(CONF.db.name);
							return db;
						})
						.catch(e => {console.log(colors.red(e)); return null;} );

			if(this.start_account_action_seq === -1){//resume mode
				try{
					let last = await this.db.collection('state').findOne({_id: 1});
					// console.log(last);
					this.start_account_action_seq = last.irr_seq;
					console.log(this.start_account_action_seq);
				}catch(e){
					console.log(colors.red('could not get last irrevirsible seq from database.'));
					console.log(colors.yellow(e));
					return false;
				}
			}
		}

		let actions = await self.getAllActions();

		await self._sleep(self.sleep*1000);
		self.daemon();

	}

	getAllActions(){

		var self = this;

		return this.eos.getActions({account_name: this.listen_for_account ,pos:this.start_account_action_seq+1, offset: self.offset}).then( async function(a){

				if(!a.actions.length){
					console.log(colors.yellow('no new actions found after seq '+self.start_account_action_seq ));
					return false;
				}

				console.log(colors.magenta(`${self.start_account_action_seq+1} - ${self.start_account_action_seq+a.actions.length}`))
				let latest_irrevirsible_seq = self.start_account_action_seq;
				a.actions.forEach(async function(x, i, arr){

					//ignore actions that come from other contracts
					if(x.action_trace.act.account !== self.listen_for_account){
						return false;
					}

					let data = {}; //object to store in db
					data.account_action_seq = x.account_action_seq;
					data.actiontype = x.action_trace.act.name;
					data.block_num = x.block_num;
					data.last_irreversible_block = a.last_irreversible_block;
					data.block_time = x.block_time;
					data.txid = x.action_trace.trx_id;
					data.irrevirsible = false;

					if(data.block_num <= a.last_irreversible_block ){
						data.irrevirsible = true;
						latest_irrevirsible_seq = x.account_action_seq;
					}

					switch (data.actiontype) {
						case 'stprofileuns':
							console.log('found '+ data.account_action_seq +' irrevirsible:'+ data.irrevirsible);
							data._id = x.action_trace.act.data.cand;
							data.profile = JSON.parse(x.action_trace.act.data.profile);
							// console.log(data)
							try{
								await self.db.collection('test').updateOne({ _id: data._id }, {$set:data}, { upsert: true } );
							}catch(e){
								console.log(colors.yellow(e));
								return false;
							}
					        break;

					    default:
					        console.log(colors.red('Unknown Action!') );
					};

				});

				if(latest_irrevirsible_seq > self.start_account_action_seq){
					try{
						await self.db.createCollection("state", { capped : true, size: 4096, max : 1 } );
						await self.db.collection('state').replaceOne({ _id: 1 }, {_id: 1, irr_seq: latest_irrevirsible_seq}, { upsert: true } );
						self.start_account_action_seq = latest_irrevirsible_seq;
					}catch(e){
						console.log(colors.yellow(e));
					};

				}
				return true;
		})
		.catch(x => console.log(x) );
	}

	_sleep(t) {
    	return new Promise(resolve => setTimeout(resolve, t));
	}


}//end class

test = new WatchActions();
