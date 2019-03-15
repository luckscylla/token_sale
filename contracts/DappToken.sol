pragma solidity ^0.5.0;

contract DappToken {
	string public name = "Dapp Token";
	string public symbol = "DAPP";
	string public standard = "Dapp Token v1.0";
	uint public totalSupply;
	mapping(address => uint) public balanceOf;

	event Transfer(address indexed _from, address indexed _to, uint _value);

	constructor(uint _initialSupply) public {
		totalSupply = _initialSupply;
		balanceOf[msg.sender] = _initialSupply;
	}

	function transfer(address _to, uint _value) public returns (bool success) {
		require(balanceOf[msg.sender] >= _value);
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		emit Transfer(msg.sender, _to, _value);
		return true;
	}
	

}