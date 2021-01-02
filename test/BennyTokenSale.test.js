const BennyTokenSale = artifacts.require("../contracts/BennyTokenSale.sol");

contract("BennyTokenSale", (accounts) => {
  var tokenSaleInstance;
  var tokenPrice = 1000000000000000 // in wei (15 zeroes) equals 0.001 Ether
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
});
