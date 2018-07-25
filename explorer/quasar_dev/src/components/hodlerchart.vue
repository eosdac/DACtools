<template>
  <div style="">
    <q-window-resize-observable @resize="onResize" />
    <GChart 
      id="mychart"
      type="PieChart"
      :data="chartData"
      :options="chartOptions"

      :events="chartEvents"
      ref="gChart"
    />
    <div class="row justify-center">
    <q-slider
      style="width:80%"
      label-always
      snap
      :label-value="`${slidervalue}`"
      v-model="slidervalue" 
      :min="10" 
      :max="slidermax"
      :step="5"
      @input="inputChanged"
    />
  </div>
  </div>
</template>

<script>
import { GChart } from "vue-google-charts";
export default {
  name: "App",
  components: {
    GChart
  },

  data() {
    return {
      slidervalue:30, //initial value
      slidermax:100,
      unfiltereddata:[],
      chartData: [],
      chartOptions: {
        title: `Top 30 Holders`,
        width:'900',
        height:'500',
        titleTextStyle: {
            color: 'grey',
        },
        is3D:true,
        pieHole: 0.4,

        backgroundColor: {
          fill: '#1E2128',
          fillOpacity: 1,
        },
        // chartArea:{left:0,top:0,width:'100%',height:'75%'},
        legend: {
          textStyle: {color: 'gray'},
          position:'none',
          maxLines:1
        },
        tooltip:{
          // isHtml:true
        }
      },

      chartEvents: {
        select: () => {          
          let t =this.$refs.gChart.chartObject;
          let s =t.getSelection();

          if(s.length !== 0){
            let selected = this.chartData[s[0].row+1]
            this.$router.push(`/account/${selected[0]}`)
            console.log(selected)
          }
          // const selection = table.getSelection();          
          // alert(selection);
        }
      },

      
    };
  },

  methods:{
    getChartData(){
      this.$axios.get(`${this.$store.state.app.explorer_config.settings.base_api_url}?chart=topholders`)
      .then(response =>{
        let data = response.data
        this.slidermax = data.length
        let values = data.map(v => [v.account, (v.balance*1)] )

        values.unshift(["account", "bal"])
        this.chartData = values.slice(0, this.slidervalue+1)
        this.unfiltereddata = values

      })
      .catch(e => {})
    },

    inputChanged(val){
      this.chartData = this.unfiltereddata.slice(0, val+1)
      this.chartOptions.title = `Top ${val} Holders`
    },
    onResize (size) {
      console.log(size)
      this.chartOptions.width= size.width

    }
    

  },
  mounted : function(){
      this.getChartData()

  }
};
</script>
