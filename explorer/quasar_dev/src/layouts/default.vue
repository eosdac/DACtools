<template>
  <div>

  <q-layout view="hhr LpR lff">
    <q-layout-header reveal>
      <q-toolbar color="primary" >
        <div class="absolute-center row justify-between items-center pagewidth">
          <router-link :to="{path: '/transfers/'}" class="text-mywhite">
            <img src="~assets/icon-eosdac-explorer-235x48.svg" style="height:40px">
            <!-- <q-icon class="q-ma-sm" style="font-size:14em" name="icon-signet-eosdac-explorer"></q-icon> -->
          </router-link>

          <div style="display:inline-block;">
            <form @submit.prevent="handleSubmit">
              <input type="text" name="" v-model.trim="userinput" style="min-width:300px; height:40px;border:none;border-radius:2px;padding-left:10px" placeholder="Account">
            </form>

          </div>

        </div>
      </q-toolbar>
    </q-layout-header>

    <q-page-container>

        <q-page  style="margin:0 auto;margin-bottom:50px; box-sizing: border-box;" class="pagewidth">
            <div >
                <!-- <router-view :key="$route.fullPath" /> -->
                <router-view  />
            </div>
        </q-page>
    </q-page-container>

    <q-layout-footer reveal>
      <q-toolbar color="primary">
        <div class="absolute-center pagewidth">
          <q-icon class="q-ma-sm text-mywhite" style="font-size:10em" name="icon-logo-footer-explorer"></q-icon>
          <!-- <img src="~assets/icon-footer-eosdac-explorer-140x40.svg" style="height:50px"> -->
        </div>
      </q-toolbar>
    </q-layout-footer>
    <q-btn
      v-back-to-top.animate="{offset: 500, duration: 200}"
      round
      color="brand"
      class="fixed-bottom-right animate-pop"
      style="margin: 0 20px 15px 0; z-index:9999"
    >
      <q-icon name="keyboard_arrow_up" />
    </q-btn>
  </q-layout>
</div>
</template>

<script>
// import { openURL } from 'quasar'


export default {
  name: 'LayoutDefault',
  data () {
    return {
      userinput:''
    }
  },
  methods: {
    // openURL
    handleSubmit() {
      // this.$router.go(`account/${this.userinput}`);
      if(this.userinput.length >= 12){
          // window.location=`/account/${this.userinput}`
          this.$router.push({ path: `/account/${this.userinput}` })
          this.userinput=''
      }

      // this.$router.push({ path: `/account/${this.userinput}` })
      // this.$router.replace({ path: '/'+this.userinput})

    }
  }
}
</script>

<style>
</style>
