// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract BennyToken {
  using SafeMath for uint256;
  string public name = "Benny Token";
  string public symbol = "BENNY";
  string public standard = "Benny Token v1.0";
  uint256 public totalSupply;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );

  // balanceOf is the amount of balance available in owner's account
  mapping(address => uint256) public balanceOf;

  // allowance is the amount which spender is allowed to withdraw from owner
  mapping(address => mapping(address => uint256)) public allowance;

  constructor(uint256 _initialSupply) public {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value);

    balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);

    emit Transfer(msg.sender, _to, _value);

    return true;
  }

  function approve(address _spender, uint256 _value)
    public
    returns (bool success)
  {
    allowance[msg.sender][_spender] = _value;

    emit Approval(msg.sender, _spender, _value);

    return true;
  }

  // Delegated Transfer
  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  ) public returns (bool success) {
    // Require _from has enough tokens
    require(_value <= balanceOf[_from]);

    // Require allowance is sufficient enough
    require(_value <= allowance[_from][msg.sender]);

    // Update the balances
    balanceOf[_from] = balanceOf[_from].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);

    // Update the allowance
    allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);

    // Transfer event
    emit Transfer(_from, _to, _value);

    // return a boolean
    return true;
  }
}
