<template>
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
  <q-td slot="body-cell-_from" slot-scope="props" :props="props">
    <!-- <a  :href="'./account/'+props.value">{{ props.value }}</a> -->
    <router-link :to="{path: '/account/' + props.value}" >{{ props.value }}</router-link>
  </q-td>

  <q-td slot="body-cell-_to" slot-scope="props" :props="props">
    <!-- <a  :href="'./account/'+props.value">{{ props.value }}</a> -->
    <router-link :to="{path: '/account/' + props.value}" >{{ props.value }}</router-link>
  </q-td>

  <q-td slot="body-cell-txid" slot-scope="props" :props="props">
    <!-- <a  :href="'./transaction/'+props.value">{{ props.value.slice(0,10)+'...' }}</a> -->
    <router-link :to="{path: '/transaction/' + props.value}" >{{ props.value.slice(0,10)+'...' }}</router-link>
    <q-tooltip style="font-size:10px">{{ props.value }}</q-tooltip>
  </q-td>



<!-- 
    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model="filter" />
    </template> -->

    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model.trim="filter" />
      <q-btn
        flat round dense color="brand"
        :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="props.toggleFullscreen"
      />
    </template>

  </q-table>
</template>

<script>
// import tableData from 'assets/table-data'
import axios from 'axios';

const moment = require('moment');

var IntlRelativeFormat = require('intl-relativeformat');
if (!global.Intl) {
    global.Intl = require('intl'); // polyfill for `Intl`
}
var rf = new IntlRelativeFormat('en');

export default {
  data () {
    return {
      filter: '',
      loading: false,
      serverPagination: {
        page: 1,
        rowsPerPage: 7,
        rowsNumber: 10 // specifying this determines pagination is server-side
      },

      serverData: [],
      title:'Transfers',
      columns: [
        { name: 'account_action_seq', label: 'Seq', field: 'account_action_seq', sortable: true, align:'center'},
        { name: '_from', label: 'From', field: '_from', align:'center'},
        { name: '_to', label: 'To', field: '_to', align:'center' },
        { name: '_quantity', label: 'Quantity', field: '_quantity', align:'center' },
        { name: '_symbol', label: 'Symbol', field: '_symbol', align:'center' },
        { name: 'block_time', label: 'Block Time', field: 'block_time', align:'center', format: val => rf.format( new Date(moment.utc(val).format() ) ) },
        { name: 'txid', label: 'Txid', field: 'txid', align:'center'}
      ]
    }
  },
  methods: {
    request (props) {

      this.loading = true
      axios
      .get(`http://51.38.42.79/explorer/explorer_api_quasar.php?get=transfers&page=${props.pagination.page}&length=${props.pagination.rowsPerPage}&sortBy=${props.pagination.sortBy}&descending=${props.pagination.descending}&filter=${props.filter}`)
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
    })
  }
}
</script>