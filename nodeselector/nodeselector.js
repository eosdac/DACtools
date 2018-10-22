const request = require('request');

class NodeSelector {

		constructor (nodes_api_url){
			//configs
			this.nodes_api_url = nodes_api_url;
			this.benchmark_url ='/v1/chain/get_info';
		}

		async get_fastest_node(){
			var self =this;
			//only get nodes if not already done
			if(this.nodelist == undefined){
				try{
					await this.get_nodes({https_only:true});
				}catch(e){};//no need to catch the error here
			}
			//return false if node api error
			if(!this.nodelist || !this.nodelist.length){
				console.log('error getting node list from api server!');
				return false;
			}

			return new Promise(async function(resolve, reject){
				let flag = true;
				while(flag){
					try{
						let winner = await self._start_race();
						if(winner.ms != 'error'){
							flag = false;
							resolve(winner);//valid winner
						}
						else{
							//node errored so exclude from next race
							self.nodelist = self.nodelist.filter((node) => {return node != winner.node;} );
						}
					}catch(e){console.log(e)};
				}
			})
		}

		get_nodes(config = {https_only:false} ){
			var self = this;
			return new Promise(function(resolve, reject) {
				request({
					url : self.nodes_api_url,
					json:true

				}, function(err, response, body){
					if(err || response.statusCode !== 200){
						self.nodelist=false;
						reject(false);
					}
					else{
						self.nodelist=body;
						if(config.https_only){
							self.nodelist = body.filter((node) => node.startsWith('https'));
							self.nodelist = self.nodelist.map(node => {
								 node = node.substr(-1) =='/'?node.slice(0,-1):node;
								return node
							})
						}
						resolve(self.nodelist);
					}
				});
			});
		}

		_start_race(){
			var self = this;
			console.log(`start race with ${this.nodelist.length} nodes...`);
			if(this.nodelist.length < 1){
				console.log('There are no nodes left to race!');
				return false;
			}
			this.proms = [];
			this.nodelist.forEach((node, index) => {
				node = node.substr(-1) =='/'?node.slice(0,-1):node;
				let p = this._racer_request(node).then(res => res ).catch(e => e );
				this.proms.push(p)
			});
			return Promise.race(this.proms).then(function(winner) {
				return winner;
			})
		}

		_racer_request(node_url){
			var self = this;
			let url = node_url;
			return new Promise(function(resolve, reject) {
				request({
					url : url + self.benchmark_url,
					time : true,
					rejectUnauthorized: false,
					headers: {'User-Agent': 'Chrome/59.0.3071.115'},

				}, function(err, response){
					if(err){
						reject({node: node_url, ms: 'error'} );
					}
					else{
						resolve({node: node_url, ms: response.elapsedTime});
					}

				});
			});
		}
}//end class
export default NodeSelector
/*module.exports = {
    NodeSelector
};*/
