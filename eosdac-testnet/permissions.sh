#!/bin/bash

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh



echo -e "\n\n----------------- PERMISSIONS -------------------\n\n";




# These have to be set now because they are required in daccustodian_transfer.json
# These permissions are set in new period to the custodians with each configured threshold
run_cmd "set account permission $dacauthority high $EOSIO_PUB active -p $dacauthority@owner"
run_cmd "set account permission $dacauthority med $EOSIO_PUB high -p $dacauthority@owner"
run_cmd "set account permission $dacauthority low $EOSIO_PUB med -p $dacauthority@owner"
run_cmd "set account permission $dacauthority one $EOSIO_PUB low -p $dacauthority@owner"


# resign extra account to dacauthority@active
run_cmd "set account permission $dacextra active ./perms/resign.json owner -p $dacextra@owner"
run_cmd "set account permission $dacextra owner ./perms/resign.json '' -p $dacextra@owner"

# resign dactokens account to dacauthority@active
run_cmd "set account permission $dactokens active ./perms/resign.json owner -p $dactokens@owner"
run_cmd "set account permission $dactokens owner ./perms/resign.json '' -p $dactokens@owner"

# resign dacmultisigs account to dacauthority@active
run_cmd "set account permission $dacmultisigs active ./perms/resign.json owner -p $dacmultisigs@owner"
run_cmd "set account permission $dacmultisigs owner ./perms/resign.json '' -p $dacmultisigs@owner"

# resign dacowner account to dacauthority@active, must allow timelocked transfers
# from daccustodian@eosio.code
# daccustodian_transfer.json allows the contract to make transfers with a time delay, or
# dacauthority@med without a time delay.  dacowner must have permission in xfer to transfer tokens
run_cmd "set account permission $dacowner xfer ./perms/daccustodian_transfer.json active -p $dacowner@owner"
run_cmd "set action permission $dacowner eosio.token transfer xfer -p $dacowner@owner"
# Resign eosdacthedac
run_cmd "set account permission $dacowner active ./perms/resign.json owner -p $dacowner@owner"
run_cmd "set account permission $dacowner owner ./perms/resign.json '' -p $dacowner@owner"

# Create xfer permission and give it permission to transfer EOSDAC tokens
run_cmd "set account permission $daccustodian xfer ./perms/daccustodian_transfer.json active -p $daccustodian@owner"
run_cmd "set action permission $daccustodian $dactokens transfer xfer -p $daccustodian@owner"
# Resign daccustodian
run_cmd "set account permission $daccustodian active ./perms/resign.json owner -p $daccustodian@owner"
run_cmd "set account permission $daccustodian owner ./perms/resign.json '' -p $daccustodian@owner"



# Allow high to call any action on daccustodian
run_cmd "set action permission $dacauthority $daccustodian '' high -p $dacauthority@owner"
#run_cmd "set action permission $dacauthority $daccustodian '' high -p $dacauthority@owner"
# These 2 actions require a medium permission
run_cmd "set action permission $dacauthority $daccustodian firecust med -p $dacauthority@owner"
run_cmd "set action permission $dacauthority $daccustodian firecand med -p $dacauthority@owner"
# Allow one to call the multisig actions
run_cmd "set action permission $dacauthority $dacmultisigs '' one -p $dacauthority@owner"
#run_cmd "set action permission $dacauthority eosio updateauth owner -p $dacauthority@owner"
# set dacauthority@owner to point to daccustodian@eosio.code
run_cmd "set account permission $dacauthority active ./perms/dacauthority_active.json owner -p $dacauthority@owner"
run_cmd "set account permission $dacauthority owner ./perms/daccustodian_updateauth.json '' -p $dacauthority@owner"




dacaccounts="$dacextra $dacowner $dactokens $dacauthority $daccustodian $dacmultisigs"

for act in $dacaccounts
do
  echo "------------- $act ---------------"
  cleos --wallet-url $WALLET_URL -u $API_URL get account -j $act | jq '.permissions'
done

#run_cmd "set account permission $dacauthority owner ./dac_auth_perms.json '' -p dacauthority@owner"
