const BennyToken = artifacts.require("../contracts/BennyToken.sol");

contract("BennyToken", (accounts) => {
  var tokenInstance;
  it("initializes the contract with the correct values", () => {
    return BennyToken.deployed()
      .then((result) => {
        tokenInstance = result;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "Benny Token", "correct name");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "BENNY", "correct symbol");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.equal(standard, "Benny Token v1.0", "correct standard");
      });
  });

  it("allocates the initial suuply upon deployment", () => {
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
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          "it allocates the initial supply to the admin account."
        );
      });
  });

  it("transfers token ownership", () => {
    return BennyToken.deployed()
      .then((result) => {
        tokenInstance = result;
        // Test 'require' statement by transferring something larger than the sender's balance
        return tokenInstance.transfer.call(accounts[1], 9999999999999999999);
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("fault") >= 0,
          "error message must contain fault"
        );
        return tokenInstance.transfer.call(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then((success) => {
        assert.equal(success, true, "it returns true");
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "should be the 'Transfer' event"
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          250000,
          "logs the transfer amount"
        );

        return tokenInstance.balanceOf(accounts[1]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          250000,
          "adds the amount to the receiver's account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          750000,
          "deducts the amount from the sender's account"
        );
      });
  });

  it("approves tokens for delegated transfer", () => {
    return BennyToken.deployed()
      .then((result) => {
        tokenInstance = result;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then((success) => {
        assert.equal(success, true, "it returns true");
        return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          "should be the 'Approval' event"
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are authorized by"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorized to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          100,
          "logs the transfer amount"
        );
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          100,
          "stores the allowance for delegated transfer"
        );
      });
  });

  it("handles delegated token transfers", () => {
    return BennyToken.deployed()
      .then((result) => {
        tokenInstance = result;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        middleMan = accounts[4];
        // Transfer some tokens to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then((receipt) => {
        // Approve middleMan to spend 10 tokens from fromAccount
        return tokenInstance.approve(middleMan, 10, { from: fromAccount });
      })
      .then((receipt) => {
        // Try transferring something larger than the sender's balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 101, {
          from: middleMan,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer values larger than balance of _from"
        );
        // Try transferring something larger than the allowed (or approved) amount
        return tokenInstance.transferFrom(fromAccount, toAccount, 11, {
          from: middleMan,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer values larger than approved amount"
        );
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: middleMan,
        });
      })
      .then((success) => {
        assert.equal(success, true, "it returns true");
        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: middleMan,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "should be the 'Transfer' event"
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          toAccount,
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          10,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          90,
          "deducts the amount from the account of _from"
        );
        return tokenInstance.balanceOf(toAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          10,
          "adds the amount to the account of _to"
        );
        return tokenInstance.allowance(fromAccount, middleMan);
      })
      .then((allowance) => {
        assert.equal(allowance, 0, "deducts the amount from the allowance.");
      });
  });
});
