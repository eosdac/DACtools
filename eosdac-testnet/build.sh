#!/bin/bash

green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh

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
