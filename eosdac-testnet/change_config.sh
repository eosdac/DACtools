#!/bin/bash


source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh



echo -e "\n\n----------------- UPDATING CONFIG -------------------\n\n";

./msig/gen_requested_permissions.py

run
run_cmd "push action -s -d -j daccustodian updateconfig dac_config2.json -p dacauthority@high > updateconfig.trx"
run_cmd "multisig cancel eosdaccustab updconfig eosdaccustab"
run_cmd "multisig propose_trx updconfig ./requested_perms.json updateconfig.trx eosdaccustab"

for x in {a..j}
do
  CUST="eosdaccusta$x"
  run_cmd "multisig approve eosdaccustab updconfig '{\"actor\":\"$CUST\", \"permission\":\"active\"}' -p $CUST"
done
run_cmd "multisig exec eosdaccustab updconfig eosdaccustab"
