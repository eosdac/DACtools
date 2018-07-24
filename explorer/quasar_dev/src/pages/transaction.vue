<template>
<q-page >
  <div v-if="isvalidtxid">
    <div style="margin-top:40px;margin-bottom:5px"> Txid: {{this.$route.params.transactionid}}</div>
    <div class=" row bg-mydark items-center" style=" padding:10px">
      <div class="col " v-text="type"></div>
      <div class="col">
        <div v-for="(value, key) in trxdata">
          {{ key }}: {{ value }}
        </div>
      </div>
      <div  class="col" v-text="blocktime">	</div>
      <div class="col" v-text="blocknumber"></div>
    </div>

    <br>

    <q-btn @click="toggleVisibility" size="sm" color="mypurple">Raw Transaction</q-btn>

    <br><br>

    <q-slide-transition >
      <div  v-show="visible" style="overflow:hidden;">
        <q-scroll-area 
          style="height: 330px; padding:20px; font-size:13px"
          class="bg-mydark"
          :delay="10000"
          :thumb-style="{
              right: '0px',
              borderRadius: '2px',
              background:'#491289' ,
              width: '15px',
              opacity: 1
          }"
        >
          <div v-html="rawtx" class="json-pretty bg-primary"></div>
        </q-scroll-area>
      </div>
    </q-slide-transition>

  </div>
  <div v-else style="border:1px solid #491289;background-color:#1E2128;margin-top:40px;text-align:center;padding:20px" class="rounded">
    <div style="margin-bottom:20px">This transaction id is not related to eosDAC</div>
    <q-btn
      color="brand"
      @click="$router.push('/transfers')"
      label="Go Home"
    />
  </div>
</q-page >
</template>

<style>
.json-pretty {
    
}
.json-selected {
    background-color: rgba(139, 191, 228, 0.19999999999999996);
}

.json-string {
    color: #6caedd;
}

.json-key {
    color: #ec5f67;
}

.json-boolean {
    color: #99c794;
}

.json-number {
    color: #99c794;
}

</style>

<script>

const prettyHtml = require('json-pretty-html').default;

export default {
  data () {
    return {
      isvalidtxid:false,
      trxid: this.$route.params.transactionid,
      blocktime:'',
      blocknumber:'',
      type:'ss',
      trxdata:'',
      rawtx:'',
      visible:false

    }
  },
  
  methods:{
  	getTransaction: function(){
  		this.$eos.getTransaction(this.$route.params.transactionid).then(tx =>{
  			// console.log(tx)
  			if(tx.traces[0]){
  				this.isvalidtxid=true
  			}
        else{
  				return false
  			}
  			this.rawtx = prettyHtml(tx);
  			this.blocknumber= tx.block_num
  			this.blocktime	= tx.block_time
  			this.type= tx.traces[0].act.name
  			this.trxdata = tx.traces[0].act.data
  			
  		})
      .catch(e =>{
        this.$q.notify({message:'Error getting TX from node.', color:'negative'});
      });
  	},

    toggleVisibility (e) {
     
      if(e.blur){
         console.log(e)
      }
      this.visible = !this.visible
    }
  },

  mounted: function(){
  	this.getTransaction();
  }
   
}
</script>