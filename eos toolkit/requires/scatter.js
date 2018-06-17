
    
 class MyScatter{

    constructor(Eos, AppToStart){
        //default networks
        this.networks = {
                jungle : {
                    blockchain:'eos',
                    host:'dev.cryptolions.io', 
                    port:38888,
                    chainId:'038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca' 
                },
                main : {
                    blockchain:'eos',
                    host:'node2.Liquideos.com', //nodes.get-scatter.com  node2.Liquideos.com
                    port:80, 
                    chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
                }
        }
        this.setNetwork();
        this.Eos = Eos;
        this.AppToStart = AppToStart;
        this._initScatter(Eos, AppToStart);
        //TODO
        // setTimeout(() => {this.noScatter()}, 1000);

    }//end constructor


    _initScatter(Eos, AppToStart){
        this.msg('Detecting Scatter...');
        var self = this;
        document.addEventListener('scatterLoaded', async scatterExtension => {
            self.scatter = window.scatter; 
            window.scatter = null;

            try{
                let network = await self.scatter.suggestNetwork(self.network);

                if(network){
                    self.msg('Network: '+network);
                    self.msg('Getting Identity from Scatter: '+network);
                    let identity = await self.scatter.getIdentity({accounts:[self.network]});
                    self.identity_name = identity.name;
                    self.accountname = identity.accounts[0].name;
                    self.authority = identity.accounts[0].authority;
                    self.msg("Logged in with identity: " + identity.name);
                    self.msg("Linked EOS account: "+self.accountname+'@'+self.authority);
                    const eosOptions = self.network;
                    self.scatter.eos = self.scatter.eos( self.network, Eos, eosOptions );
                    AppToStart._init(self, 1);
                    self.updateGui();
                    self.addEvents();
                    setTimeout(()=> window.loading_screen.finish(), 600);
                }
                else{self.msg('no network')}

            }catch(e){console.error(e)}
        });

    }
    noScatter(){
        //todo read only mode
        if(window.scatter == undefined){
            console.log(this.Eos);
            this.eos = this.Eos.modules.api;//read only
            this.scatter = null;
            this.AppToStart._init(this,0);
            window.loading_screen.finish();
        }
    }
    
    setNetwork(){
        if (localStorage.getItem("scatternetworks") === null) {
            localStorage.setItem('scatternetworks', JSON.stringify(this.networks));
            localStorage.setItem("activenetwork", 'jungle');//default to jungle
        }
        this.networks = JSON.parse(localStorage.getItem("scatternetworks"));
        let activenetwork = localStorage.getItem("activenetwork");

        this.network = this.networks[activenetwork];

    }

    msg(msg){
        console.log(msg);
        $('.loading-message').html(msg);
    }

    addEvents(){
        var self =this;

        $('.refresh').on('click', function(){
            self.scatter.forgetIdentity().then(() => {
                location.reload();
            });
        })

        $('.switchnetwork').on('change', function(){
            let val =this.value;
            localStorage.setItem("activenetwork", val);
            location.reload();

        })

    }

    updateGui(){
        // $('.header_group_right').html(this.accountname+'@'+this.authority+'<div class="refresh"></div>');
        $('.header_group_right').html(this.identity_name+'<div class="refresh" onclick="" title="Switch identity"></div>');
        // $('.header_group_right').append('<form class="pure-form " ><select class="switchnetwork"><option value="0">JUNGLENET</option><option value="1">MAINNET</option></select></form>');
        let form = $('<form class="pure-form" style="text-align:center">');
        let select = $('<select class="switchnetwork">');

        for (var key in this.networks) {
            if (this.networks.hasOwnProperty(key)) {
                let selected='';
                if(key === localStorage.getItem("activenetwork")){
                    selected = 'selected'
                }
                let t = `<option ${selected} value="${key.toLowerCase()}">${key.toUpperCase()}NET</option>`;
                select.append(t)
            }
        }
        form.append(select);      
        $('#menu').prepend(form);
    }

}

module.exports = {
    MyScatter
};
