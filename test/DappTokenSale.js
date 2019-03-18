const DappToken = artifacts.require("./DappToken.sol");
const DappTokenSale = artifacts.require("./DappTokenSale.sol");
const truffleAssert = require("truffle-assertions");

contract('DappTokenSale', function(accounts) {
	let tokenInstance;
	let tokenSaleInstance;
	let admin = accounts[0];
	let buyer = accounts[1];
	let tokenPrice = 1000000000000000;	// in wei
	let tokensAvailable = 7500;
	let numberOfTokens;

	// it('initializes the contract with correct values', function() {
	// 	return DappTokenSale.deployed().then(function(instance) {
	// 		tokenSaleInstance = instance;
	// 		return tokenSaleInstance.address;
	// 	}).then(function(address) {
	// 		assert.notEqual(address, 0x0, 'has contract address');
	// 		return tokenSaleInstance.tokenContract();
	// 	}).then(function(address) {
	// 		assert.notEqual(address, 0x0, 'has token contract address');
	// 		return tokenSaleInstance.tokenPrice();
	// 	}).then(function(price) {
	// 		assert.equal(price, tokenPrice, 'has contract token price');
	// 	});
	// });
	//
	// it('facilitates token buying', function() {
	// 	return DappToken.deployed().then(function(instance) {
	// 		tokenInstance = instance;
	// 		return DappTokenSale.deployed();
	// 	}).then(function(instance) {
	// 		// grab some of tokens to token sale instance
	// 		tokenSaleInstance = instance;
	// 		return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
	// 	}).then(function(receipt) {
	// 		numberOfTokens = 100;
	// 		return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
	// 	}).then(function(receipt) {
	// 		assert.equal(receipt.logs.length, 1, 'triggers one event');
	// 		assert.equal(receipt.logs[0].event, 'Sell', 'should be "Sell" event');
	// 		assert.equal(receipt.logs[0].args._buyer, buyer, 'check buyer');
	// 		assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'check token amount');
	// 		return tokenSaleInstance.tokenSold();
	// 	}).then(function(amount) {
	// 		assert.equal(amount.toNumber(), numberOfTokens, 'check tokens sold');
	// 		return tokenInstance.balanceOf(buyer);
	// 	}).then(function(balance) {
	// 		assert.equal(balance.toNumber(), numberOfTokens, 'check buyer tokens');
	// 		return tokenInstance.balanceOf(tokenSaleInstance.address);
	// 	}).then(function(balance) {
	// 		assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'check remaining tokens');
	// 		return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
	// 	}).then(assert.fail).catch(function(error) {
	// 		assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
	// 		numberOfTokens = 8000;
	// 		return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
	// 	}).then(assert.fail).catch(function(error) {
	// 		assert(error.message.indexOf('revert') >= 0, 'numberOfTokens must be available');
	// 	});
	// });

	it('initializes the contract with the correct values', async function() {
		tokenSaleInstance = await DappTokenSale.deployed();

		assert.notEqual(tokenSaleInstance.address, 0x0, 'has contract address');
		assert.notEqual(await tokenSaleInstance.tokenContract(), 0x0, 'has token contract address');
		assert.equal(await tokenSaleInstance.tokenPrice(), tokenPrice, 'token price is correct');
		// assert.equal(await tokenSaleInstance.admin(), admin, 'admin is correct');
	});

	it('facilitates token buying', async function() {
		tokenInstance = await DappToken.deployed();
		tokenSaleInstance = await DappTokenSale.deployed();
		await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});

		const numberOfTokens = 100;
		const receipt = await tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});

		truffleAssert.eventEmitted(
			receipt, 'Sell',
			(ev) => {return ev._buyer === buyer && ev._amount.toNumber() === numberOfTokens;}
		);

		const tokensSold = await tokenSaleInstance.tokensSold();
		assert.equal(tokensSold.toNumber(), numberOfTokens, 'check tokens sold');
		
		const buyerBalance = await tokenInstance.balanceOf(buyer);
		assert.equal(buyerBalance.toNumber(), numberOfTokens, 'check buyer tokens');

		const tokenSaleBalance = await tokenInstance.balanceOf(tokenSaleInstance.address);
		assert.equal(tokenSaleBalance.toNumber(), tokensAvailable - numberOfTokens, 'check remaining tokens');

		truffleAssert.reverts(
			tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1}), null,
			'check msg.value must equal number of tokens in wei'
		);

		truffleAssert.reverts(
			tokenSaleInstance.buyTokens(8000, { from: buyer, value: 8000 * tokenPrice }), null,
			'check available tokens'
		);
	});

	it('ends token sale', async function () {
		tokenInstance = await DappToken.deployed();
		tokenSaleInstance = await DappTokenSale.deployed();

		truffleAssert.reverts(tokenSaleInstance.endSale({from: buyer}), null, 'only admin can call endSale');

		await tokenSaleInstance.endSale({from: admin});

		const adminTokens = await tokenInstance.balanceOf(tokenSaleInstance.address);
		assert.equal(adminTokens.toNumber(), 0, 'the contract should has no token');

		// const tokenPrice = await tokenSaleInstance.tokenPrice();
		// assert.equal(tokenPrice.toNumber(), 0, 'token price should be reset');
	});

})