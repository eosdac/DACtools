<template>
  <q-table
    ref="table"
    color="brand"
    dark
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
    <a  :href="'./account/'+props.value">{{ props.value }}</a>
  </q-td>

  <q-td slot="body-cell-_to" slot-scope="props" :props="props">
    <a  :href="'./account/'+props.value">{{ props.value }}</a>
  </q-td>

  <q-td slot="body-cell-txid" slot-scope="props" :props="props">
    <a  :href="'./transaction/'+props.value">{{ props.value.slice(0,10)+'...' }}</a>
  </q-td>



    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model="filter" />
    </template>

    <template slot="top-right" slot-scope="props">
      <q-search hide-underline v-model="filter" />
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
export default {
  data () {
    return {
      filter: '',
      loading: false,
      serverPagination: {
        page: 1,
        // rowsPerPage: 5,
        rowsNumber: 10 // specifying this determines pagination is server-side
      },

      serverData: [],
      title:'Transfers',
      columns: [
        { name: 'account_action_seq', label: 'Seq', field: 'account_action_seq', sortable: true },
        { name: '_from', label: 'From', field: '_from', sortable: true },
        { name: '_to', label: 'To', field: '_to' },
        { name: '_quantity', label: 'Quantity', field: '_quantity' },
        { name: '_symbol', label: 'Symbol', field: '_symbol' },
        { name: 'block_time', label: 'Block Time', field: 'block_time'},
        { name: 'txid', label: 'Txid', field: 'txid'}
      ]
    }
  },
  methods: {
    request ({ pagination, filter }) {
      // we set QTable to "loading" state
      this.loading = true
      console.log(pagination)

      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      axios
      .get(`http://51.38.42.79/explorer/explorer_api.php?get=transfers&offset=${pagination.page}&sortBy=${pagination.sortBy}&descending=${pagination.descending}&filter=${filter}`)
      .then(({ data }) => {
        // updating pagination to reflect in the UI
        // console.log(this.serverPagination)
        this.serverPagination = pagination

        // we also set (or update) rowsNumber
        this.serverPagination.rowsNumber = data.rowsNumber

        // then we update the rows with the fetched ones
        this.serverData = data

        // finally we tell QTable to exit the "loading" state
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