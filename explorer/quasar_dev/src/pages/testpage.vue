<template>
<q-page >
<div></div>
</q-page >
</template>

<style>

</style>

<script>

const prettyHtml = require('json-pretty-html').default;

export default {
  data () {
    return {
      test:10

    }
  },
  
  methods:{

  },

  mounted: function(){
    console.log(JSON.stringify(this.$store.state) )
  }
   
}
</script>