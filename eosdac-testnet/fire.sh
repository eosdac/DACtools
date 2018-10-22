#!/bin/bash

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh



echo -e "\n\n----------------- FIRING CUSTODIAN -------------------\n\n";


./msig/gen_requested_permissions.py

cat requested_perms.json

run_cmd "push action -s -d -j daccustodian firecust '[\"eosdaccustaa\"]' -p dacauthority@med > fire.trx"
run_cmd "multisig propose_trx firecust ./requested_perms.json fire.trx eosdaccustab"

for x in {a..i}
do
  CUST="eosdaccusta$x"
  run_cmd "multisig approve eosdaccustab firecust '{\"actor\":\"$CUST\", \"permission\":\"active\"}' -p $CUST"
done
run_cmd "multisig exec eosdaccustab firecust eosdaccustab"
