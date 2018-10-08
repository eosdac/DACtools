const eosjs = require('eosjs-api');
const colors = require('colors/safe');
const pMap = require('p-map');
const log = require('single-line-log').stdout;
const fs = require('fs');
const csv=require('csvtojson');

// const schedule = require('node-schedule');


class BPvotes{

    constructor(){

        this.inputFile= './top500.csv'; //change this path to point to your input file.


        this.output_folder ='./output/';
        console.log(colors.magenta('App started!') );
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
        let jsonArray=await csv({noheader:true,trim:true,}).fromFile(this.inputFile); //  { field1: 'gezdenjxgene' },{ field1: 'gq2tknagenes' },
        console.log(colors.magenta(`found ${jsonArray.length} accounts\n`) );
        const mapper = ac => this.getVotes(ac.field1).then(res => {return res;}).catch(e => {console.log('MAPPER: '+e) });
        let result = await pMap(jsonArray, mapper, {concurrency: 20 }).then(result => { return result });
        this.createcsv(result, 'output.csv')
        // this.saveAsJson(result, 'output.json');
    }


    getVotes(account){
        return this.eos.getTableRows({"json":"true", "scope":"eosio", "code":"eosio", "table":"voters", "lower_bound":account, "limit":1}).then(res =>{
            let votes = {owner: account};
            if(res.rows[0].owner === account){
                votes = res.rows[0];
            }
            log(colors.green(`${account} -> ${JSON.stringify(votes)}`));
 
            return votes;
            
        }).catch(e => {console.log(colors.red(`${account} -> ${e} \n` )); return [account] })
    }
    saveAsJson(tt, f){
        !fs.existsSync(this.output_folder) && fs.mkdirSync(this.output_folder);
        console.log('\nWriting to CSV-file: ' + this.output_folder + f);
        let file = fs.createWriteStream(this.output_folder+f);
        file.on('error', function(err) { console.log(colors.bold.red(err)) });
  
        file.write(JSON.stringify(tt) );
        file.end();
    }

    createcsv(tt, f){
        !fs.existsSync(this.output_folder) && fs.mkdirSync(this.output_folder);
        console.log('\nWriting to CSV-file: ' + this.output_folder + f);
        let file = fs.createWriteStream(this.output_folder+f);
        file.on('error', function(err) { console.log(colors.bold.red(err)) });
  
        tt.forEach(function(v) {
            // account, proxy, staked, last_vote_weight, proxied_vote_weight, is_proxy, votes
            v.proxy = v.proxy !=''? v.proxy : 0; 
            let csvline = v.owner+', '+v.proxy+', '+v.staked+', '+v.last_vote_weight+', '+v.proxied_vote_weight+', '+v.is_proxy+', '+JSON.stringify(v.producers)+'\n';
            file.write(csvline); 
        });
        file.end();
    }

    
}

let test = new BPvotes();