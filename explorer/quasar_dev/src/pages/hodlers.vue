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

      this.loading = true

      this.$axios
      .get(this.$tableApi.adapt('hodlers',1, this.columns, props) )
      .then(({ data }) => {

        this.serverPagination = props.pagination
        let table = this.$refs.table
        let rows = data.data
        let { page, rowsPerPage, sortBy, descending } = props.pagination

        if (props.filter) {
          rows = table.filterMethod(rows, props.filter)
        }
        if (sortBy) {
          rows = table.sortMethod(rows, sortBy, descending)
        }
        this.serverPagination.rowsNumber = data.recordsTotal == data.recordsFiltered ? data.recordsTotal : data.recordsFiltered

        this.serverData = rows
        this.loading = false
      })
      .catch(error => {
        this.loading = false
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