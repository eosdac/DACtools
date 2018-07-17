<template>
<q-page>

  <div class="overflow-hidden">
    <div class="row q-mt-sm gutter-sm" style="margin-bottom:20px;">
      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary" style="max-height:60px;">
          <div class="row">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-dac-membership"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white" style="line-height:24px;">
                {{eosdacprice}}</p>
              <span class="q-subheading">USD</span>
            </div>
            <div class="col-xs-5 text-center">
              <p style="font-size:14px;" :class="{'text-negative q-mb-none q-mt-lg': change24 < 0, 'text-positive q-mb-none q-mt-lg': change24 > 0}">{{change24}} %(24h)</p>
              <span class="small q-mt-none">source coinmarketcap</span>
              </p>
              <p class="small absolute" style="bottom:0;right:10px;">source coinmarketcap</p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-circulating-1"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white" style="line-height:24px;">
                {{circulatingcount}}</p>
              <span class="q-subheading">EOSDAC</span>
            </div>
            <div class="col-xs-5 relative-position">
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">Circulating Supply</p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-member"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white" style="line-height:24px;">
                {{membercount}}</p>
              <span class="q-subheading">Members</span>
            </div>
            <div class="col-xs-5 relative-position">

              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">hgjhjgjgjgj</p>
              </p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-hodler"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white" style="line-height:24px;">
                {{hodlercount}}</p>
              <span class="q-subheading">Hodlers</span>
            </div>
            <div class="col-xs-5 relative-position">

              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">hgjhjgjgjgj</p>
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
  <!-- end row -->

  <q-tabs color="brand" style="min-height:">
    <q-route-tab default slot="title" to="/transfers" label="TRANSFERS" />
    <q-route-tab slot="title" to="/hodlers" label="HODLERS" />
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



.big{
  color: rgba(255,255,255, 0.9);
  font-size:17px;
}
.small{
  color: rgba(255,255,255, 0.7);
  font-size:9px;
}

</style>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      eosdacprice: 0.000001,
      change24: '2%',
      circulatingcount: 12222,
      hodlercount: 122227,
      membercount: 1254

    }
  },
  methods: {
    getPrice: function() {
      axios.get('https://api.coinmarketcap.com/v2/ticker/2644/')
        .then(response => {
          this.change24 = response.data.data.quotes.USD.percent_change_24h;
          this.eosdacprice = response.data.data.quotes.USD.price;
        })
        .catch(e => {
          this.eosdacprice = 'error';
        })
    },

    getEosDacStats: function() {
      axios.get('http://51.38.42.79/explorer/explorer_api.php?get=tokenstats')
        .then(response => {
          // console.log(response.data[0].tot_bal_db)
          this.hodlercount = response.data[0].tot_hodlers;
          this.circulatingcount = response.data[0].tot_bal_db;


        })
        .catch(e => {
          alert(e);
        })

    }

  },
  created: function() {
    var self = this;
    this.getPrice();
    this.getEosDacStats();
    setInterval(function() {
      self.getPrice()
    }, 10000);
    // this.getEosDacStats();
  }

}
</script>
