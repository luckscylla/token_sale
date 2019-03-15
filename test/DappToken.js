var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts) {
	it('initializes the contract with correct values', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'Dapp Token', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'DAPP', 'has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {	
			assert.equal(standard, 'Dapp Token v1.0', 'has the correct standard');
		});
	});

	it('allocates the initial supply upon deployment', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'set the total supply to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'allocates the initial supply to admin');
		});
	});

	it('transfer token ownership', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'check sender');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'check receiver');
			assert.equal(receipt.logs[0].args._value, 250000, 'check value');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'adds the amount to receiver account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750000, 'debucts the amount to sender account');
		});
	});


	it('approve tokens for delegated transfer', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be "Approval" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'check owner');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'check spender');
			assert.equal(receipt.logs[0].args._value, 100, 'check value');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 100, 'stores allowance for delegated transfer');
		});
	});


	it('handle delegated token transfer', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
		}).then(function(receipt) {
			return tokenInstance.approve(spendAccount, 10, {from: fromAccount});
		}).then(function(receipt) {
			return tokenInstance.transferFrom(fromAccount, toAccount, 999, {from: spendAccount});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'can not transfer value larger than balance');
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendAccount});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'can not transfer value larger than allowance');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendAccount});
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendAccount});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be "Transfer" event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'check from account');
			assert.equal(receipt.logs[0].args._to, toAccount, 'check to account');
			assert.equal(receipt.logs[0].args._value, 10, 'check value');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 90, 'deducts the amount from sender');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'add the amount from receiver');
			return tokenInstance.allowance(fromAccount, spendAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'debucts the amount from allowance');
		});
	});
});

