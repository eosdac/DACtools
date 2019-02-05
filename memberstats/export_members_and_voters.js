const eosjs = require('eosjs');
const log = require('single-line-log').stdout;
const colors = require('colors/safe');
const pMap = require('p-map');
const request = require('request');
const fs = require('fs');


class members{

  constructor(){
      console.log(colors.magenta('App started! \n') );
      this._initEos();
      this.work();
  }

	_initEos(){
		this.eos = eosjs({
		    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
		    keyProvider: null, // WIF string or array of keys..
		    httpEndpoint: 'https://proxy.eosnode.tools:443',
		});
    console.log('Connected to EOS network!');
  }

  async work(){

      let lb='';
      let members = [];
      let voters = [];
      let sql = [];
      this.startblock = await this.getBlockNumber();

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
              members.push(...c);
            }
        }
      }

      lb='';
      console.log(colors.white('Getting All Voters.') );
      while(lb !== null){
        let c = await this.getVoters(lb);
        if(c){

            if(lb === c[c.length-1].voter){
              lb = null;
            }
            else{
              if(lb != ''){
                //remove first entry except for the first run
                c.shift();
              }
              //set lower_bound to the last received candidate_name
              lb = c[c.length-1].voter;
              voters.push(...c);
            }
        }
      }

      console.log(colors.magenta('Saving balance_member_update.sql'));
      var balance_member_sql_stream = fs.createWriteStream("balance_member_update.sql");
      balance_member_sql_stream.once('open', function(fd) {
        members.forEach(i => {
            balance_member_sql_stream.write("UPDATE balances SET is_member = 1 WHERE account = '" + i.sender + "';\n");
        });
        balance_member_sql_stream.end();
      });
      console.log(colors.magenta('Saving members.csv'));
      var member_csv_stream = fs.createWriteStream("members.csv");
      member_csv_stream.once('open', function(fd) {
        members.forEach(i => {
            member_csv_stream.write(i.sender + "\n");
        });
        member_csv_stream.end();
      });

      console.log(colors.magenta('Saving balance_voter_update.sql'));
      var balance_voter_sql_stream = fs.createWriteStream("balance_voter_update.sql");
      balance_voter_sql_stream.once('open', function(fd) {
        voters.forEach(i => {
            balance_voter_sql_stream.write("UPDATE balances SET is_member = 1 WHERE account = '" + i.voter + "';\n");
        });
        balance_voter_sql_stream.end();
      });
      console.log(colors.magenta('Saving voters.csv'));
      var voter_csv_stream = fs.createWriteStream("voters.csv");
      voter_csv_stream.once('open', function(fd) {
        voters.forEach(i => {
            voter_csv_stream.write(i.voter + "\n");
        });
        voter_csv_stream.end();
      });

  }

  getMembers(lb=''){
      return this.eos.getTableRows({
          "json":"true",
          "scope":"eosdactokens",
          "code":"eosdactokens",
          "table":"members",
          "lower_bound":lb,
          "upper_bound":"",
          "limit":-1,
          "key_type":"",
          "index_position":""
      }).then(res => res.rows).catch(e => {console.log(e); return false;})
  }

  getVoters(lb=''){
      return this.eos.getTableRows({
          "json":"true",
          "scope":"daccustodian",
          "code":"daccustodian",
          "table":"votes",
          "lower_bound":lb,
          "upper_bound":"",
          "limit":-1,
          "key_type":"",
          "index_position":""
      }).then(res => res.rows).catch(e => {console.log(e); return false;})
  }

  getBlockNumber(){
      return this.eos.getInfo({}).then(res => res).catch(e => {console.log(e); return false});
  }
}

let test = new members();