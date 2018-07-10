const eosjs = require('eosjs');
const mysql = require('mysql');
const pMap = require('p-map');
const WebSocket = require('ws');
const colors = require('colors/safe');



class WatchActions {

	constructor() {
		var self = this;

		this.listen_for_account = 'eosdactokens';

		this.deamonize = 3; //seconds, 0 is disabled

		this.start_account_action_seq = 0;

		this.db_config = { host: "localhost", user: "root", password: "Hbm2023;", database: "eosdac_explorer" };
		this.db = mysql.createConnection(this.db_config);

		this.eos = eosjs({
		    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', // 32 byte (64 char) hex string
		    httpEndpoint: 'http://147.75.78.129:8866', 
		});
		console.log(colors.green('Connected to EOS network!') );
		this.wss = new WebSocket.Server({ port: 8080 });

this.wss.broadcast = function broadcast(data) {
  self.wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

this.wss.on('connection', function connection(ws) {
	
			let sql = `SELECT * FROM transfers ORDER BY account_action_seq DESC LIMIT 500`;
			var query = self.db.query(sql, async function (error, results, fields) {
				if (error) throw error;
				ws.send(JSON.stringify(results) );
			});
  
});



// this.wss.on('connection', function connection(ws) {

//     // Broadcast to everyone else.
//     wss.clients.forEach(function each(client) {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(data);
//       }
//     });
// });



		if(!this.deamonize){
			this.loop();	
		}
		else{
			this.deamon();
		}
		

	}

	async deamon(){
		var self = this;
		let sql = `SELECT account_action_seq FROM transfers WHERE confirmed = 1 ORDER BY account_action_seq DESC LIMIT 1`;
			var query = self.db.query(sql, async function (error, results, fields) {
				if (error) throw error;
				self.start_account_action_seq = results[0] !=undefined ? results[0].account_action_seq+1: 0;
				await self.getAllActions();
			});
			// self.getAllActions()
			await self._sleep(self.deamonize*1000)
			self.deamon();

	}

	getAllActions(){
		let offset = 100; //hack to get all latest actions without knowing how many.
		var self = this;
		return this.eos.getActions({account_name: this.listen_for_account ,pos:this.start_account_action_seq, offset: offset}).then(function(a){
				let actions = a.actions;
				if(actions.length == 0){
					console.log(colors.green('No new actions')+ colors.yellow(`(${self.start_account_action_seq-1})`));
					return false;
				}

				console.log('Processing actions: '+ self.start_account_action_seq +' - '+(actions.length+self.start_account_action_seq -1) );

				actions.forEach(function(x, i, arr){

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
							var query = self.db.query(sql, data, function (error, results, fields) {
							  if (error) throw error;
							  // self.wss.broadcast(JSON.stringify([data]) );

							});
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