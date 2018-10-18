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
        let mapper = ac => this.getVotes(ac.field1).then(res => {return res;}).catch(e => {console.log('MAPPER: '+e) });
        let voters = await pMap(jsonArray, mapper, {concurrency: 20 }).then(result => { return result });
        let proxies = voters.filter(vt =>vt.proxy !== '' && vt.proxy !== undefined ).map(p => p.proxy);
        proxies = [ ...new Set(proxies) ];

        console.log(colors.magenta(`\nfound ${proxies.length} used proxies\n`) );
        mapper = ac => this.getVotes(ac).then(res => {return res;}).catch(e => {console.log('MAPPER: '+e) });
        if(proxies.length){
            let proxyvotes = await pMap(proxies, mapper, {concurrency: 20 }).then(result => { return result });
            this.createcsv(proxyvotes, 'proxies.csv')
        }

        this.createcsv(voters, 'accounts.csv')
        // this.saveAsJson(result, 'output.json');
    }


    getVotes(account){
        return this.eos.getTableRows({"json":"true", "scope":"eosio", "code":"eosio", "table":"voters", "lower_bound":account, "limit":1}).then(res =>{
            let votes = {owner: account};
            if(res.rows[0].owner === account  ){
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
        var self = this;
        !fs.existsSync(this.output_folder) && fs.mkdirSync(this.output_folder);
        console.log('\nWriting to CSV-file: ' + this.output_folder + f);
        let file = fs.createWriteStream(this.output_folder+f);
        file.on('error', function(err) { console.log(colors.bold.red(err)) });
  
        tt.forEach(function(v) {
            // account, proxy, staked, last_vote_weight, proxied_vote_weight, is_proxy, votes
            if((v.staked > 0) && (v.last_vote_weight > 0) && v.producers.length){
                v.vote_weight_now = self.calculateVotesNow(v.staked);
                let d = 100000000000000000;
                v.decay = (Math.abs((v.last_vote_weight*d) - (v.vote_weight_now*d)) /(((v.last_vote_weight*d)+(v.vote_weight_now*d))/2))*100;
            }
            else{
                v.vote_weight_now = 0;
                v.decay = 0;
            }
            v.proxy = v.proxy !=''? v.proxy : 0; 
            let csvline = v.owner+', '+v.proxy+', '+v.staked+', '+v.last_vote_weight+', '+v.proxied_vote_weight+', '+v.is_proxy+', '+v.vote_weight_now+', '+v.decay+'%, '+JSON.stringify(v.producers)+'\n';
            file.write(csvline); 
        });
        file.end();
    }

    calculateVotesNow(stakeamount){
        const epoch = 946684800000; 
        const seconds_per_day = 86400;
        let now = new Date().getTime()/1000; //in seconds
        let weight = parseInt( (now - (epoch / 1000)) / (seconds_per_day * 7) )/52 ;
        return (stakeamount*Math.pow(2, weight)).toFixed(17);
    }

    
}

let test = new BPvotes();