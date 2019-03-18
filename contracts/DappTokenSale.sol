pragma solidity ^0.5.0;

import "./DappToken.sol";

contract DappTokenSale {
	address payable admin;
	DappToken public tokenContract;
	uint public tokenPrice;
	uint public tokensSold;

	event Sell(address indexed _buyer, uint _amount);

	constructor(DappToken _tokenContract, uint _tokenPrice) public {
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

	function buyTokens(uint _numberOfTokens) public payable {
		// correct token price
		require(msg.value == multiply(_numberOfTokens, tokenPrice));
		// enough tokens
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
		// transfer tokens
		require(tokenContract.transfer(msg.sender, _numberOfTokens));
		tokensSold += _numberOfTokens;
		emit Sell(msg.sender, _numberOfTokens);
	}

	function endSale() public {
		require(msg.sender == admin);
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
		selfdestruct(admin);
	}

}