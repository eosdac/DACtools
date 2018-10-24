const eosjs = require('eosjs');
const log = require('single-line-log').stdout;
const colors = require('colors/safe');
const pMap = require('p-map');
const request = require('request');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
// const schedule = require('node-schedule');


class members{

    constructor(){
        this.agreedterms = -1; //set to -1 to get all members that have registered before regardless of constitution version
        this.supply =  994895254.9762;
        this.verbose = false;

        this.tokenstatsapi = 'https://explorer.eosdac.io/explorer_base_api.php?get=tokenstats';
        this.mongoConfig = false;

        console.log(colors.magenta('App started! \n') );
        this._initEos();
        this.work();
    }

	_initEos(){
		this.eos = eosjs({
		    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
		    keyProvider: null, // WIF string or array of keys..
		    httpEndpoint: 'https://mainnet.eoscanada.com:443',
   
		});
		console.log('Connected to EOS network!');
    }

    async work(){
        
        let lb='';
        let temp = [];
        this.startblock = await this.getBlockNumber();
		if(!this.db && this.mongoConfig){
			this.db = await MongoClient.connect(this.mongoConfig,{ useNewUrlParser: true })
						.then(client => {
							console.log(colors.green('mongo connected'));
							let db = client.db('eosdac');
							return db;
						})
						.catch(e => {console.log(colors.red(e)); return null;} );

		}

        console.log(colors.white('Getting All Members.') );
        while(lb !== null){
          let c = await this.getMembers(lb);
          if(c){
  
              if(lb === c[c.length-1].sender){
                lb = null;
              }
              else{
                if(lb != ''){
                  //remove first entry except for the first run
                  c.shift(); 
                }
                //set lower_bound to the last received candidate_name
                lb = c[c.length-1].sender; 
                temp.push(...c);
              }
          }
        }


        let real_members  = temp;

        
        console.log(`Found a total of ${colors.bgMagenta(real_members.length)} members` );

        // let stats = await this.getTokenStats();

        console.log(colors.yellow('Retrieving all member balances! \n') );
        const mapper = mem => this.getBalance(mem.sender).then(res => {mem.amount = res; return mem }).catch(e => {console.log('MAPPER: '+e) });
        let result = await pMap(real_members, mapper, {concurrency: 20 }).then(result => { return result });
        // console.log(result)

        let sorted = {};

        result.forEach(i => {
            (sorted[i.agreedterms] = sorted[i.agreedterms] ? sorted[i.agreedterms] : []).push(i);
        })

        let totals= [];


        Object.keys(sorted).forEach(list => {

            totals.push( this.calculateStats(sorted[list]) );
        });
        totals.push(this.calculateStats(result));
        this.endblock = await this.getBlockNumber();
        let p = this.parseConsole(totals);
        this.SaveToDB(p);

    }

    async SaveToDB(entry){

        if(this.mongoConfig && this.db){
            try{
                await this.db.collection('memberstats').insertOne({_id: new Date().getTime(), data: entry});
                console.log('saved to db');
            }catch(e){
                console.log(colors.yellow(e));
            };

        }
        else{
            console.log('Not saved, no database configured.')
        }
    }

    calculateStats(members){
        let result = {agreedterms: members[0].agreedterms, total_members: members.length, tokenless_members: 0, total_tokens: 0 };
        members.forEach(m => {
            if(m.amount){
                let tokens = parseFloat(m.amount.slice(0,-7) )*10000;
                result.total_tokens += tokens;
            }
            else{
                result.tokenless_members ++;
            }
        });

        return result;

    }

    parseConsole(res){
        console.log('\n');
        console.log(colors.underline('RESULTS')+'\n');
        console.log(colors.bgMagenta(`Total Supply = ${this.supply}`) );
        let parsed = [];
        res.forEach( (result, index, array) => {
            let ag = result.agreedterms;
            let tm = result.total_members;
            let tl = result.tokenless_members;
            let tw = result.total_members-result.tokenless_members;
            let tk = result.total_tokens/10000;
            let perc_t = ( (result.total_tokens/10000)/this.supply*100).toFixed(2);
            
            let p = [tm, tl, tw, tk, perc_t];
            let obj = {};
            if (index === array.length - 1){
                console.log('------------------------------------------------------------------------------\n');
                console.log(`TOTAL \tmembers ${colors.magenta(tm)} (${colors.green(tw)} + ${colors.red(tl)}) \t tokens ${colors.yellow(tk)} ${perc_t}%`);
                obj['total'] = p;
                parsed.push(obj);

                
            }
            else{

                console.log(`\nagreedterms v${colors.white(ag)} \t members ${colors.magenta(tm)} (${colors.green(tw)} + ${colors.red(tl)}) \t tokens ${colors.yellow(tk)} ${perc_t}%`)
                
                obj[ag] = p;
                parsed.push(obj);
            }
            

        })
        
        if(this.startblock && this.endblock){
            console.log(colors.italic(`\n\nThis test started at headblock ${this.startblock.head_block_num} and ended at block ${this.endblock.head_block_num}.`));
            let difblock = this.endblock.head_block_num - this.startblock.head_block_num;
            console.log(colors.italic(`There is a window of ${difblock} (approx ${difblock/2} seconds) blocks in which actions could have happend that are not taken in to account`))
        }

        console.log('\n\n')
        return parsed;

    }

    getMembers(lb=''){
        return this.eos.getTableRows({
            "json":"true",
            "scope":"eosdactokens",
            "code":"eosdactokens",
            "table":"members",
            "lower_bound":lb,
            "upper_bound":"",
            "limit":0,
            "key_type":"",
            "index_position":""
        }).then(res => res.rows).catch(e => {console.log(e); return false;})
    }

    getBalance(account){
        return this.eos.getCurrencyBalance({code: 'eosdactokens', symbol: 'EOSDAC', account: account }).then(res =>{
            res = res[0];
            let bal = res === undefined?0:res;
            if(!this.verbose){
                log(colors.green(`${account} -> ${bal}`));
            }
            else{
                console.log(colors.green(`${account} -> ${bal}`) );
            }
            
            return bal;
            
        }).catch(e => {console.log(colors.red(`${account} -> ${e} \n` )) })
    }

    getTokenStats(){
        var self = this;
        return new Promise(function(resolve, reject) {
            request({
                url : self.tokenstatsapi,
                json:true

            }, function(err, response, body){
                if(err || response.statusCode !== 200){
                    reject(false);
                }
                else{
                    resolve(body[0]);
                }
            });
        });
    }
    
    getBlockNumber(){
        return this.eos.getInfo({}).then(res => res).catch(e => {console.log(e); return false});
    }
}

let test = new members();