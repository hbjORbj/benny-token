App = {
  web3Provider: null,
  account: "0x0",
  contracts: {},
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensRemaining: 750000,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // if a web3 instance is provided by Meta Mask
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
    } else {
      alert("No Ethereum interface injected into browser. Read-only access");
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("BennyTokenSale.json", function (bennyTokenSale) {
      App.contracts.BennyTokenSale = TruffleContract(bennyTokenSale);
      App.contracts.BennyTokenSale.setProvider(App.web3Provider);
      App.contracts.BennyTokenSale.deployed().then(function (bennyTokenSale) {
        console.log("Benny Token Sale Address: ", bennyTokenSale.address);
      });
    }).done(function () {
      $.getJSON("BennyToken.json", function (bennyToken) {
        App.contracts.BennyToken = TruffleContract(bennyToken);
        App.contracts.BennyToken.setProvider(App.web3Provider);
        App.contracts.BennyToken.deployed().then(function (bennyToken) {
          console.log("Benny Token Address: ", bennyToken.address);
        });
        return App.render();
      });
    });
  },

  render: function () {
    ethereum
      .enable()
      .then(function (accounts) {
        App.account = accounts[0];
        $("#accountAddress").html("Your Account: " + App.account);
      })
      .catch(function (error) {
        console.log(error);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
