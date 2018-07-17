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
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">
                {{eosdacbalance}}</p>
              <span class="q-subheading">EOSDAC</span>
            </div>
            <div class="col-xs-5 relative-position  ">
<!--               <div style="font-size:14px;margin-top:12px; padding-right:10px" class="text-right" :class="{'text-negative q-mb-none q-mt-lg': change24 < 0, 'text-positive q-mb-none q-mt-lg': change24 > 0}">{{change24}}% (24h)</div> -->
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">Balance</p>
            </div>

          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div class="bg-primary" style="height:60px;">
          <div class="row fit">
            <div class="col-xs-3 ">
              <img src="~assets/Eosio_logo.svg" style="width:40px; margin-top:7px;margin-left:10px">
              <!-- <q-icon class="q-ma-sm" style="font-size:45px;" name="icon-circulating-1"></q-icon> -->
            </div>
            <div class="col-xs-4 text-left">
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">
                {{eosbalance}}</p>
              <span class="q-subheading">EOS</span>
            </div>
            <div class="col-xs-5 relative-position">
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">Liquid balance</p>
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
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">
                xxxxxxxxxxx</p>
              <span class="q-subheading">XXXXXXXX</span>
            </div>
            <div class="col-xs-5 relative-position">

              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">xxxxxxxxxx</p>
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
              <p class="q-mb-none q-mt-sm q-headline text-weight-light text-white big" style="line-height:24px;">
                xxxxxxxxx</p>
              <span class="q-subheading">XXXXXXXX</span>
            </div>
            <div class="col-xs-5 relative-position">
              <p class="small q-mb-xs absolute" style="bottom:0;right:10px;">xxxxxxxxxxx</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <!-- end row -->

  <q-tabs color="brand" >
    <q-tab default @click="displayTransfers"  slot="title"   label="TRANSFERS" />
    <q-tab slot="title"     label="VOTES" />
  </q-tabs>

  <div class="bg-mydark">
  <q-table
    ref="table"
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


  <q-td slot="body-cell-test" slot-scope="props" :props="props">
    <div class="label_out label_in_out" v-if="title == props.row._from">OUT</div>
    <div class="label_in label_in_out" v-if="title == props.row._to">IN</div>
  </q-td>

  <q-td slot="body-cell-_from" slot-scope="props" :props="props">
    <router-link  v-if="title != props.value" :to="{path: '/account/'+props.value}" >{{ props.value }}</router-link>
    <span v-else>{{props.value}}</span>
  </q-td>

  <q-td slot="body-cell-_to" slot-scope="props" :props="props">
    <router-link v-if="title != props.value" :to="{path: '/account/'+props.value}" >{{ props.value }}</router-link>
    <span v-else>{{props.value}}</span>
  </q-td>

  <q-td slot="body-cell-txid" slot-scope="props" :props="props">
    <router-link :to="{path: '/transaction/' + props.value}" >{{ props.value.slice(0,10)+'...' }}</router-link>
    <q-tooltip style="font-size:10px">{{ props.value }}</q-tooltip>
  </q-td>


<!-- 
    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model="filter" />
    </template> -->

    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model.trim="filter"/>
      <q-btn
        flat round dense color="brand"
        :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="props.toggleFullscreen"
      />
    </template>

  </q-table>
   </div>
</q-page>
</template>


<style lang="stylus">
@import '~variables'

.info_box{
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
.eos{
  background-image:  url('~assets/Eosio_logo.svg');
  background-size: 45px;
}


.big{
  color: rgba(255,255,255, 0.9);
  font-size:17px;


  
}
.small{
  color: rgba(255,255,255, 0.7);
  font-size:9px;
}


.label_in_out{
    border-radius:5px;
    display:inline-block;
    width:30px;
    text-align:center;
    padding:1px 0px 1px 0px;
    font-size:12px;
    color:black
}
.label_in{
    background: $positive

}
.label_out{
    background: $warning
}
</style>



<script>
import axios from 'axios';
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

const moment = require('moment');

var IntlRelativeFormat = require('intl-relativeformat');
if (!global.Intl) {
    global.Intl = require('intl'); // polyfill for `Intl`
}
var rf = new IntlRelativeFormat('en');

export default {
  data () {
    return {
      eosdacbalance:0,
      eosbalance:0,
      filter: '',
      loading: false,
      serverPagination: {
        page: 1,
        rowsPerPage: 7,
        rowsNumber: 10 // specifying this determines pagination is server-side
      },

      serverData: [],
      title:this.$route.params.accountname,
      columns: [
        { name: 'account_action_seq', label: 'Seq', field: 'account_action_seq', align:'center'},
        { name: '_from', label: 'From', field: '_from', align:'center' },
        { name: 'test', label: '', field: 'test', align:'center' },
        { name: '_to', label: 'To', field: '_to', align:'center' },
        { name: '_quantity', label: 'Quantity', field: '_quantity', align:'center' },
        { name: '_symbol', label: 'Symbol', field: '_symbol', align:'center' },
        { name: '_memo', label: 'Memo', field: '_memo', align:'center' },
        { name: 'block_time', label: 'Block Time', field: 'block_time', align:'center', format: val => rf.format( new Date(moment.utc(val).format() ) ) },
        { name: 'txid', label: 'Txid', field: 'txid', align:'center'}
      ]
    }
  },
  methods: {
    displayTransfers (e){
        console.log('display transfer function')
    },

    getBalances(){
      eos.getCurrencyBalance({account: this.title, code: "eosdactokens", symbol: "EOSDAC"}).then(x=>{
          this.eosdacbalance = x[0].slice(0,-7)
      }).catch(e => { });

      eos.getCurrencyBalance({account: this.title, code: "eosio.token", symbol: "EOS"}).then(x=>{
          this.eosbalance = x[0].slice(0,-4)
      }).catch(e => { });
    },

    request (props) {

      this.loading = true
      axios
      .get(`http://51.38.42.79/explorer/explorer_api_quasar.php?get=accounttransfers&page=${props.pagination.page}&length=${props.pagination.rowsPerPage}&sortBy=${props.pagination.sortBy}&descending=${props.pagination.descending}&filter=${props.filter}&account=${this.title}`)
      .then(({ data }) => {
        this.serverPagination = props.pagination
        let
          table = this.$refs.table,
          rows = data.data,
          { page, rowsPerPage, sortBy, descending } = props.pagination
          console.log(rows)
        if (props.filter) {
          rows = table.filterMethod(rows, props.filter)
        }
        if (sortBy) {
          rows = table.sortMethod(rows, sortBy, descending)
        }
        this.serverPagination.rowsNumber = data.totalrows

        this.serverData = rows
        this.loading = false
      })
      .catch(error => {
        // there's an error... do SOMETHING

        // we tell QTable to exit the "loading" state
        this.loading = false
      })
    }
  },
  mounted () {
    // once mounted, we need to trigger the initial server data fetch
    this.request({
      pagination: this.serverPagination,
      filter: this.filter
    });
    this.getBalances()
  },

watch: {
 '$route': function(){
            this.title = this.$route.params.accountname
            this.request({
                pagination: this.serverPagination,
                filter: this.filter
            });
          }
},

}
</script>