const BennyToken = artifacts.require("BennyToken");

module.exports = function (deployer) {
  deployer.deploy(BennyToken);
};
