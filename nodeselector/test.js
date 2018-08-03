const {NodeSelector} = require('./nodeselector.js');


let test = new NodeSelector();

//get node list (https only)
//
// test.get_nodes({https_only:true}).then(
// 	list=> console.log(list) ).catch(e=>{});


async function xxx(){

	//get fastest node
	let fastest = await test.get_fastest_node();
	console.log(fastest);
	console.log('this is printed after you get the fastest node')
}

xxx()