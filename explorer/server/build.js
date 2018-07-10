"use strict";
// require("babel-polyfill");  //npm run babel
global.$ = require('jquery');
var dt = require( 'datatables.net' )();
const eos = require('eosjs-api');
const {router} = require("./classes/router.js");
var prettyHtml = require('json-pretty-html').default;

const moment = require('moment');

var IntlRelativeFormat = require('intl-relativeformat');
if (!global.Intl) {
    global.Intl = require('intl'); // polyfill for `Intl`
}
var rf = new IntlRelativeFormat('en');

class Model{

	constructor(){
		console.log('app init');
		var self = this;
		this.rootUrl = 'http://51.38.42.79/explorer/';
		this.eos = eos({
		    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
		    httpEndpoint: 'http://147.75.78.129:8866',  //'http://147.75.78.129:8866' 'http://node2.Liquideos.com:80
		    expireInSeconds: 60,
			logger: {
			  log:  null,
			  error: null // null to disable
			} 
		});
		this.httpEndpoint ='http://147.75.78.129:8866';
		this._addEventHandlers();
		this.getEosdacPrice();
		setInterval(function(){self.getEosdacPrice()},10000);
	}


	getEosdacBalance(accountname){
		this.eos.getCurrencyBalance({account: accountname, code: "eosdactokens", symbol: "EOSDAC"}).then(function(x){

		        if(x[0]){
		        	let usdvalue = (self.eosDac_in_USD*(x[0].slice(0,-7) ) ).toFixed(4);
		        	$('#balance').html(accountname+'<br>'+x[0] +' = '+usdvalue+' USD');

					console.log(x);
		        }
		        else{
		        	$('#balance').html(accountname+' 0 EOSDAC');
		        }
		})
		.catch(e => { $('#balance').html(accountname+' error') });

	}

	getTransaction(id){
		let dom =$('#transaction');
		this.eos.getTransaction({id: id}).then(function(x){

		        if(x){
		        	var html = prettyHtml(x);
		        	dom.html(html );
					console.log(x);
		        }
		        else{
		        	dom.html(' no balance');
		        }
		})
		.catch(e => { dom.html(' error') });

	}

	getEosdacPrice(){

		this.api({url: 'https://api.coinmarketcap.com/v2/ticker/2644/', type: 'GET', dataType: 'json'}).then(data =>{
			let change_24 = data.data.quotes.USD.percent_change_24h; 
			let cls = change_24 >= 0 ? "green" :"red";
			self.eosDac_in_USD = data.data.quotes.USD.price;
			$('.eosdac_ticker').html(`<a target="_blank" href="https://coinmarketcap.com/currencies/eosdac/"><span style="font-size: 12px; color:#fff">${data.data.quotes.USD.price} USD </span><span style="font-size:13px" title = "24 hours change" class="${cls}" >${change_24} % </span></a>`);
		});		
	}

