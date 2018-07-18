const axios = require ('axios');

class test{
	constructor(){
		this.i = 0;
	}
	plus(){

		this.i++
	}
	get(){
		return this.i
	}

}

const hello = new test();

export default ({ Vue }) => {
  Vue.prototype.$test = hello
}
