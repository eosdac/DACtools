<template>
<q-page >
  <div v-if="isvalidtxid">
    
    <div class=" row bg-mydark" style="margin-top:40px; margin-bottom:15px; min-height:200px">
      <div class="col" v-text="type"></div>
      <div class="col" v-text="trxdata"></div>
      <div  class="col" v-text="blocktime">	</div>
      <div class="col" v-text="blocknumber"></div>
    </div>
    <div> 
        <q-btn @click="toggleVisibility"   color="mypurple">
          Raw Transaction
        </q-btn>
        <q-slide-transition>
          <div  v-show="visible" style="overflow:hidden">
              <q-scroll-area 
            style="height: 400px; padding:20px; font-size:13px"
            class="bg-mydark"
            :thumb-style="{
              right: '0px',
              borderRadius: '2px',
              background:'#491289' ,
              width: '15px',
              opacity: 1
            }"
            :delay="10000"
          >
            <div v-html="rawtx" class="json-pretty bg-primary"></div>
          </q-scroll-area>
          </div>
        </q-slide-transition>


    </div>

  </div>
  <div v-else> not long enough </div>
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
const eosjs =  require('eosjs-api')
const eos = eosjs({
              chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
              httpEndpoint: 'http://147.75.78.129:8866',  //'http://147.75.78.129:8866' 'http://node2.Liquideos.com:80
              expireInSeconds: 60,
              logger: {
                log:  null,
                error: null // null to disable
              } 
            });
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
  		eos.getTransaction(this.$route.params.transactionid).then(tx =>{
  			console.log(tx)
  			if(tx.traces[0]){
  				this.isvalidtxid=true
  				
  			}else{
  				return false
  			}
  			this.rawtx = prettyHtml(tx);
  			this.blocknumber= tx.block_num
  			this.blocktime	= tx.block_time
  			this.type= tx.traces[0].act.name
  			this.trxdata = tx.traces[0].act.data
  			
  		})
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