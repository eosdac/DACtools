<template>

<q-search color="brand" dark v-model.trim="terms" placeholder="Account" style="background:none">
  <q-autocomplete
    dark
    @search="search"
    :min-characters="3"
    :delay="0"
    @selected="selected"
  />
</q-search>

</template>

<style>

</style>

<script>

export default {
  data () {
    return {
      terms:''
    }
  },
  
  methods:{
    search(terms, done){
      console.log(this.$store.app)
      this.$axios.get(`${this.$store.state.app.explorer_config.settings.base_api_url}?search=${terms.trim()}`).then(response=>{

          done(response.data);
      })
      .catch(e=>{
        this.$q.notify({message:'Error getting autocomplete data from server.', color:'negative'});
        done([]);
      })
    },

    selected(item){
          this.$router.push({ path: `/account/${item.value}` });
          this.terms='';    
    }

  }
   
}
</script>