	displayTransfers(){
		let dom = $('#transfers');
		var t = dom.DataTable( 
//rf.format(new Date())
			{
			    "serverSide": true,
                "ajax" : "http://51.38.42.79/explorer/explorer_api2.php?get=transfers",
                "processing": true,
				columns: 
				[
				{ data: 'account_action_seq' },
				{ data: '_from', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/account/"+oData._from+"'>"+oData._from+"</a>");} },
				{ data: '_to', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/account/"+oData._to+"'>"+oData._to+"</a>");} },
				{ data: '_quantity' }, 
				{ data: '_symbol' },
				{data : 'block_time', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html(rf.format( new Date(moment.utc(oData.block_time).format() ) ) ) ;} },
				{ data: 'txid', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/transaction/"+oData.txid+"'>"+oData.txid.substr( 0, 10 )+'…'+"</a>");} }
				],

				dom:'lfTrtip',
				// "processing": true,
				order: [[ 0, "desc" ]],
				columnDefs: [ {"targets": 'no-sort', "orderable": false} ]	,
				// responsive: true,

			});


		// var mysocket = new WebSocket("ws://51.38.42.79:8080");

		// mysocket.onmessage = function (event) {
		// 	let d = JSON.parse(event.data);
		// 	d.reverse();
		// 	d.forEach(row =>{
		// 		t.row.add(row);
		// 	})
		// 	t.draw();
		// }

	}
	displayTestTable(){
		let dom = $('#testtable')
		dom.html('xxxxxxxxx')

	}

	displayHodlers(){
		let dom = $('#hodlers');
		var t = dom.DataTable( 
			{
			    "serverSide": true,
                "ajax" : "http://51.38.42.79/explorer/explorer_api2.php?get=hodlers",
                "processing": true,
			columns: 
				[
				// { data: null, "render": function(data,type,row,meta) { return meta.row+1 }, targets: -1},
				// {data: null, "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {return iStart;} , targets: -1},
				{data : 'rank'},
				{ data: 'account', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/account/"+oData.account+"'>"+oData.account+"</a>");} },
				{ data: 'balance' }

				],
				"order": [[ 1, "desc" ]],
				"columnDefs": [ {"targets": 'no-sort',"orderable": false} ]
			});
	}


	displayAccountTransfers(account){
		let dom = $('#accounttransfers');
		var t = dom.DataTable( 
			{
			    "serverSide": true,
                "ajax" : "http://51.38.42.79/explorer/explorer_api2.php?get=accounttransfers&account="+account,
                "processing": true,
				columns: 
				[
				{ data: 'account_action_seq' },
				
				{ data: '_from', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/account/"+oData._from+"'>"+oData._from+"</a>");} },
				{ data: null, "render": function(data,type,row) { return data['_from']==account?'<div class="out">OUT</div>':'<div class="in">IN</div>'; }, targets: -1 },
				{ data: '_to', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/account/"+oData._to+"'>"+oData._to+"</a>");} },
				{ data: '_quantity' }, 
				{ data: '_symbol' },
				{data : 'block_time', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html(rf.format( new Date(moment.utc(oData.block_time).format() ) ) );} },
				{data: '_memo'},
				{ data: 'txid', "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {$(nTd).html("<a href='http://51.38.42.79/explorer/#/transaction/"+oData.txid+"'>"+oData.txid.substr( 0, 10 )+'…'+"</a>");} }
				],

				"order": [[ 0, "desc" ]],
				"columnDefs": [ {"targets": 'no-sort',"orderable": false}, {"targets": [ 0 ],"visible": false} ]	
			});
	}

	getTokenStats(){
		let dom = $('#general_statistics');
		this.api({url:'http://51.38.42.79/explorer/explorer_api.php', type:'GET', data: {'get': 'tokenstats'}}).then(function(data){
			//{"tot_transfers":"88562","tot_hodlers":"88105","tot_bal_db":"994895254.9762"}
			let totbal = data[0].tot_bal_db;
			let tottrans = data[0].tot_transfers;
			let tothodlers = data[0].tot_hodlers;
			let transafterdrop = tottrans -88136;

			dom.html(`<div>Circulating: ${totbal} EOSDAC</div><div>Transfers: ${tottrans}</div><div>Transfers since drop: ${transafterdrop}</div><div>Hodlers: ${tothodlers}</div>`);
		});
	}

	getEosAccount(account){
		let dom = $('#eosaccount');
		this.eos.getAccount(account).then(function(data){
			console.log(data);
			let d ={};
			d.eosbalance = data.core_liquid_balance?x.core_liquid_balance.slice(0,-4):0;
			d.voter_info = data.voter_info;

			dom.html(JSON.stringify(d) );
		}).catch(e =>{});

	}

	// getEosAccount(account){
	// 	let dom = $('#eosaccount');
	// 	this.api({url: this.httpEndpoint+'/v1/chain/get_account',dataType:'json', type:'POST', data:{account_name: account} } ).then(data =>{
	// 		// console.log(eosbalance)
	// 		dom.html(JSON.stringify(data) );
	// 	}).catch(e=>{})
	// }

	api(options) {
		return $.ajax(options)
		.done(function(data) {
			return data;
		})
		.fail(function(e) {
			console.log("errorrrrrr");
		})
		.always(function() {
		});
	}

	_addEventHandlers(){
		var self = this;
		$('.logo').on('click', function(){
			window.location.href = self.rootUrl;
		});

		$('.search_btn').on('click', function(){
			let account = $('.header_input').val().trim();
			window.location.hash = '/account/'+account;
		});

		$('#content').on('click', '.explorer_menu_item', function(){
			$('.explorer_menu_item').removeClass('active');
			let val = $(this).addClass('active').text();
			$('.x').hide();
			$('#'+val).fadeIn();
		});


$.extend( true, $.fn.dataTable.defaults, {
  // "language": {
  //    "processing": "<div class='tabel_processing_loader'></div>"
  // }
} );

		// $('#example')
		//     .on( 'processing.dt', function ( e, settings, processing ) {
		//         $('#processingIndicator').css( 'display', processing ? 'block' : 'none' );
		//     } )
		//     .dataTable();



	}


}




var myrouter =new router(Model);
