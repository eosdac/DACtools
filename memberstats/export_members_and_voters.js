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
      let keys = [];
      let sql = [];
      let string_to_write = '';
      let this_member = {};
/*
      members[0] = {"sender":'1lukestokes1'};
      members[1] = {"sender":'lukeeosproxy'};

      voters[0] = {"voter":'1lukestokes1'};
      voters[1] = {"voter":'lukeeosproxy'};
*/
      console.log(colors.white('Getting All Members') );
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
      console.log(colors.white('Getting All Voters') );
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

      console.log(colors.white('Getting All Member Keys') );
      const mapper = mem => this.getAccount(mem.sender).then(res => {
        mem.keys = [];
        mem.keys['active'] = '';
        mem.keys['owner'] = '';
        for (var i = res.permissions.length - 1; i >= 0; i--) {
          if (res.permissions[i].perm_name == 'owner' && res.permissions[i].required_auth.keys.length > 0) {
            mem.keys['owner'] = res.permissions[i].required_auth.keys[0].key;
          }
          if (res.permissions[i].perm_name == 'active' && res.permissions[i].required_auth.keys.length > 0) {
            mem.keys['active'] = res.permissions[i].required_auth.keys[0].key;
          }
        }
        return mem
      }).catch(e => {console.log('MAPPER: '+e) });
      members = await pMap(members, mapper, {concurrency: 20 }).then(result => { return result });

      console.log(colors.yellow('Retrieving all member balances! \n') );
      const balance_mapper = mem => this.getBalance(mem.sender).then(
        res => {
          mem.amount = res;
          return mem
        }
      ).catch(
        e => {
          console.log('MAPPER: '+e)
        }
      );
      let result = await pMap(members, balance_mapper, {concurrency: 20 }).then(result => { return result });

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
            string_to_write = i.sender + ",";
            string_to_write += i.amount + ",";
            string_to_write += i.keys["owner"];
            string_to_write += ",";
            string_to_write += i.keys["active"];
            member_csv_stream.write(string_to_write + "\n");
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
            for (var j = members.length - 1; j >= 0; j--) {
              if (members[j].sender == i.voter) {
                this_member = members[j];
              }
            }
            string_to_write = i.voter + ",";
            string_to_write += this_member.amount;
            string_to_write += ",";
            string_to_write += this_member.keys["owner"];
            string_to_write += ",";
            string_to_write += this_member.keys["active"];
            voter_csv_stream.write(string_to_write + "\n");
        });
        voter_csv_stream.end();
      });
  }

  getAccount(account=''){
      return this.eos.getAccount(account).then(res => res).catch(e => {console.log(e); return false;})
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
}

let test = new members();
