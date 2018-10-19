#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh



echo -e "\n\n----------------- UPDATING CONFIG -------------------\n\n";

run_cmd() {
        cmd="$1";
        echo -e "\n\n >> ${green} Next command: $1 \n\n ${reset}";
        #wait;
        #read -p "Press enter to continue ${reset}";
        eval "cleos --wallet-url $WALLET_URL -u $API_URL $1";
}

./msig/gen_requested_permissions.py

run_cmd "push action -s -d -j daccustodian updateconfig dac_config2.json -p daccustodian@active > updateconfig.trx"
run_cmd "multisig propose_trx updconfig ./requested_perms.json updateconfig.trx eosdaccustab"

for x in {a..i}
do
  CUST="eosdaccusta$x"
  run_cmd "multisig approve eosdaccustab updconfig '{\"actor\":\"$CUST\", \"permission\":\"active\"}' -p $CUST"
done
run_cmd "multisig exec eosdaccustab updconfig eosdaccustab"
