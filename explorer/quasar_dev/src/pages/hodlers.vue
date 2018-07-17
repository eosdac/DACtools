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
  <q-td slot="body-cell-account" slot-scope="props" :props="props">
    <router-link :to="{path: '/account/' + props.value}" >{{ props.value }}</router-link>
  </q-td>

  <q-td slot="body-cell-balance" slot-scope="props" :props="props" :style="{width:'80%'}">
    {{ props.value }}
  </q-td>

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
import axios from 'axios';
export default {
  data () {
    return {
      filter: '',
      loading: false,
      serverPagination: {
        page: 1,
        rowsPerPage: 7,
        rowsNumber: 1, // specifying this determines pagination is server-side
      },

      serverData: [],
      title:'Hodlers',
      columns: [
        { name: 'rank', label: '', field: 'rank', align: 'center'},
        { name: 'account', label: 'Account', field: 'account', align: 'center'},
        { name: 'balance', label: 'EOSDAC', field: 'balance' , align: 'left'}
      ]
    }
  },

  methods: {
    request (props) {
      // we set QTable to "loading" state
      this.loading = true

      axios
      .get(`http://51.38.42.79/explorer/explorer_api_quasar.php?get=hodlers&page=${props.pagination.page}&length=${props.pagination.rowsPerPage}&sortBy=${props.pagination.sortBy}&descending=${props.pagination.descending}&filter=${props.filter}`)
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