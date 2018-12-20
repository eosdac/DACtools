#!/bin/bash

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh



echo -e "\n\n----------------- NEW PERIOD -------------------\n\n";



run_cmd "push action daccustodian newperiod '[\"New Period\"]' -p eosdaccustab"
