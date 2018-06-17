//browserify index.js -o ./www/js/main.js
//uglifyjs ./www/js/main.js -o ./www/js/main.js
window.$ = window.jQuery = require('jquery');
const Eos = require('eosjs');
const ecc = require('eosjs-ecc');
const fs = require('fs');
const serialize = require('dom-form-serializer').serialize;
const csv=require('csvtojson');

require('./requires/onready.js');
const {MyScatter} = require("./requires/scatter.js");
const {router} = require("./requires/router.js");




class App{
	constructor(){
		console.log('App constructor called, waiting for scatter');
	}
	_init(myscat, write){
		console.log('App init');
		// console.log(myscatter);

        if(write){
            this.scatter = myscat.scatter; 
            this.eos = myscat.scatter.eos;
            this.identity_name = myscat.identity_name;
            this.accountname = myscat.accountname;
            this.authority = myscat.authority;
            

        }else{
            // this.eos = myscat.eos;
        }
        myscat, myscatter = null;

		
		this._addEventListeners();
		this._getAccountInfo(); setInterval(()=>{this._getAccountInfo()} ,200000);
	}
	/////////////////////////////////////////////////////////////////////

    //eos.getTableRows({json:true, scope: account, code: contract, table: table, limit:1, lower_bound: id, upper_bound: id+1})
    // async readTable(d){
    // 	        // this.eos.getTableRows(json:true, contract:'eosio.token', scope:this.user, table:'accounts').then(x => console.log(x)).catch(e => console.log(e) );
    // 	        this.eos.getTableRows(true, 'eosio.token', this.accountname, 'accounts').then(x => console.log(x)).catch(e => console.log(e) );

    // }
    async test(d){
    	// try{
    	// 	let t = await this.eos.getTableRows({json:true, scope: this.accountname, code: 'eosio', table: 'refunds'});
    	// 	console.log(t);
    	// }catch(e){console.error(e)}
    	// console.log(this.eos.pushBlock());
    	// let a = [{"sender":"evilmike","quantity":"100.0000 KASDAC"}];
     // 	try{
    	// 	let c = await this.eos.contract('kas');
    	// 	let tx = await c['memberadda'](a, 'memo');
    	// }catch(e){console.log(e)}

        this.eos.transaction(tr => {
        for(let i = 0; i< 100; i++){
            tr.newaccount({
              creator: 'kas',
              name : 'hdterstahsgd',
              owner: 'EOS56ox8rJV1waDiWBC14kZcGKtSnEeJ3uomxXjQVL9QZpRbtUoJT',
              active: 'EOS56ox8rJV1waDiWBC14kZcGKtSnEeJ3uomxXjQVL9QZpRbtUoJT'
            })
        }

          })
          .then(x => self._popupMsg(x) )
          .catch(e => console.log(e));


    }




   async generateKeyPair(d){
        var self =this;
        var output = $('#generateKeyPair_output');
        var msg = $('.msg').html('');
        output.text('');
        if(d.amount > 100 || d.amount < 1){
        	alert('Not too many!');
        	return false
        }
        for(let i = 0; i < d.amount; i++){
	        let priv = await ecc.randomKey();
	        let pub = ecc.privateToPublic(priv);
	        msg.html(`Generating [${i+1}-${d.amount}]`);
	        output.append(pub+', '+priv+'\n');
	        if(i == d.amount-1){
	        	msg.hide().html(`Done!`).fadeIn();
                self._popupMsg('Done!')
	        	if(d.savefile){
	        		saveTextAsFile();
	        	}	
	        }
        }
    }

    validatePublicKey(){
    	return ecc.isValidPublic(eoskey);
    }
    createNewAccount(d){
        var self = this;
        var newname = d.newaccountname;
        var keyowner = d.keyowner;
        var keyactive = d.keyactive;
        var cpu_eos= d.cpuquant;
        var net_eos= d.netquant;
        var rambytes = parseInt(d.rambytes);
        var transfer = d.transfer?1:0;


        console.log(d);
          this.eos.transaction(tr => {
            tr.newaccount({
              creator: self.accountname,
              name : newname,
              owner: keyowner,
              active: keyactive
            })
            tr.buyrambytes({
              payer: self.accountname,
              receiver: newname,
              bytes: rambytes
            })

            tr.delegatebw({
              from: self.accountname,
              receiver: newname,
              stake_net_quantity: net_eos,
              stake_cpu_quantity: cpu_eos,
              transfer: transfer
            })
          })
          .then(x => self._popupMsg(x) )
          .catch(e => console.log(e));

    }

