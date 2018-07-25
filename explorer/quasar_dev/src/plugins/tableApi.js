//this class contains a function to construct/adapt the Quasar datatable api calls to work with the famous jquery datatables api. I opted to not write our own
//api implementation because there are multiple apis available in many different languages for the jquery datatable plugin. Using an adapter will give more flexibility.
import config from '../statics/config/explorer_config.json';
class tableApi{
	constructor(){
		this.i = 0;
	}

	adapt(get, initorder, cols, props){

		// console.log(JSON.stringify(cols))
		// console.log(JSON.stringify(props) ) 

		//calculate start position
		let start = (props.pagination.page-1)*props.pagination.rowsPerPage;
		
		let temp = `${config.settings.table_api_url}?get=${get}&draw=1`;

		let ar = [];
		let ignorecount = 0;

		cols.forEach(function(value, index){
			if(!value.ignoreapi){
				ar.push(value.field);
				let searchable = value.searchable ? true : false
				temp += `&columns[${index-ignorecount}][data]=${value.field}`
				temp +=	`&columns[${index-ignorecount}][name]=`
				temp +=	`&columns[${index-ignorecount}][searchable]=${searchable}`
				temp +=	`&columns[${index-ignorecount}][orderable]=false`
				temp +=	`&columns[${index-ignorecount}][search][value]=`
				// temp +=	`&columns[${index}][search][regex]=false`
			}else{ignorecount++}

		})

		// let orderby = props.pagination.sortBy ? ar.indexOf(props.pagination.sortBy) : ''
		let orderby = initorder


		temp += `&order[0][column]=${orderby}`
		temp += `&order[0][dir]=desc`
		temp += `&start=${start}`
		temp += `&length=${props.pagination.rowsPerPage}`
		temp += `&search[value]=${props.filter}`
		// temp += `&search[regex]=false`

		// console.log(temp)
		return temp 
	}

}

const test = new tableApi();

export default ({ Vue }) => {
  Vue.prototype.$tableApi = test
}
