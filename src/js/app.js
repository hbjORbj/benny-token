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
      alert(
        "You need an Ethereum interface injected into browser (i.e. Meta Mask)."
      );
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
        App.listenForEvents();
        return App.render();
      });
    });
  },

  listenForEvents: function () {
    App.contracts.BennyTokenSale.deployed().then(function (instance) {
      instance
        .Sell(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("Event Triggered", event);
          App.render();
        });
    });
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;
    let loader = $("#loader");
    let content = $("#content");

    loader.show();
    content.hide();

    ethereum
      .enable()
      .then(function (accounts) {
        App.account = accounts[0];
        $("#accountAddress").html("Your Account: " + App.account);
      })
      .catch(function (error) {
        console.log(error);
      });

    // Load Token Sale contract
    App.contracts.BennyTokenSale.deployed()
      .then(function (instance) {
        bennyTokenSaleInstance = instance;
        return bennyTokenSaleInstance.tokenPrice();
      })
      .then(function (tokenPrice) {
        App.tokenPrice = tokenPrice.toNumber();
        $("#token-price").html(web3.fromWei(tokenPrice.toNumber(), "ether"));
        return bennyTokenSaleInstance.tokensSold();
      })
      .then(function (tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $("#tokens-sold").html(App.tokensSold);
        $("#tokens-remaining").html(App.tokensRemaining);

        // Progress Bar
        let progressPercent =
          (App.tokensSold / App.tokensRemaining).toFixed(5) * 100;
        $("#progress").css("width", progressPercent + "%");

        // Load Token contract
        App.contracts.BennyToken.deployed()
          .then(function (instance) {
            bennyTokenInstance = instance;
            return bennyTokenInstance.balanceOf(App.account);
          })
          .then(function (balance) {
            $("#token-balance").html(balance.toNumber());

            App.loading = false;
            loader.hide();
            content.show();
          });
      });
  },

  buyTokens: function () {
    $("#content").hide();
    $("#loader").show();
    let numberOfTokens = $("#numberOfTokens").val();
    App.contracts.BennyTokenSale.deployed()
      .then(function (bennyTokenSale) {
        return bennyTokenSale.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000,
        });
      })
      .then(function (result) {
        // Wait for Sell event to be triggered
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
