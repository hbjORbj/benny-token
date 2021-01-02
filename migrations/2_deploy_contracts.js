const BennyToken = artifacts.require("BennyToken");
const BennyTokenSale = artifacts.require("BennyTokenSale");

module.exports = function (deployer) {
  deployer.deploy(BennyToken, 1000000).then(() => {
    var tokenPrice = 1000000000000000; // in wei (15 zeroes) equals 0.001 Ether
    return deployer.deploy(BennyTokenSale, BennyToken.address, tokenPrice);
  });
};
