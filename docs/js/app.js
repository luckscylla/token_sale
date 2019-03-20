
App = {
	contracts: {},
	account: '0x0',
	tokenPrice: 1000000000000000,
	tokensSold: 0,
	tokensAvailable: 750000,
	tokenContractAddr: "0x2F5FdC715A2dbC91C2916f84c6B92c38Eb5934b0",
	tokenSaleContractAddr: "0x1EB43811725A004BcC0e506f228bc6a655a4658e",

	init: function() {
		console.log("App initializing ...");
		return App.initWeb3();
	},

	initWeb3: function() {
		if (typeof web3 !== 'undefined') {
			web3.currentProvider.on('accountsChanged', function (accounts) {
				console.log("account changed: " + accounts[0]);
				App.account = accounts[0];
				return App.render();
			});
			if(web3.eth.accounts[0] == null) {
				console.log("user account is not found !");
			} else {
				console.log("user account: " + web3.eth.accounts[0]);
				App.account = web3.eth.accounts[0];
				return App.initContract();
			}
		} else {
			console.log("web3 service not found !");
		}
	},

	initContract: function() {
		$.getJSON("DappToken.abi", function(abi) {
			App.contracts.DappToken = web3.eth.contract(abi).at(App.tokenContractAddr);
			$.getJSON("DappTokenSale.abi", function(abi) {
				App.contracts.DappTokenSale = web3.eth.contract(abi).at(App.tokenSaleContractAddr);
				App.listenForEvents();
				return App.render();
			});
		});
	},

	listenForEvents: function() {
		let sellEvent = App.contracts.DappTokenSale.Sell();
		sellEvent.watch(function(error, result) {
			if(!error) {
				$('#status').html("Token transaction is done !");
				return App.render();
			} else {
				console.log(error);
			}
		});
	},

	render: function() {
		$('#accountAddress').html(App.account);

		web3.eth.getBalance(App.account, function(error, result) {
			if(!error) {
				// console.log("balabce: " + result);
				balance = result.toNumber();
				$('.eth-balance').html(web3.fromWei(balance, "ether"));
			} else {
				console.log(error);
			}
		});

		App.contracts.DappToken.balanceOf(App.account, function(error, result) {
			if(!error) {
				// console.log("balabce: " + result);
				balance = result.toNumber();
				$('.dapp-balance').html(balance);
			} else {
				console.log(error);
			}
		});

		App.contracts.DappTokenSale.tokenPrice(function(error, result) {
			if(!error) {
				// console.log("token-price: " + result);
				App.tokenPrice = result.toNumber();
				$('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
			} else {
				console.log(error);
			}
		});

		App.contracts.DappTokenSale.tokensSold(function(error, result) {
			if(!error) {
				// console.log("tokens-sold: " + result);
				App.tokensSold = result.toNumber();
				$('.tokens-sold').html(App.tokensSold);
				$('.tokens-available').html(App.tokensAvailable);
				let progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
				$('#progress').css('width', progressPercent + '%');
			} else {
				console.log(error);
			}
		});

	},

	buyTokens: function() {
		let numberOfTokens = $('#numberOfTokens').val();
		let sender = {
				from: App.account, 
				value: numberOfTokens * App.tokenPrice,
				gas: 500000	// gas limit
			};
		$('#status_bar').show();
		$('#status').html("Token transaction is waiting confirmation ...");
		console.log("Buy Tokens ... ");
		App.contracts.DappTokenSale.buyTokens(numberOfTokens, sender, function(error, result) {
			if(!error) {
				$('#status').html("Token transaction is under processing ...");
			} else {
				console.log(error);
			}
		});
	},

}

$(function() {
	$(window).load(function() {
		App.init();
	})
})

