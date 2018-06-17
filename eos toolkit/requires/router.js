class router{
	constructor(){
		var self = this;
		this.newhash = this.getHash();
		this.oldhash ='';
		this.template = require('./templates.json');
		window.addEventListener("hashchange", function(){
			self.newhash = self.getHash();
			if(self.newhash != self.oldhash){
				self.oldhash = self.newhash;
				self.route(self.newhash);
			}
			
		});
		console.log('Router initialized!');
		this.route(this.newhash);
	}

	route(){
		// pure-menu-selected
		$('#menu li').removeClass('pure-menu-selected');
		$('a[href*="#'+this.newhash+'"]').parent().addClass('pure-menu-selected');
		let template = `no template found for the hash ${this.newhash}! Check the templates.json file`;
		if(this.template.hasOwnProperty(this.newhash) ){
			template = this.template[this.newhash].html
		}
		$('#content').hide().html(template).fadeIn();
		
	}

	getHash(){
		let hash = window.location.hash.slice(1);
		return hash?hash:'default';
	}

}

module.exports = {
    router
};