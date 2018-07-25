<template>
  <div id="chartlistener" style="position:relative" :urlprop.sync="urlprop">
    <div class="bg-mypurple row " style="color:white;height:60px;line-height:60px;padding-left:35px" >
      EOSDAC TOKEN ACTIVITY
    </div>
    <q-window-resize-observable @resize="onResize" />
    <GChart 
      :settings="{packages: ['corechart', 'bar']}"
      :type="chartType"
      :data="chartData"
      :options="chartOptions"

      :events="chartEvents"
      ref="gChart"
    />
<q-fab
  color="primary"
  icon="keyboard_arrow_down"
  direction="down"
  class="absolute"
  style="right: 18px; top: 78px"
>
  <q-fab-action
    color="positive"
    @click="changeChartType('LineChart')"
    icon="show_chart"
  />

  <q-fab-action
    color="positive"
    @click="changeChartType('ColumnChart')"
    icon="bar_chart"
  />


</q-fab>

  </div>
</template>

<script>
import { GChart } from "vue-google-charts";
export default {
  name: "tokenactivity",
  components: {
    GChart
  },
  props :{
    urlprop :'',
  },
  data() {
    return {
      chartData: [],
      chartType: 'LineChart',
      chartOptions: {
        title: `Token activity`,
        width:'100%',
        height:'500',
        // curveType: 'function',
        titleTextStyle: {
            color: 'grey',
        },
        pointSize: 7,
        series: {
          0 : {color:'#491289'}
        },
        vAxis: {

          title: 'Transfers / Day',
          titleTextStyle: {color: 'grey'},
          baseline: 0,
          textStyle: { color: 'grey' },
          scaleType: 'linear'

        },
        hAxis:{
          title: 'UTC',
          textStyle: { color: 'grey' },
          titleTextStyle: {color: 'grey'}
        },
        // crosshair: {
        //   color: '#000',
        //   trigger: 'both'
        // },    
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
          // let t =this.$refs.gChart.chartObject;
          // let s =t.getSelection();

          // if(s.length !== 0){
          //   let selected = this.chartData[s[0].row+1]
          //   this.$router.push(`/account/${selected[0]}`)
          //   console.log(selected)
          // }
          // // const selection = table.getSelection();          
          // // alert(selection);
        }
      },

      
    };
  },

  methods:{
    getChartData(){
      this.$axios.get(this.urlprop)
      .then(response =>{
        let data = response.data;
        // console.log(data);

        let values = data.map(v => [v.date, (v.totalCount*1)] );
        // console.log(values);

        values.unshift(["date", "transfers"]);
        this.chartData = values;

      })
      .catch(e => {
        this.$q.notify({message:'Error getting chart data from server.', color:'negative'});
      })
    },
    changeChartType(type){
        this.chartType = type;
    },

    onResize (size) {
      // console.log(size)
      // this.chartOptions.width= (size.width*80/100)-14
      let el = document.getElementById("chartlistener");
      if(el){
        this.chartOptions.width=el.offsetWidth;
      }
    }
  },
  mounted : function(){
      this.getChartData()

  },
  watch: {
    urlprop: function () {
      this.getChartData()
      
    }
  },
};
</script>
