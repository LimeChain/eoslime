module.exports = {
    MAC_OS: (version) => {
        return `
        [ -d "/usr/local/Cellar/eosio" ] && rm -R /usr/local/Cellar/eosio
        [ -f "/usr/local/bin/nodeos" ] && rm /usr/local/bin/nodeos
        [ -f "/usr/local/bin/cleos" ] && rm /usr/local/bin/cleos  
        [ -f "/usr/local/bin/keosd" ] && rm /usr/local/bin/keosd 
        wget https://github.com/EOSIO/eos/releases/download/v${version}/eosio-${version}.mojave.bottle.tar.gz
        tar -xf eosio-${version}.mojave.bottle.tar.gz
        cp ./eosio/${version}/bin/nodeos /usr/local/bin/
        cp ./eosio/${version}/bin/cleos /usr/local/bin/
        cp ./eosio/${version}/bin/keosd /usr/local/bin/
        mv ./eosio /usr/local/Cellar 
        rm ./eosio-${version}.mojave.bottle.tar.gz 
        brew tap eosio/eosio.cdt 
        brew install eosio.cdt
        `;
    },
    // Todo: Test on ubuntu
    Ubuntu_18: (version) => {
        return `
        apt remove eosio && 
        wget https://github.com/eosio/eos/releases/download/v${version}/eosio_${version}-1-ubuntu-18.04_amd64.deb && 
        apt install ./eosio_${version}-1-ubuntu-18.04_amd64.deb &&
        rm ./eosio_${version}-1-ubuntu-18.04_amd64.deb && 
        wget https://github.com/eosio/eosio.cdt/releases/download/v1.7.0/eosio.cdt_1.7.0-1-ubuntu-18.04_amd64.deb &&
        apt install ./eosio.cdt_1.7.0-1-ubuntu-18.04_amd64.deb && 
        rm ./eosio.cdt_1.7.0-1-ubuntu-18.04_amd64.deb
        `;
    },
    // Todo: Test on ubuntu
    Ubuntu_16: (version) => {
        return `
        apt remove eosio && 
        wget https://github.com/eosio/eos/releases/download/v${version}/eosio_${version}-1-ubuntu-16.04_amd64.deb && 
        apt install ./eosio_${version}-1-ubuntu-16.04_amd64.deb
        `;
    }
}

