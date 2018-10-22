#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh



echo -e "\n\n----------------- POPULATING DAC -------------------\n\n";

run_cmd() {
        cmd="$1";
        echo -e "\n\n >> ${green} Next command: $1 \n\n ${reset}";
        #wait;
        #read -p "Press enter to continue ${reset}";
        eval "cleos --wallet-url $WALLET_URL -u $API_URL $1";
}

create_act() {
  act="$1"
  key="$2"
  eval "cleos --wallet-url $WALLET_URL -u $API_URL system newaccount --stake-cpu \"10.0000 EOS\" --stake-net \"10.0000 EOS\" --transfer --buy-ram-kbytes 1024 eosio $act $key"
}


dacaccounts="$dacextra $dacowner $dactokens $dacauthority $daccustodian"

for act in $dacaccounts
do
        create_act $act $EOSIO_PUB
        #run_cmd "system newaccount --stake-cpu \"10.0000 EOS\" --stake-net \"10.0000 EOS\" --transfer --buy-ram-kbytes 1024 eosio $act $EOSIO_PUB"
        #sleep 1;
        #cleos --wallet-url $WALLET_URL -u $API_URL get account $act;
done

run_cmd "transfer eosio $dacowner \"100000.0000 EOS\""

run_cmd "set contract "$dactokens" "$DACCONTRACTS/eosdactoken/eosdactoken" -p eosdactokens"
run_cmd "get code $dactokens"

run_cmd "push action $dactokens newmemterms terms.json -p $dactokens"
echo "[$daccustodian]" > token_config.json
run_cmd "push action $dactokens updateconfig token_config.json -p $dactokens"
rm -f token_config.json

cleos --wallet-url $WALLET_URL -u $API_URL push action $dactokens create '["eosdactokens", "10000000000.0000 EOSDAC", 0]' -p $dactokens
cleos --wallet-url $WALLET_URL -u $API_URL push action $dactokens issue '["eosdactokens", "1000000000.0000 EOSDAC", "Issue"]' -p $dactokens

run_cmd "set contract $daccustodian "$DACCONTRACTS/daccustodian" -p daccustodian"
run_cmd "get code $daccustodian"

run_cmd "get table $daccustodian daccustodian config"

run_cmd "push action $daccustodian updateconfig dac_config.json -p $dacauthority"

run_cmd "get table $daccustodian $daccustodian config"


# Developer accounts
create_devs() {
  create_act evilmikehere EOS54NkNpEt9aotyBvEZVfj54NuFAebaDLnyg2GtJ6pyvBoxxg9Aw
  run_cmd "transfer eosio evilmikehere \"10000000.0000 EOS\""
  run_cmd "transfer -c eosdactokens eosdactokens evilmikehere \"100000000.0000 EOSDAC\""

  create_act kasperkasper EOS5JLKQDsJwqh6vVTbqVnHsHDk6He1Xo6nsQSy3536B1gx3FGzZJ
  run_cmd "transfer eosio kasperkasper \"10000000.0000 EOS\""
  run_cmd "transfer -c eosdactokens eosdactokens kasperkasper \"10000000.0000 EOSDAC\""

  create_act dallasdallas EOS5kt3N8qEwwRYYvWWZaJvsoz9iuVurLRhw36vckmSesHdm8A9su
  run_cmd "transfer eosio dallasdallas \"10000000.0000 EOS\""
  run_cmd "transfer -c eosdactokens eosdactokens dallasdallas \"10000000.0000 EOSDAC\""

  create_act lukedactest1 EOS8YE3xbMVSiDxrJCK3qRsxT8e7ThfvpxdmwaXgeMAn5VYJxE26G
  run_cmd "transfer eosio lukedactest1 \"5000000.0000 EOS\""
  run_cmd "transfer -c eosdactokens eosdactokens lukedactest1 \"5000000.0000 EOSDAC\""

  create_act lukedactest2 EOS5qhoS2McrhC6mkW2gN4eDPZZJhf3EQEvUf1gZoRxJTJXoNrFVk
  run_cmd "transfer eosio lukedactest2 \"5000000.0000 EOS\""
  run_cmd "transfer -c eosdactokens eosdactokens lukedactest2 \"5000000.0000 EOSDAC\""

  create_act tiktiktiktik EOS5yMoSRtLecubsQmTVSmdurCAnh6etwRsVDNoXx697Jr193GRKp
  run_cmd "transfer eosio tiktiktiktik \"10000000.0000 EOS\""
  run_cmd "transfer -c eosdactokens eosdactokens tiktiktiktik \"10000000.0000 EOSDAC\""
}
create_devs


# Get the terms to hash it for registration
CONSTITUTION=$(cleos -u $API_URL get table eosdactokens eosdactokens memberterms | jq '.rows[0].terms' | tr -d '"')
wget -O constitution.md $CONSTITUTION

ARCH=$( uname )
if [ "$ARCH" == "Darwin" ]; then
  CON_MD5=$(md5 constitution.md | cut -d' ' -f4)
else
  CON_MD5=$(md5sum constitution.md | cut -d' ' -f1)
fi

rm -f constitution.md


# Build this array for random voting later
CUST_ACCTS=()


# Custodian accounts
for x in {a..z}
do
  CUST="eosdaccusta$x"
  CUST_ACTS+=($CUST)
  create_act $CUST $EOSIO_PUB
  run_cmd "transfer -c eosdactokens eosdactokens $CUST \"100000.0000 EOSDAC\""
  run_cmd "push action eosdactokens memberreg '[\"$CUST\", \"$CON_MD5\"]' -p $CUST"
  run_cmd "transfer -c eosdactokens $CUST daccustodian \"35000.0000 EOSDAC\" \"daccustodian\""
  run_cmd "push action daccustodian nominatecand '[\"$CUST\", \"10.0000 EOS\"]' -p $CUST"
done

# Voter accounts
for x in {a..z}
do
  for y in {a..z}
  do
    VOT="eosdacvote$x$y"
    create_act $VOT $EOSIO_PUB
    run_cmd "transfer -c eosdactokens eosdactokens $VOT \"300000.0000 EOSDAC\""
    run_cmd "push action eosdactokens memberreg '[\"$VOT\", \"$CON_MD5\"]' -p $VOT"
    # random votes
    numbers=$(jot -r 5 0 26)
    votes=()
    while read -r number; do
      vote=${CUST_ACTS[$number]}
      echo $vote
      votes+=($vote)
    done <<< "$numbers"

    votes_arr=($(tr ' ' '\n' <<< "${votes[@]}" | sort -u | tr '\n' ' '))
    json=$(jq -n --arg va "${votes_arr}" --arg v "${VOT}" '[$v, ($va | split(" ")) ]')
    echo $json > vote_data.json
    run_cmd "push action daccustodian votecust ./vote_data.json -p $VOT"
  done
done
