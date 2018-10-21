#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh

run_cmd() {
        cmd="$1";
        echo -e "\n\n >> ${green} Next command: $1 \n\n ${reset}";
        #wait;
        #read -p "Press enter to continue ${reset}";
        eval "cleos --wallet-url $WALLET_URL -u $API_URL $1";
}

echo -e "\n\n----------------- BUILDING CONTRACTS -------------------\n\n";

PWD=`pwd`

cd $DACCONTRACTS/daccustodian/
git pull
$EOSIOCPP -DTOKEN_CONTRACT='"eosdactokens"' -DTRANSFER_DELAY=10 -o daccustodian.wasm daccustodian.cpp

cd $DACCONTRACTS/eosdactoken/
git pull
cd eosdactoken/
$EOSIOCPP -o eosdactoken.wasm eosdactoken.cpp

cd $PWD

run_cmd "set contract "$dactokens" "$DACCONTRACTS/eosdactoken/eosdactoken" -p eosdactokens"

run_cmd "set contract "$daccustodian" "$DACCONTRACTS/daccustodian" -p daccustodian"
