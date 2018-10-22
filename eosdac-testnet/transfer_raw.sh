#!/bin/bash

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh

echo -e "\n\n----------------- TRANSFER TOKENS -------------------\n\n";


./msig/gen_requested_permissions.py

run_cmd "transfer -s -d -j $dacowner eosio \"100.0000 EOS\" \"An msig transfer by med\" -p $dacowner@xfer > transfer.trx"
run_cmd "multisig cancel eosdaccustab txprop eosdaccustab"
run_cmd "multisig propose_trx txprop ./requested_perms.json transfer.trx eosdaccustab"

for x in {a..i}
do
  CUST="eosdaccusta$x"
  run_cmd "multisig approve eosdaccustab txprop '{\"actor\":\"$CUST\", \"permission\":\"active\"}' -p $CUST"
done
run_cmd "multisig exec eosdaccustab txprop eosdaccustab"
