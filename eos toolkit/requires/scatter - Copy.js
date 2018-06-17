
    
 class MyScatter{

    constructor(Eos, AppToStart){
    //     const network = {
    //         blockchain:'eos',
    //         host:'node2.Liquideos.com', // ( or null if endorsed chainId ) 145.239.252.91:8888 dev.cryptolions.io:38888
    //         port:8888, // ( or null if defaulting to 80 )
    //     }
    //     const network2 = {
    //         blockchain:'eos',
    //         host:'node2.Liquideos.com', // ( or null if endorsed chainId ) 145.239.252.91:8888 dev.cryptolions.io:38888
    //         port:8888, // ( or null if defaulting to 80 )
            // chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    //     }

const network = {
    blockchain:'eos',
    host:'dev.cryptolions.io', 
    port:38888, 
}
const network2 = {
    blockchain:'eos',
    host:'dev.cryptolions.io', 
    port:38888, 
    chainId:'038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
}

        document.addEventListener('scatterLoaded', scatterExtension => {
            var self = this;
            this.scatter = window.scatter; window.scatter = null;
            this.accountname='';
            this.authority='';
            var eos;
            // scatter.requireVersion(3.0);
            this.scatter.suggestNetwork(network).then(hasnetwork => {
                console.log('Network: '+hasnetwork);
                const eosOptions = {chainId : network2.chainId};
                self.scatter.eos = self.scatter.eos( network2, Eos, eosOptions );
                // console.log(eos.getCode())
                // console.log(scatter)
                self.scatter.getIdentity({accounts:[network]}).then(identity => {
                    console.log("Logged in with identity: " + identity.name);
                    self.identity_name = identity.name;
                    // let accountname = identity.accounts.find(account => account.blockchain === 'eos').name;
                    self.accountname = identity.accounts[0].name;
                    self.authority = identity.accounts[0].authority;
                    if(self.accountname && self.authority == "active"){
                        console.log("Linked EOS account: "+self.accountname+'@'+self.authority);
                        // new App(scatter, eos);
                        AppToStart._init(self);
                        self.updateGui();
                        setTimeout(()=> window.loading_screen.finish(), 500);
                    }
                    else{
                        console.log("No linked EOS account with @active authority!");
                    }
                }).catch(e => console.log(e));

            }).catch(e => console.log('Network error!'));

        });    
    }//end constructor
    updateGui(){
        // $('.header_group_right').html(this.accountname+'@'+this.authority+'<div class="refresh"></div>');
        $('.header_group_right').html(this.identity_name+'<div class="refresh" title="Switch identity"></div>');

    }

}

module.exports = {
    MyScatter
};
