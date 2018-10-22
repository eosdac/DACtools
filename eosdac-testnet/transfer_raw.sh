#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh



echo -e "\n\n----------------- TRANSFER TOKENS -------------------\n\n";

run_cmd() {
        cmd="$1";
        echo -e "\n\n >> ${green} Next command: $1 \n\n ${reset}";
        #wait;
        #read -p "Press enter to continue ${reset}";
        eval "cleos --wallet-url $WALLET_URL -u $API_URL $1";
}

./msig/gen_requested_permissions.py

run_cmd "transfer -s -d -j $dacowner eosio \"100.0000 EOS\" \"An msig transfer by low\" -p $dacowner@xfer > transfer.trx"
run_cmd "multisig cancel eosdaccustab txprop eosdaccustab"
run_cmd "multisig propose_trx txprop ./requested_perms.json transfer.trx eosdaccustab"

for x in {a..g}
do
  CUST="eosdaccusta$x"
  run_cmd "multisig approve eosdaccustab txprop '{\"actor\":\"$CUST\", \"permission\":\"active\"}' -p $CUST"
done
run_cmd "multisig exec eosdaccustab txprop eosdaccustab"
