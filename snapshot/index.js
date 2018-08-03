const eosjs = require('eosjs');
const mysql = require('mysql');
const pMap = require('p-map');
const colors = require('colors/safe');



class WatchActions {

	constructor() {
		var self = this;

		this.listen_for_account = 'eosdactokens';

		this.deamonize = false; //todo

		this.start_account_action_seq = 0;

		this.db_config = { host: "localhost", user: "kasperfish", password: "hbm2023", database: "eosdac" };
		this.db = mysql.createConnection(this.db_config);

		this.eos = eosjs({
		    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', // 32 byte (64 char) hex string
		    httpEndpoint: 'http://147.75.78.129:8866', 
		});
		console.log(colors.green('Connected to EOS network!') );

		this.loop();

	}

	async loop(){
		console.log(colors.magenta('\nRetrieving Actions from node...'));
		let more = await this.getAllActions();

		if(more){
			this.loop();
		}

	}

	getAllActions(){
		let offset = 9999999999999999; //hack to get all latest actions without knowing the latest action_seq.
		var self = this;
		return this.eos.getActions({account_name: this.listen_for_account ,pos:this.start_account_action_seq, offset: offset}).then(function(a){
			// console.log(a.actions.length);
			// console.log(a.time_limit_exceeded_error);

			let actions = a.actions;
			
			if(!actions.length ){
				console.log(colors.green('Up to date, No new actions found!'));
				self.db.end();
				return false;
			}
			else{
				let t = self.flag==undefined ? self.start_account_action_seq : self.start_account_action_seq+1;
				console.log('Processing actions: '+ t +' - '+(actions.length+self.start_account_action_seq) );

				var last_confirmed_action_seq = 0;

				actions.forEach(function(x, i, arr){

					let data = {};
					data.account_action_seq = x.account_action_seq;
					data.actiontype = x.action_trace.act.name;
					data.block_num = x.block_num;
					data.block_time =x.block_time;
					data.confirmed = false;

					if(data.block_num <= a.last_irreversible_block ){
						last_confirmed_action_seq = x.account_action_seq;
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

							let sql = `INSERT INTO actions SET ? ON DUPLICATE KEY UPDATE confirmed = ${data.confirmed}`;
							var query = self.db.query(sql, data, function (error, results, fields) {
							  if (error) throw error;
							});
					        break;

					    default:
					        console.log(colors.red('Unknown Action!') );
					};

					if(i === arr.length - 1){
						self.start_account_action_seq = last_confirmed_action_seq+1;
					}
				});
				self.flag = true;
				return true;
			}
		})
		.catch(x => console.log(x) );
	}

	getbalance(row){
		var self =this;
		// console.log({code: this.token.account, symbol: this.token.symbol, account: row.account });
		return this.eos.getCurrencyBalance({code: self.token.account, symbol: self.token.symbol, account: row[self.column_name_accounts] }).then(function(bal){
			if(bal[0]==undefined){
				console.log(colors.red(`${row[self.column_name_accounts]} has no ${self.token.symbol} in its account.`));
				self.pool.execute(`UPDATE ${self.table_name} set trx='' WHERE ${self.column_name_accounts} = '${row[self.column_name_accounts]}'`);
				self.verification_results.not_received++;
				return false;

			}

			let b = bal[0].slice(0, -(self.token.symbol.length + 1) );
			b = parseFloat(b);
			row[self.column_name_token_amount] = parseFloat(row[self.column_name_token_amount]);

			if(b == row[self.column_name_token_amount] ) {
				console.log(colors.green(`Match -> db: ${row[self.column_name_token_amount]} chain: ${b}`));
				self.verification_results.correct++;
				return true;
			}
			else{
				console.log(colors.red(`Missmatch -> db: ${row[self.column_name_token_amount]} chain: ${b}`));
				self.verification_results.mismatch++;
				return false;
			}

		}).catch(e => {
			console.log(colors.yellow(e) );
			self.verification_results.con_error++;
		} );
	}

	async verify(){
		this.verification_results={correct: 0, not_received: 0, mismatch: 0, con_error: 0};
		if(this.pool == undefined){
	  		this.pool = await this._initMysql();
  		}
		console.log(colors.blue.underline(`Start verifying ${this.token.symbol} balances`));
		const [rows, fields] = await this.pool.execute(this.verify_query);
		console.log(`found ${rows.length} accounts with txid in database\n`);
  		const mapper = row => this.getbalance(row).then(res => {return res }).catch(e => {console.log('MAPPER: '+e) });
  		let result = await pMap(rows, mapper, {concurrency: this.rpc_speed }).then(result => { return result });

  		console.log(colors.bold.underline(`\nChecked ${rows.length} dropped ${this.token.symbol} accounts`));
  		console.log(colors.green.bold(`\ncorrect: ${this.verification_results.correct}`));
  		console.log(colors.yellow.bold(`not_received: ${this.verification_results.not_received} `)+ '...run the script in drop mode to fix this.');
  		console.log(colors.red.bold(`balance mismatch: ${this.verification_results.mismatch} `)+ '...this needs human investigation!');
  		if(this.verification_results.con_error){
  			 console.log(`network error: ${this.verification_results.con_error} ...decrease rpc speed and try again.`);
  			 //TODO handle these errors for easy resume
  		}
  		this.done();
	}

	_sleep() {
    	return new Promise(resolve => setTimeout(resolve, this.pause_time));
	}


}//end class

test = new WatchActions();