/*
Hello, use this script at your own risk. I have tested the script multiple times on the jungletestnetwork with the genesis snapshot as input data without issues. 
We at eosDAC also dropped our tokens on the mainnet with this script. I strongly advice to do numerous test runs on the testnetwork before even attempting doing 
a drop on the mainnet. You really should know how the script works. Anyone is free to use this script because it's made to serve the whole EOS community in 
particular other DACs. If you need help to do a LEGIT airdrop you are free to contact me.
Author: Kasper from eosDAC. (find me on the eosDAC telegram @kasperfish)
*/
const eosjs = require('eosjs');
const mysql = require('mysql2/promise');
const pMap = require('p-map');
const colors = require('colors/safe');



class Drop {
	constructor() {
		//script mode
		var self = this;
		this.script_mode = 'drop';  //drop, verify (for drop verification).

		//sender details
		this.user = {account:'kasperkasper', wif:'xxxxxxxxxxxxxxxxxx'};
		this.user.consumables = { freenet: null, freecpu: null, freeram: null };
		this.auth = { authorization: [ this.user.account+'@active' ] };
		//token account and symbol and memo
		this.token = {account: 'kasperkasper' , symbol: 'BEAST'};
		this.memo ='yooloo';

		//general performance settings
		this.batch_size = 30; //number of accounts processed in each transaction for dropping (minus not existing ones)
		this.rpc_speed = 10; //number of simultanous rpc calls. used for account check and retrieving balance.
		this.pause_time = 0; //pause between each transaction in millis. zero should be fine. on localhost you might need a small pauze ie.250ms
		this.gracefulstop = true; //recommended, it will enable the current transaction to complete before stopping the script (only for drop mode);

		/************IMPORTANT****************
		database settings and schema names
		Add manually 2 columns to your table 
				1) name: trx , default value: '', varchar (80)
				2) name: account_valid, default value: 1, tinyint (1)
		reset table: UPDATE eosdac_sql_master SET trx = '', account_valid =1
		*/
		this.db_config = { host: "localhost", user: "kasperfish", password: "xxxxxxxxxxx", database: "eosdac" };
		this.table_name = 'eosdac_sql_master'; //the table that holds your data
		this.column_name_token_amount = 'eosdac_tokens'; //the column name that holds the token amount that needs to be dropped. Must have correct decimals corresponding to the contract.
		this.column_name_accounts = 'account_name'; //the column name of the accounts that need to be processed.

		//queries... Be careful and double check if you make changes!!!
		//this query get called recursively until none gets selected
		//you need to change this query to match the records/accounts you want to drop to.
		this.drop_query = `SELECT ${this.column_name_accounts}, ${this.column_name_token_amount} 
								FROM ${this.table_name} 
								WHERE ${this.column_name_token_amount} > 0 && iscontract = 0 && isedfallback IS NULL && account_valid != 0 && trx = '' LIMIT ${this.batch_size}`;
		
		//this query is used to verify the token drop. The verification happens through retrieving the on chain balance and comparing it with the value in your table.
		//Mind that this only works if the tokens are sent in a frozen/locked state. If you don't have a token contract with lock function or don't know how to set it
		//up... don't hesitate to contact one of our team members. We are happy to help you. This query doesn't need a change by default but it my be helpfull to verify
		//the on chain token balance for a subset of your eos accounts.
		this.verify_query = `SELECT ${this.column_name_accounts}, ${this.column_name_token_amount} 
								FROM ${this.table_name} 
								WHERE ${this.column_name_accounts} !='' &&  trx != '' `;
								
		this.eos = eosjs({
		    chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca', // 32 byte (64 char) hex string
		    keyProvider: [this.user.wif], // WIF string or array of keys..
		    httpEndpoint: 'http://jungle.dutcheos.io:58888', //http://145.239.252.91:8888 , http://dev.cryptolions.io:38888 , http://jungle.dutcheos.io:58888 , http://27.254.175.2:8888 , http://jungle.cryptolions.io:18888
		    broadcast: true,
		    sign: true,
		    debug: false,
		    expireInSeconds: 60,
		    logger: {error: null}     
		});

		console.log('Connected to EOS network!');
		this._modeSwitcher();
	}

	_initGracefullStop(bool){
		var self = this;
		if(bool){
			process.on('SIGINT', function () {
				console.log('exit event received');
			  	self.gracefulstopflag = 1;
			});		
		}

	}

	_initMysql(){
		return mysql.createConnection(this.db_config)
		.then(mysql => {console.log('Mysql Connected!'); return mysql})
		.catch(e => console.log('Mysql connection error.'))
	}

	_modeSwitcher(){
		switch(this.script_mode) {
		    case 'drop':
		        console.log('Starting in drop mode.');
		        this._initGracefullStop(this.gracefulstop);
		        this.drop();
		        break;
		    case 'verify':
		    	console.log('Starting in verify mode.');
		    	this.verify();
		        break;
		    default:
		        console.log(colors.red(`script mode ${this.script_mode} does not exists!`));
		}

	}

