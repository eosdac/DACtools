<template>

<q-search color="brand" dark v-model.trim="terms" placeholder="Account" style="background:none">
  <q-autocomplete
    dark
    @search="search"
    :min-characters="3"
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
      test:10,
      terms:''

    }
  },
  
  methods:{
    search(terms, done){
      this.$axios.get(`http://51.38.42.79/explorer/explorer_api.php?search=${terms.trim()}`).then(response=>{
          
          done(response.data)
      })
      .catch(e=>{done([])})
    },
    selected(item){
          this.$router.push({ path: `/account/${item.value}` })
          this.terms='';    
    }

  },

  mounted: function(){
    console.log(JSON.stringify(this.$store.state) )
  }
   
}
</script>