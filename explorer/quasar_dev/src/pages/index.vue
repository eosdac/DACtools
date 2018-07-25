<template>
<q-page>

  <div class="overflow-hidden">
    <div class="row q-mt-sm gutter-sm" style="margin-bottom:20px;">
      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary rounded" style="max-height:60px;">
          <div class="row">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-dac-membership"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">{{eosdacprice}}</p>
              <span class="q-subheading">USD</span>
            </div>
            <div class="col-xs-5 relative-position  ">
              <div style="font-size:14px;margin-top:12px; padding-right:10px" class="text-right" :class="{'text-negative q-mb-none q-mt-lg': change24 < 0, 'text-positive q-mb-none q-mt-lg': change24 > 0}">{{change24}}% (24h)</div>
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">
                <a class="text-mywhite" target="_blank" href="https://coinmarketcap.com/currencies/eosdac/">source coinmarketcap</a>
              </p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary rounded" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-circulating-1"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">{{circulatingcount}}</p>
              <span class="q-subheading">EOSDAC</span>
            </div>
            <div class="col-xs-5 relative-position">
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">Circulating Supply</p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary rounded" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-member"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">{{membercount}}</p>
              <span class="q-subheading">Members</span>
            </div>
            <div class="col-xs-5 relative-position">

              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">Coming Soon</p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary rounded" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3">
              <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-hodler"></q-icon>
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">{{hodlercount}}</p>
              <span class="q-subheading">Holders</span>
            </div>
            <div class="col-xs-5 relative-position">
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">Token Holders</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <!-- end row -->

  <q-tabs color="brand">
    <q-route-tab default slot="title" to="/transfers" label="TRANSFERS" />
    <q-route-tab slot="title" to="/holders" label="HOLDERS" />
    <!--   <q-tab slot="title" name="tab-3" label="MEMBERS"/>
    <q-tab slot="title" name="tab-4" label="VOTES" /> -->

    <div style="min-height:500px"> <!-- <div style="background:#1E2128;">  -->
      <router-view  />
    </div>
    <!-- </q-tab-pane> -->
  </q-tabs>
  <br>
  <tokenactivity :urlprop="`${this.$store.state.app.explorer_config.settings.base_api_url}?chart=tokenactivity`"></tokenactivity>
</q-page>
</template>

<script>
import tokenactivity from '../components/tokenactivitychart'
export default {
    components :{
        tokenactivity
    },
  data() {

    return {
      eosdacprice: 0,
      change24: 0,
      circulatingcount: 0,
      hodlercount: 0,
      membercount: 0,
      isfocus: true
    }
  },

  methods: {
    getPrice: function() {
      if(!this.isfocus){return false}
      this.$axios.get(`${this.$store.state.app.explorer_config.settings.cmc_token_ticker_url}`)
        .then(response => {
          this.change24 = response.data.data.quotes.USD.percent_change_24h;
          this.eosdacprice = response.data.data.quotes.USD.price;
        })
        .catch(e => {
          this.$q.notify({message:'Error during coinmarketcap request.', color:'negative'});
        })
    },

    getEosDacStats: function() {
      if(!this.isfocus){return false}
      this.$axios.get(`${this.$store.state.app.explorer_config.settings.base_api_url}?get=tokenstats`)
        .then(response => {
          // console.log(response.data[0].tot_bal_db)
          this.hodlercount = response.data[0].tot_hodlers;
          this.circulatingcount = response.data[0].tot_bal_db;
        })
        .catch(e => {
          this.$q.notify({message:'Error retrieving tokens statistics.', color:'negative'});
        })
    }
  },

  created: function() {
    var self = this;
    this.getPrice();
    this.getEosDacStats();

    setInterval(function() {
      self.getPrice();
      self.getEosDacStats();
    }, 10000);
    // this.getEosDacStats();
  },

  watch: {
    '$q.appVisible' (val) {
      this.isfocus = val;
    }
  }

}
</script>
