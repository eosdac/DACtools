const eosjs = require('eosjs');
// const mysql = require('mysql');
const  mysql = require('mysql2/promise');
const pMap = require('p-map');
const WebSocket = require('ws');
const colors = require('colors/safe');



class WatchActions {

	constructor() {

		var self = this;

		this.listen_for_account = 'eosdactokens';

		this.deamonize = 3; //seconds, 0 is disabled
		this.offset = 99999999999999999; //this is a hack

		this.start_account_action_seq = 0;

		this.db_config = { host: "localhost", user: "root", password: "Hbm2023;", database: "eosdac_explorer" };
		

		this.eos = eosjs({
		    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', // 32 byte (64 char) hex string
		    httpEndpoint: 'http://147.75.78.129:8866', 
		});
		console.log(colors.green('Connected to EOS network!') );

		this.enableSocketServer = false;

		if(!this.deamonize){
			this.loop();	
		}
		else{
			this.deamon();
		}
		

	}

	async deamon(){
		var self = this;
		if(this.db == undefined){
			this.db = await mysql.createConnection(this.db_config);
		}
		let sql = `SELECT account_action_seq FROM transfers WHERE confirmed = 1 ORDER BY account_action_seq DESC LIMIT 1`;
		var [rows, fields] = await self.db.execute(sql);
		if(rows[0] != undefined){
			self.start_account_action_seq = rows[0].account_action_seq+1;
		}
		else{
			self.start_account_action_seq = 0;
		}
		// console.log(self.start_account_action_seq)

		let actions = await self.getAllActions();

		await self._sleep(self.deamonize*1000)
		self.deamon();

	}

	getAllActions(){

		var self = this;
		return this.eos.getActions({account_name: this.listen_for_account ,pos:this.start_account_action_seq, offset: self.offset}).then( async function(a){
				// console.log(a)
				if(a.actions.length == 0){
					console.log(colors.green('No new actions')+ colors.yellow(`(latest: ${self.start_account_action_seq-1})`));
					return false;
				}

				console.log('Processing actions: '+ self.start_account_action_seq +' - '+(a.actions.length+self.start_account_action_seq -1) );
				a.actions.forEach(async function(x, i, arr){

					let data = {};
					data.account_action_seq = x.account_action_seq;
					data.actiontype = x.action_trace.act.name;
					data.block_num = x.block_num;
					data.block_time =x.block_time;
					data.confirmed = false;

					if(data.block_num <= a.last_irreversible_block ){
						data.confirmed = true;
					}

					switch (data.actiontype) {
					    case 'transfer':
							data._from = x.action_trace.act.data.from;
							data._to = x.action_trace.act.data.to;
							let temp = x.action_trace.act.data.quantity.split(' ');
							data._quantity = temp[0];
							data._symbol = temp[1];
							data._memo = x.action_trace.act.data.memo;
							data.txid = x.action_trace.trx_id;

							let sql = `INSERT INTO transfers SET ? ON DUPLICATE KEY UPDATE confirmed = ${data.confirmed}`;
							var [rows, fields] = await self.db.query(sql, data);
							if(data.confirmed && self.enableSocketServer){
								self.wss.broadcast(JSON.stringify([data]) );
							}
							
					        break;

					    default:
					        console.log(colors.red('Unknown Action!') );
					};

				});
				return true;
			
		})
		.catch(x => console.log(x) );
	}

	_sleep(t) {
    	return new Promise(resolve => setTimeout(resolve, t));
	}


}//end class

test = new WatchActions();