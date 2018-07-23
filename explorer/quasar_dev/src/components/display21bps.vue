<template>
  <div>
    <div class="bg-mypurple row " style="color:white;height:60px;line-height:60px;padding-left:35px" >Top 21 BPs</div>
<!-- 	  <q-table
	    ref="table"
	    style="background:#1E2128"
	    color="brand"
	    dark
	    dense
	    :rows-per-page-options=[3,5,7,10,20,50,100]
	    :title="title"
	    :data="serverData"
	    :columns="columns"
	    :filter="filter"
	    row-key="name"
	    :pagination.sync="serverPagination"
	    :loading="loading"
	    @request="request"
	  >

	  </q-table> -->

    <div v-for="item in bps_json">
    	<div class="bp_logo" :style="{ 'background-image': 'url(' + item.logo + ')' }">
    		{{item.position}}
    		{{item.candidate_name}}
    		{{item.accountname}}
    		{{item.website}}
    	</div>
    </div>

  </div>
</template>
<style>
	.bp_logo{
		background-repeat: no-repeat;
		background-size: 25px;
		background-position: left;
		height:25px;
		margin-bottom:5px;
		padding-left:30px;
	}
</style>
<script>

export default {
  name: "display21bps",

  data() {
    return {
    	bps_json : []
    }
      
  },

  methods:{
  	getbps(){this.$axios.get('https://eosdac.io/topbps.json').then(response =>{
  			this.bps_json= response.data
  			let temp =[]

  			response.data.forEach(function(item, index){
  				let bp = {}
  				bp.position = index+1;
  				bp.logo ='';

  				if(item.org.branding !== undefined){
  					bp.logo = item.org.branding.logo_256 =! undefined ?	item.org.branding.logo_256 : '';
  				}

  				bp.accountname = item.producer_account_name =! undefined ? item.producer_account_name : '';
  				bp.website = item.org.website =! undefined ? item.org.website : '';
  				bp.candidate_name = item.org.candidate_name =! undefined ? item.org.candidate_name : '';
  				temp.push(bp)
  			})
  			this.bps_json=temp;
	  	})
	  	.catch(e=>{console.log(e)})
   	},

  },
  mounted: function(){
  	this.getbps()
  }
};
</script>