	async drop(){
		var self = this;
		await this._sleep(this.pause_time);
		//only create a mysql connection when not initiated yet
		if(this.pool == undefined){
	  		this.pool = await this._initMysql();
  		}

		// select batch from database  
		// let query = `SELECT ${this.column_name_accounts}, ${this.column_name_token_amount} FROM ${this.table_name} WHERE ${this.column_name_token_amount} > 0 && iscontract = 0 && isfallback IS NULL && account_valid != 0 && trx = '' LIMIT ${this.batch_size}`;
  		const [rows, fields] = await this.pool.execute(this.drop_query);

  		if(!rows.length || this.gracefulstopflag){
  			this.done();
  			return false;
  		}
  		else{
  			console.log(colors.magenta.bold(`\nNext ${this.batch_size} entries`))
  		}

  		//monitor consumables TODO do something with it besides displaying
		let new_consumables = await this.getSenderStats();
		let cost = {};
		cost['ramcost'] = this.user.consumables.freeram - new_consumables.freeram;
		cost['cpucost'] = this.user.consumables.freecpu - new_consumables.freecpu;//volatile returns, can't rely on this
		cost['netcost'] = this.user.consumables.freenet - new_consumables.freenet;
		let morecpu = Math.floor(new_consumables.freecpu/cost.cpucost);
		let morenet = Math.floor(new_consumables.freenet/cost.netcost);
		let moreram = Math.floor(new_consumables.freeram/cost.ramcost);
		this.user.consumables = new_consumables;

		console.log(JSON.stringify(this.user.consumables) );
		console.log(colors.yellow('Previous transaction: '+JSON.stringify(cost)) );
		console.log(colors.yellow(`Number of next rounds possible based on CPU: ${morecpu} NET:${morenet} RAM:${moreram}`) )
  		
  		//verify the accountnames undefined when not valid
  		const mapper = row => this.checkAccount(row).then(res => res).catch(e => {console.log('MAPPER: '+e) });
  		
  		let verified = await pMap(rows, mapper, {concurrency: this.rpc_speed}).then(res => res);

  		//initialize tokencontract only once
  		if(this.tokencontract == undefined){
  			this.tokencontract = await this.eos.contract(this.token.account);
  		}

  		//pack the transaction and push to chain
  		try{
		 	let tx = await this.tokencontract.transaction(tr => {
		 		// tr.nonce(1, {authorization: self.user.account})
				verified.forEach(function(x){
					//can be undefined when accountname was invalid
					if(x != undefined){
						// console.log(JSON.stringify({from: self.user.account, to: x[0], quantity: x[1]+' '+self.token.symbol, memo: self.memo}) )
						tr.transfer({from: self.user.account, to: x[0], quantity: x[1]+' '+self.token.symbol, memo: self.memo});
					}
				})	
			});
			
			//update database only when a txid is received
			if(tx != undefined && tx.hasOwnProperty('transaction_id')){
					console.log('Transaction Id: '+tx.transaction_id);
					let names = verified.map(function(el){
						if(el != undefined){
							return el[0];// accountname
						}
					})
					let db = await this.pool.execute(`UPDATE ${this.table_name} SET trx = '${tx.transaction_id}' WHERE ${self.column_name_accounts} IN ${JSON.stringify(names).replace('[','(').replace(']',')')}`)
					.then(x => {self.drop()})
					.catch(e => {console.log(e)});
						
			}
			else{
				console.log(colors.red('No txid received, trying again...'));
				self.drop();
			}

		}catch(e){
				this._errorHandler(e);
		}
	}

	checkAccount(row){
		var self = this;
		return this.eos.getAccount(row[self.column_name_accounts] ).then( x => {

				if(x.account_name == row[self.column_name_accounts] ){

					console.log(colors.green(x.account_name+' '+row[self.column_name_token_amount]+' '+self.token.symbol));
					return [x.account_name, row[self.column_name_token_amount] ];
				}	
				
		}).catch(e =>{
				self.pool.execute(`UPDATE ${self.table_name} SET account_valid = 0 WHERE ${self.column_name_accounts} = "${row[self.column_name_accounts]}"`).then(()=>{
					console.log(colors.red(row[self.column_name_accounts] +' invalid accountname'));
					return undefined;
				});
			})
	}

	getSenderStats(){
		return this.eos.getAccount(this.user.account).then(x =>{
			let freenet = x.net_limit.available; //net_limit: { used: 28281, available: 17523327, max: 17551608 },
			let freecpu = x.cpu_limit.available; // cpu_limit: { used: 128480, available: 3222543, max: 3351023 },
			let freeram = x.ram_quota - x.ram_usage;
			let obj = {freenet: freenet, freecpu: freecpu, freeram: freeram}
			return obj;
		}).catch(e =>{console.log('error getting sender account stats') })
	}

	done(){
		this.pool.end();
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

	_errorHandler(e){
		var self =this;
		console.log(colors.red.bold(e));
		e = JSON.parse(e);
		let errorname = e.error.name; 

		switch(errorname) {
			//{"code":500,"message":"Internal Service Error","error":{"code":3080006,"name":"deadline_exception","what":"transaction took too long","details":[]}}
		    case 'deadline_exception':
				console.log(colors.magenta('restart in 10 seconds') );
				console.log('If this error keeps popping up you need to stop the script and adjust the batch and/or speed settings.');
				setTimeout(function(){self.drop()},10000);
		        break;
		    //{"code":500,"message":"Internal Service Error","error":{"code":3081001,"name":"leeway_deadline_exception","what":"transaction reached the deadline set due to leeway on account CPU limits","details":[]}}
		    case 'leeway_deadline_exception':
		        console.log(e.error.what);
		        this.done();
		        break;
		    default:
		    	console.log('The script doesn\'t know this error. It may be not that bad. Contact Kasper from eosdac if you keep having problems.');
		        this.done();
		} 
	}

}//end class

test = new Drop();
