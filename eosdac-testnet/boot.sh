#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf.sh



echo -e "\n\n----------------- BOOT SEQUENCE -------------------\n\n";

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


run_cmd "set contract eosio "$CONTRACTS/eosio.bios" -p eosio";

run_cmd "create account eosio eosio.msig $EOSIO_PUB"
sleep 1;
cleos --wallet-url $WALLET_URL -u $API_URL get account eosio.msig;

run_cmd "create account eosio eosio.token $EOSIO_PUB"
sleep 1;
cleos --wallet-url $WALLET_URL -u $API_URL get account eosio.token;

run_cmd "create account eosio eosio.ram $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.ram;

run_cmd "create account eosio eosio.ramfee $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.ramfee;

run_cmd "create account eosio eosio.names $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.names;

run_cmd "create account eosio eosio.stake $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.stake;

run_cmd "create account eosio eosio.saving $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.saving;

run_cmd "create account eosio eosio.bpay $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.bpay;

run_cmd "create account eosio eosio.vpay $EOSIO_PUB"
sleep 1;
cleos -u $API_URL get account eosio.vpay;

run_cmd "push action eosio setpriv "'["eosio.msig",1]'" -p eosio"
sleep 1;
cleos -u $API_URL get account -j eosio.msig | jq

run_cmd "set contract eosio.msig "$CONTRACTS/eosio.msig" -p eosio.msig"
run_cmd "get code eosio.msig"

run_cmd "set contract eosio.token "$CONTRACTS/eosio.token" -p eosio.token"
run_cmd "get code eosio.token"

cleos --wallet-url $WALLET_URL -u $API_URL push action eosio.token create '["eosio","10000000000.0000 EOS"]' -p eosio.token

cleos --wallet-url $WALLET_URL -u $API_URL get currency stats eosio.token EOS

cleos --wallet-url $WALLET_URL -u $API_URL push action eosio.token issue '["eosio",  "1000000000.0000 EOS", "initial issuance"]' -p eosio

cleos --wallet-url $WALLET_URL -u $API_URL get currency stats eosio.token EOS


sleep 1

# Install system contract
run_cmd "set contract eosio "$CONTRACTS/eosio.system" -p eosio"

run_cmd "get code eosio"
