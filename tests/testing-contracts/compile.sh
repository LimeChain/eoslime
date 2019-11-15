DIRECTORY=./tests/testing-contracts/compiled

if [ ! -d "$DIRECTORY" ]; then
    mkdir ./tests/testing-contracts/compiled
fi


FILE=./tests/testing-contracts/compiled/faucet.wasm
if [ ! -f "$FILE" ]; then
    eosio-cpp -I . -o ./tests/testing-contracts/compiled/faucet.wasm ./tests/testing-contracts/faucet.cpp --abigen
fi
FILE=./tests/testing-contracts/compiled/eosio.token.wasm
if [ ! -f "$FILE" ]; then
    eosio-cpp -I . -o ./tests/testing-contracts/compiled/eosio.token.wasm ./tests/testing-contracts/eosio.token.cpp --abigen
fi
