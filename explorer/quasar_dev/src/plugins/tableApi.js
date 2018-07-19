//this class contains a function to construct/adapt the Quasar datatable api calls to work with the famous jquery datatables api. I opted to not write our own
//api implementation because there are multiple apis available in many different languages for the jquery datatable plugin. Using an adapter will give more flexibility.

class tableApi{
	constructor(){
		this.i = 0;
	}

	adapt(get, initorder, cols, props){

		console.log(JSON.stringify(cols))
		console.log(JSON.stringify(props) ) 

		//calculate start position
		let start = (props.pagination.page-1)*props.pagination.rowsPerPage;
		
		let temp = `http://51.38.42.79/explorer/explorer_api2.php?get=${get}&draw=1`;

		let ar = [];

		cols.forEach(function(value, index){
			ar.push(value.field);
			temp += `&columns[${index}][data]=${value.field}`
			temp +=	`&columns[${index}][name]=`
			temp +=	`&columns[${index}][searchable]=true`
			temp +=	`&columns[${index}][orderable]=false`
			temp +=	`&columns[${index}][search][value]=`
			// temp +=	`&columns[${index}][search][regex]=false`
		})

		// let orderby = props.pagination.sortBy ? ar.indexOf(props.pagination.sortBy) : ''
		let orderby = initorder


		temp += `&order[0][column]=${orderby}`
		temp += `&order[0][dir]=desc`
		temp += `&start=${start}`
		temp += `&length=${props.pagination.rowsPerPage}`
		temp += `&search[value]=${props.filter}`
		// temp += `&search[regex]=false`

		console.log(temp)
		return temp 
	}

}

const test = new tableApi();

export default ({ Vue }) => {
  Vue.prototype.$tableApi = test
}
