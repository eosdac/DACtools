# eosDAC testnet

These scripts will install and configure eosDAC contracts on a freshly started chain.

## Configuration

Copy the configuration files conf.example.sh, conf_private.example.sh and conf_dac.example.sh to conf.sh, conf_private.sh and conf_dac.sh

You will need to modify all of the files to your needs, make sure that the public key in conf_private.sh matches your genesis.json file

## boot.sh

This script will boot the base eosio chain and install the system contracts.

## populate.sh

This will populate all of the eosDAC contracts as well as developer, test custodian and test voter accounts.

## build.sh

Will compile and install the eosDAC contrats, run this if you modify the contracts after booting for the first time.

## permissions.sh

All the DAC accounts will be resigned and permissions set up to allow the dac to operate.
