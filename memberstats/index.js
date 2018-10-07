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

 
        // let real_members = temp.filter(x => {return x.agreedterms == this.agreedterms});
        let real_members  = temp;

        
        console.log(colors.magenta(`Found a total of ${real_members.length} members \n`) );

        let stats = await this.getTokenStats();

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
        this.parseConsole(totals)
        


        // console.log('\n');
        // console.log(colors.magenta.underline('RESULTS:\n'));
        // console.log(colors.yellow(`There are ${real_members.length} registrations with a combined balance of ${total/10000} EOSDAC`) );
        // console.log(colors.red(`From these registrations ${zero} accounts have no EOSDAC`));
        // console.log(colors.yellow(`This means that ${( (total/10000)/this.supply*100).toFixed(2)}% of all tokens (${this.supply}) are registered`) );
        // console.log(colors.yellow(`by ${((real_members.length-zero)/stats.tot_hodlers*100).toFixed(2)}% of all accounts that hold EOSDAC (${stats.tot_hodlers})`) );


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
        console.log(colors.bgMagenta(`Total Supply = ${this.supply}`) )
        res.forEach( (result, index, array) => {
            let ag = colors.white(result.agreedterms);
            let tm = colors.magenta(result.total_members);
            let tl = colors.red(result.tokenless_members);
            let tw = colors.green(result.total_members-result.tokenless_members);
            let tk = colors.yellow(result.total_tokens/10000);
            let perc_t = ( (result.total_tokens/10000)/this.supply*100).toFixed(2)
    
            if (index === array.length - 1){
                console.log('------------------------------------------------------------------------------\n');
                console.log(`TOTAL \tmembers ${tm} (${tw} + ${tl}) \t tokens ${tk} ${perc_t}%`)
            }
            else{
                console.log(`\nagreedterms v${ag} \t members ${tm} (${tw} + ${tl}) \t tokens ${tk} ${perc_t}%`)
            }  

        })
        if(this.startblock && this.endblock){
            console.log(colors.italic(`\n\nThis test started at headblock ${this.startblock.head_block_num} and ended at block ${this.endblock.head_block_num}.`));
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