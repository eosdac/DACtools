#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh



echo -e "\n\n----------------- UPDATE CONTRACT -------------------\n\n";


./msig/gen_requested_permissions.py

run_cmd "set code -s -d -j $daccustodian $DACCONTRACTS/daccustodian/daccustodian_migrate.wasm -p $daccustodian@active > setcode.trx"
run_cmd "multisig cancel eosdaccustab addmigrate eosdaccustab"
run_cmd "multisig propose_trx addmigrate ./requested_perms.json setcode.trx eosdaccustab"

for x in {a..j}
do
  CUST="eosdaccusta$x"
  run_cmd "multisig approve eosdaccustab addmigrate '{\"actor\":\"$CUST\", \"permission\":\"active\"}' -p $CUST"
done
run_cmd "multisig exec eosdaccustab addmigrate eosdaccustab"
