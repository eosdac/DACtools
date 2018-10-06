const eosjs = require('eosjs');
const log = require('single-line-log').stdout;
const colors = require('colors/safe');
const pMap = require('p-map');
const request = require('request');


class members{

    constructor(){
        this.agreedterms = -1; //set to -1 to get all members that have registered before regardless of constitution version
        this.supply =  994895254.9762;
        this.verbose = false;

        this.tokenstatsapi = 'https://explorer.eosdac.io/explorer_base_api.php?get=tokenstats',


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
		console.log('Connected to EOS network! \n');
    }

    async work(){
        
        let lb='';
        let temp = [];
        this.startblock = await this.getBlockNumber();

        console.log(colors.yellow('Getting All Members!! \n') );
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

        let real_members;

        if(this.agreedterms === -1){
            real_members = temp; 
        }
        else{
            real_members = temp.filter(x => {return x.agreedterms == this.agreedterms});
        }
        
        console.log(colors.magenta(`Found ${real_members.length} members \n`) );

        let stats = await this.getTokenStats();

        console.log(colors.yellow('Retrieving all member balances! \n') );
        const mapper = mem => this.getBalance(mem.sender).then(res => {return res }).catch(e => {console.log('MAPPER: '+e) });
        let result = await pMap(real_members, mapper, {concurrency: 20 }).then(result => { return result });
        this.endblock = await this.getBlockNumber();
        let zero = 0;
        let total = 0;
        result.forEach(b => {
            if(b){
                b = parseFloat(b.slice(0,-7) )*10000;
                total += b;
            }
            else{
                zero++;
            }

        });

        console.log('\n');
        console.log(colors.magenta.underline('RESULTS:\n'));
        console.log(colors.yellow(`There are ${real_members.length} registrations with a combined balance of ${total/10000} EOSDAC`) );
        console.log(colors.red(`From these registrations ${zero} accounts have no EOSDAC`));
        console.log(colors.yellow(`This means that ${( (total/10000)/this.supply*100).toFixed(2)}% of all tokens (${this.supply}) are registered`) );
        console.log(colors.yellow(`by ${((real_members.length-zero)/stats.tot_hodlers*100).toFixed(2)}% of all accounts that hold EOSDAC (${stats.tot_hodlers})`) );

        if(this.startblock && this.endblock){
            console.log(colors.italic(`\nThis test started at headblock ${this.startblock.head_block_num} and ended at block ${this.endblock.head_block_num}.`));
            let difblock = this.endblock.head_block_num - this.startblock.head_block_num;
            console.log(colors.italic(`There is a window of ${difblock} (approx ${difblock/2} seconds) blocks in which actions could have happend that are not taken in to account`))
        }

        console.log('\n\n')
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