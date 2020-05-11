
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = "neglect vessel urban walk razor become swarm promote wing sorry observe alarm";
module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!

    networks: {

        development: {
            host: "127.0.0.1",
            port: 9545,
            network_id: 5777 // Match any network id
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/f29c7c2c2f424ecfa6f7d8bb421a985d")
            },
            network_id: 3
        },


    }
};
