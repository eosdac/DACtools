<template>

<q-page >
  <div class="row justify-between" style="min-height:70px;margin-top:40px;margin-bottom:20px;box-sizing: border-box;">

    <div class="col-lg-2 col-sm-12  info_box price">
      <div class="row items-center"> <div  class="col big">{{eosdacprice}}</div> <div :class="{'neg': change24 < 0, 'pos': change24 > 0}" class="col ">{{change24}}% (24h)</div></div>
      <div class="row items-center"> <div class="col big" style="color:grey">USD</div> <div class="col small"><a target="_blank" href="https://coinmarketcap.com/currencies/eosdac/">source coinmarketcap</a></div></div>
    </div>

    <div class="col-lg-2 col-sm-12  info_box circulating">
      <div class="row items-center"> <div class="col big">{{circulatingcount}}</div> <div class="col "></div></div>
      <div class="row items-center"> <div class="col big" style="color:grey">EOSDAC</div> <div class="col small">Circulating Supply</div></div>
    </div>

    <div class="col-lg-2 col-sm-12  info_box member">
      <div class="row items-center"> <div class="col big">{{membercount}}</div> <div class="col "></div></div>
      <div class="row items-center"> <div class="col big" style="color:grey">Members</div> <div class="col small">hgjhjgjgjgj</div></div>
    </div>

    <div class="col-lg-2  col-sm-12 info_box hodler">
      <div class="row items-center"> <div class="col big">{{hodlercount}}</div> <div class="col "></div></div>
      <div class="row items-center"> <div class="col big" style="color:grey">Hodlers</div> <div class="col small">hgjhjgjgjgj</div></div>
    </div>

  </div><!-- end row -->
  
  <q-tabs color="brand">
    <q-route-tab default  slot="title"  to ="/transfers" label="TRANSFERS" />
    <q-route-tab slot="title"  to ="/hodlers" label="HODLERS" />
  <!--   <q-tab slot="title" name="tab-3" label="MEMBERS"/>
    <q-tab slot="title" name="tab-4" label="VOTES" /> -->

      <div style="background:#1E2128"> 
      <router-view />
      </div>
    <!-- </q-tab-pane> -->
  </q-tabs>
</q-page>

</template>

<style lang="stylus">
@import '~variables'

.info_box{
  background-image:  url('~assets/email.png');
  background-color: $primary;
  background-repeat: no-repeat; 
  background-position: 8px;
  background-size: 50px;
  padding-left:75px;
  padding-top:13px;
  border-radius:2px;
  min-width:290px;
  margin-top:5px;
}
.circulating{
  background-image:  url('~assets/icon-circulating-24x24.svg');
}
.member{
  background-image:  url('~assets/icon-member-24x24.svg');
}
.price{
  background-image: url('~assets/icon-dac-price-24x24.svg');
}

.hodler{
  background-image: url('~assets/icon-hodler-24x24.svg')
}

.big{
  color: rgba(255,255,255, 0.9);
  font-size:17px;


  
}
.small{
  color: rgba(255,255,255, 0.7);
  font-size:9px;
}
.neg{
  color: $negative;
}
.pos{
  color: $positive;
}
</style>

<script>
import axios from 'axios';

export default {
  data () {
    return {
      eosdacprice: 0.000001,
      change24 :'2%',
      circulatingcount:12222,
      hodlercount:122227,
      membercount: 1254
      
    }
  },
  methods:{
    getPrice: function(){
      axios.get('https://api.coinmarketcap.com/v2/ticker/2644/')
      .then(response => {
        this.change24=response.data.data.quotes.USD.percent_change_24h;
        this.eosdacprice =response.data.data.quotes.USD.price;
      })
      .catch(e => {
        this.eosdacprice ='error';
      })
    },

    getEosDacStats: function(){
      axios.get('http://51.38.42.79/explorer/explorer_api.php?get=tokenstats')
      .then(response => {
        // console.log(response.data[0].tot_bal_db)
        this.hodlercount=  response.data[0].tot_hodlers;
        this.circulatingcount = response.data[0].tot_bal_db;
        

      })
      .catch(e => {
        alert(e);
      })

    }

  },
  created: function(){
    var self =this;
    this.getPrice();
    this.getEosDacStats();
    setInterval(function(){self.getPrice()}, 10000);
    // this.getEosDacStats();
  }
     
}
</script>


