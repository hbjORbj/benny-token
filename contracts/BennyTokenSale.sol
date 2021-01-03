// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./BennyToken.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BennyTokenSale {
  using SafeMath for uint256;
  address payable admin; // we don't want to expose the address of admin so its visibility is not 'public'
  BennyToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(address _buyer, uint256 _amount);

  constructor(BennyToken _tokenContract, uint256 _tokenPrice) public {
    // Assign an admin
    admin = msg.sender;

    // Assign token contract
    tokenContract = _tokenContract;

    // Assign token price
    tokenPrice = _tokenPrice;
  }

  function buyTokens(uint256 _numberOfTokens) public payable {
    // Require that the contract has enough tokens
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

    // Require that value is equal to the value of tokens
    require(msg.value == _numberOfTokens.mul(tokenPrice));

    // Require that a transfer is successful
    require(tokenContract.transfer(msg.sender, _numberOfTokens));

    // Keep track of number of tokens sold
    tokensSold = tokensSold.add(_numberOfTokens);

    emit Sell(msg.sender, _numberOfTokens);
  }

  // Ending Token Sale
  function endSale() public {
    // Only Admin can end the sale
    require(msg.sender == admin);
    require(
      tokenContract.transfer(admin, tokenContract.balanceOf(address(this)))
    );
    // Transfer remaining tokens to admin
    admin.transfer(address(this).balance);
  }
}
