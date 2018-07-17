import eosjs from 'eosjs-api'

const eos = eosjs({
              chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
              httpEndpoint: 'http://147.75.78.129:8866',  //'http://147.75.78.129:8866' 'http://node2.Liquideos.com:80
              expireInSeconds: 60,
              logger: {
                log:  null,
                error: null // null to disable
              } 
            });

export default ({ Vue }) => {
  Vue.prototype.$eos = eos
}
