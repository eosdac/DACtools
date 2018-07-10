//simple router/controller that does what it needs to do.
class router{
	constructor(model){
		console.log('Router initialized!');
		var self = this;
		this.model = new model(); // enhancement: load different models?
		this.templates = require('./templates.json'); //can be abstracted, different models can be loaded.
		this.getHash();
		this.navigate();

		//lisen for hash changes
		window.addEventListener("hashchange", function(){
			self.getHash();
			self.navigate(this.page);
		});
		
	}

	//get and parse the current hash. If no hash set the page to default.
	getHash(){
		let hash = window.location.hash.slice(2);
		if(hash){
			let parts = hash.split('/');
			this.page = parts.shift();
			this.parm = parts.filter(function(e){ return e === 0 || e }); //remove empty array items
			console.log(this.page)
			console.log(this.parm)
		}
		else{
			this.page = 'default';
		}
	}

	//this function loads a static template in to the DOM
	navigate(page){
		if(page){
			this.page = page;
		}
		let template = `no templates found for the hash ${this.page} ${JSON.stringify(this.parm)}! Check the templatess.json file`;
		if(this.templates.hasOwnProperty(this.page) ){
			template = this.templates[this.page].html;
		}
		$('#content').hide().html(template).fadeIn();
		this.routes();
	}

	//helper function
	requireparms(amount){
	 	if(this.parm == undefined || this.parm.length != amount){
	 		this.navigate('default');
	 		return false
	 	}
	 	else{
	 		return true;
	 	}
	}

	//after the DOM has loaded, fire the model methods. These methods will retrieve data asynchronous then update the DOM 
	//the routs can be defined outside the router class if yo pass them, they even can be specified in the templates file
	//I declared them here because it requires less logic. = faser;
	routes(){

		switch(this.page) {
		    case 'account':
		    	if(this.requireparms(1)){
		        	this.model.getEosdacBalance(this.parm[0]);
		        	this.model.getEosAccount(this.parm[0]);
		        	this.model.displayAccountTransfers(this.parm[0]);
		    	}
		        break;

		    case 'transaction':
		    	if(this.requireparms(1)){
		        	this.model.getTransaction(this.parm[0]);
		    	}
		        break;

		    case 'test':
		    	this.model.displayTestTable();

		        break;
		    default:
		    	this.model.displayTransfers();
		    	this.model.displayHodlers();
		    	this.model.getTokenStats();
		}//ens switch
	
	}


}//end class

module.exports = {
    router
};