    async loadContract(d){
    	let output = $('#loadContract_output').html('');
    	
        let contract = d.account_name;
        if(contract != ''){
        	output.addClass('loading');
        	try{
        		let contractcode = await this.eos.getCode({account_name: contract});
                // console.log(contractcode)
	            let structs = contractcode.abi.structs;
	            let actions = contractcode.abi.actions.map(x => {return x.name});
	            let tables = contractcode.abi.tables;
	            // console.log(contractcode.abi);
	            let opt_actions = $('<optgroup label="Actions">').append('<option value="" disabled selected style="display:none;">-select</option>');
	            let opt_tables = $('<optgroup label="Tables">');
	            // var markup = '<form class="pure-form pure-form-stacked"><select><option value="" disabled selected style="display:none;">Actions</option>';

	            structs.forEach(s => {
	            	let temp = `<option data-fields='${JSON.stringify(s.fields)}'>${s.name}</option>`;
	            	if(actions.includes(s.name) ){
						// markup +=temp;
						opt_actions.append(temp);
					}
	            });
	            tables.forEach(t =>{
	            	let temp = `<option>${t.name}</option>`;
	            	opt_tables.append(temp);
	            })
				let form = $('<form class="pure-form pure-form-stacked">');
				let select = $('<select>').append(opt_actions).append(opt_tables).appendTo(form);
				output.removeClass('loading').hide().append(form).append('<div class="output2">').fadeIn();
			}catch(e){console.log(e); output.removeClass('loading').hide().html('The account has no contract.').fadeIn(); return false}
        }
    }
    async deployContract(){
    	try{
        	let abi =  await this._readLocalFile('abifile');
        	let wasm =  await this._readLocalFile('wasmfile',true);
            // let tx = await this.eos.transaction(tr => {
            //     tr.setabi({account:this.accountname,abi:JSON.parse(abi)});
            //     tr.setcode({account:this.accountname,vmtype:0,vmversion:0,code:wasm});

            // })
            // console.log(tx);
            let tx = await this.eos.setabi(this.accountname, JSON.parse(abi));
            this._popupMsg(tx);
            tx = await this.eos.setcode(this.accountname, 0, 0, wasm);
            this._popupMsg(tx)
            this._getAccountInfo();
    	}catch(e){console.log(e)}
    }

    async executeAction(d){
    	let action = d.contract_action;

    	let contract = d.contract_account;
        let auth = { authorization: [ 'kas@owner' ] };

    	delete d.contract_account;
    	delete d.contract_action;
    	console.log(d);
    	try{
    		let c = await this.eos.contract(contract);
    		let tx = await c[action](d);
            
            this._popupMsg(tx)
    		this._getAccountInfo();
    	}catch(e){console.log(e)}
        
    }

    ///////////////////////////////////////////////////////////////////
    async _getAccountInfo(){
    	try{
			let account = await this.eos.getAccount(this.accountname);
			console.log(account)
			let balance = await this.getBalance({code:'eosio.token', symbol:'EOS', account: this.accountname});
			let ramm = await this.eos.getTableRows({json:true, scope: 'eosio', code: 'eosio', table: 'rammarket'});
			let ramprice = (ramm.rows[0].quote.balance.slice(0, -4)/ramm.rows[0].base.balance.slice(0, -4))*1000 ;// price per kb
			// ramprice = parseFloat(ramprice).toPrecision(4);
			// console.log(ramprice)
			let myramworth = (account.total_resources.ram_bytes/1000)*ramprice;
			myramworth = myramworth.toPrecision(4);

			console.log("update account info...")
    		let dom = $('#account_info').html('');

    		let markup = `
    				<div class="account_icon" style="font-size:16px">${account.account_name}</div>
    				<div title="You staked ${account.total_resources.cpu_weight} for cpu"><span>CPU:</span> ${account.cpu_limit.used}/${account.cpu_limit.max}</div>
    				<div title="You staked ${account.total_resources.net_weight} for bandwidth"><span>NET:</span> ${account.net_limit.used}/${account.net_limit.max}</div>
    				<div title="${myramworth} EOS of RAM"><span>RAM:</span> ${account.total_resources.ram_bytes/1000} kb (${ramprice.toPrecision(4)} EOS/kb)</div>
    				<div title="Your unstaked EOS"><span>BAL:</span> ${balance}</div>
    				`;

    		$('#account_info').html(markup);

    	}catch(e){console.log(e)}
    	
    }
    async getTokenBalance(d){
        try{
            let bal = await this.getBalance(d);
            // console.log(bal);
            this._popupMsg(bal)
        }catch(e){console.log(e)}
        
    }
    getBalance(d){
    	
    		return this.eos.getCurrencyBalance(d);
        
    }



