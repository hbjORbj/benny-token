module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: "7545",
      network_id: "*", // match any network id
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4700000,
    },
  },
  compilers: {
    solc: {
      version: "0.6.0", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200,
        },
        evmVersion: "byzantium",
      },
    },
  },
};
 