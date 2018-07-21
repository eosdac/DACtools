import Vue from 'vue'
import Vuex from 'vuex'

import tables from './tables';
// import api from './api'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    tables
  }
})

export default store
