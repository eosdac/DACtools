<template>
  <q-table
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
    <q-td slot="body-cell-_from" slot-scope="props" :props="props">
      <router-link :to="{path: '/account/' + props.value}" >{{ props.value }}</router-link>
    </q-td>

    <q-td slot="body-cell-_to" slot-scope="props" :props="props">
      <router-link :to="{path: '/account/' + props.value}" >{{ props.value }}</router-link>
    </q-td>

    <q-td slot="body-cell-txid" slot-scope="props" :props="props">
      <router-link :to="{path: '/transaction/' + props.value}" >{{ props.value.slice(0,10)+'...' }}</router-link>
    </q-td>

    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model.trim="filter" />
      <q-btn flat round dense color="brand" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen"/>
    </template>

  </q-table>

</template>

<script>

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
        rowsPerPage: this.$store.state.app.rowsPerPage,
        rowsNumber: 10 // specifying this determines pagination is server-side
      },

      serverData: [],
      title:'Transfers',
      columns: [
        { name: 'account_action_seq', label: 'Seq', field: 'account_action_seq', align:'center'},
        { name: '_from', label: 'From', field: '_from', align:'center', searchable:true},
        { name: '_to', label: 'To', field: '_to', align:'center', searchable:true},
        { name: '_quantity', label: 'Quantity', field: '_quantity', align:'center' },
        { name: '_symbol', label: 'Symbol', field: '_symbol', align:'center' },
        { name: 'block_time', label: 'Block Time', field: 'block_time', align:'center', format: val => rf.format( new Date(moment.utc(val).format() ) ) },
        { name: 'txid', label: 'Txid', field: 'txid', align:'center', searchable:true}
      ]
    }
  },

  methods: {
    request (props) {

      this.loading = true;
      this.$axios
      .get(this.$tableApi.adapt('transfers',0, this.columns, props) )
      .then(({ data }) => {
        this.serverPagination = props.pagination;

        let table = this.$refs.table;
        let rows = data.data;
        let { page, rowsPerPage, sortBy, descending } = props.pagination;
        if (props.filter) {
          rows = table.filterMethod(rows, props.filter);
        }
        if (sortBy) {
          rows = table.sortMethod(rows, sortBy, descending);
        }
        this.serverPagination.rowsNumber = data.recordsTotal == data.recordsFiltered ? data.recordsTotal : data.recordsFiltered;

        this.serverData = rows;
        this.loading = false;
        this.$store.commit('app/setRowsPerPage', props.pagination.rowsPerPage);
      })
      .catch(error => {
        this.loading = false;
        this.$q.notify({message:'Error getting table data from server.', color:'negative'});
      })
    }
  },

  mounted () {
    this.request({
      pagination: this.serverPagination,
      filter: this.filter
    })
  }
}
</script>