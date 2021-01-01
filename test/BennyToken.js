const BennyToken = artifacts.require("../contracts/BennyToken.sol");

contract("BennyToken", (accounts) => {
  it("sets the total supply upon deployment", () => {
    return BennyToken.deployed()
      .then((result) => {
        tokenInstance = result;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "sets the total supply to 1,000,000"
        );
      });
  });
});