    _readLocalFile(id, bytes=false) {
      var file = document.getElementById(id).files[0];
      
      return new Promise((resolve, reject) => {
        var fr = new FileReader();  
        fr.onload = function(result){
            return resolve(fr.result);
        };  // CHANGE to whatever function you want which would eventually call resolve
        if(bytes){
            fr.readAsBinaryString(file);
        }
        else{
            fr.readAsText(file);
        }
        
      });
    }

	_addEventListeners(){
		var self = this;
		$('#panel').on('click','button', function(e){
			e.preventDefault();
			e.stopPropagation();
			let call = $(this).data('event');
			let formdata = serialize(e.target.form);
			// console.log(formdata);
			if (typeof self[call[0]] === "function") { 
			    self[call[0]](formdata);
			}
			else{
				alert(call[0]+' is not a function in the app');
			}

		});
			$('#panel').on('change', 'select', function(){
				let selected = $(this).find(':selected');
				let action = selected.text(); 
				let data = selected.data('fields');
				console.log(data)
				let markup = '<form class="pure-form pure-form-stacked">';
				markup += `<input type="hidden" name="contract_action" value="${action}">`;
				markup += `<input type="hidden" name="contract_account" value="${$('#contract_name').val()}">`;
				data.forEach(function(field){
					markup += `
						<label for="${field.name}">
					      ${field.name}<input type="text" name="${field.name}" placeholder="${field.type}" autocomplete="off">
					    </label>`;

				})
				markup +='<button data-event= \'["executeAction"]\' class="pure-button button-success">Execute</button>'
				markup +='<form>';
				$('.output2').hide().html(markup).fadeIn();
			})


	}
    _popupMsg(msg){
        console.log(msg)
        if(typeof msg === 'object'){
            msg = msg.transaction_id;
        }
        let m = $('<div style="" class="popupmsg">').html(msg).hide().fadeIn();
        $('#panel').append(m).fadeIn();
        setTimeout(function(){
            m.fadeOut().remove();
        },3000)
    }

    // async distributeTokens(){
    //     let input =  await this._readLocalFile('addressfile');
    //     input = window.process(input);
    //     var o = $('#panel');
    //     for(let i = 0; i < input.length; i++){
    //             o.append(input[i][0]);
    //     }
    //     // input.forEach(function(row){
    //     //     if(row.eosdac_tokens)
    //     //     o.append('<div>'+row.eosdac_tokens+'</div>')
    //     // })
    // }

    // async creatToken(){
    //     //deploy
    //     try{
    //         let abi =  await this._readLocalFile('abifile');
    //         let wasm =  await this._readLocalFile('wasmfile',true);
    //         await this.eos.setabi(this.accountname, JSON.parse(abi));
    //         await this.eos.setcode(this.accountname, 0, 0, wasm);
    //     //create
    //         let c = await this.eos.contract(contract);
    //         let tx = await c[action](d);
    //         console.log(tx);



    //     }catch(e){console.log(e)}


    //     var self = this;
    //     var newname = d.newaccountname;
    //     var keyowner = d.keyowner;
    //     var keyactive = d.keyactive;
    //     var cpu_eos= d.cpuquant;
    //     var net_eos= d.netquant;
    //     var rambytes = parseInt(d.rambytes);
    //     var transfer = d.transfer?1:0;


    //     console.log(d);
    //       this.eos.transaction(tr => {
    //         tr.setabi({})
    //         tr.setcode({})

    //       })
    //       .then(x => console.log(x) )
    //       .catch(e => console.log(e));
        
    //     //issue
    // }



}

var myapp = new App();
var myscatter = new MyScatter(Eos, myapp);
var myrouter = new router();




