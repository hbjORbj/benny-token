const BennyToken = artifacts.require("../contracts/BennyToken.sol");
const BennyTokenSale = artifacts.require("../contracts/BennyTokenSale.sol");

contract("BennyTokenSale", (accounts) => {
  var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; // in wei (15 zeroes) equals 0.001 Ether
  var tokensAvailable = 750000; // 75% of total supply
  var numberOfTokens = 10;

  it("initializes the contract with the correct values", () => {
    return BennyTokenSale.deployed()
      .then((result) => {
        tokenSaleInstance = result;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has token sale contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "token price is correct");
      });
  });

  it("facilitates purchase of tokens", () => {
    return BennyToken.deployed()
      .then((result) => {
        // Grab token contract
        tokenInstance = result;
        return BennyTokenSale.deployed();
      })
      .then((result) => {
        // Grab token sale contract
        tokenSaleInstance = result;
        // Provision 75% of all tokens to the token sale
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvailable,
          { from: admin }
        );
      })
      .then((receipt) => {
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          "should be the 'Sell' event"
        );
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account that purchased the tokens"
        );
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then((amount) => {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), numberOfTokens);
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot purchase more tokens than available"
        );
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must equal number of tokens in wei"
        );
      });
  });

  it("ends token sale", function () {
    return BennyToken.deployed()
      .then(function (instance) {
        // Grab token instance first
        tokenInstance = instance;
        return BennyTokenSale.deployed();
      })
      .then(function (instance) {
        // Then grab token sale instance
        tokenSaleInstance = instance;
        // Try to end sale from account other than the admin
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert" >= 0, "must be admin to end sale")
        );
        // End sale as admin
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then(function (receipt) {
        return tokenInstance.balanceOf(admin);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          999990,
          "returns all unsold Benny tokens to admin"
        );
      });
  });
});
