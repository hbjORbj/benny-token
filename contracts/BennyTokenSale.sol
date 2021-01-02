// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./BennyToken.sol";

contract BennyTokenSale {
  address admin; // we don't want to expose the address of admin so its visibility is not 'public'
  BennyToken public tokenContract;
  uint256 public tokenPrice;
  //   uint256 public tokensSold;

  event Sell(address _buyer, uint256 _amount);

  constructor(BennyToken _tokenContract, uint256 _tokenPrice) public {
    // Assign an admin
    admin = msg.sender;

    // Assign token contract
    tokenContract = _tokenContract;

    // Assign token price
    tokenPrice = _tokenPrice;
  }

  //   function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
  //     require(y == 0 || (z = x * y) / y == x);
  //   }

  //   function buyTokens(uint256 _numberOfTokens) public payable {
  //     require(msg.value == multiply(_numberOfTokens, tokenPrice));
  //     require(tokenContract.balanceOf(this) >= _numberOfTokens);
  //     require(tokenContract.transfer(msg.sender, _numberOfTokens));

  //     tokensSold += _numberOfTokens;

  //     emit Sell(msg.sender, _numberOfTokens);
  //   }

  //   function endSale() public {
  //     require(msg.sender == admin);
  //     require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

  //     admin.transfer(address(this).balance);
  //   }
}
