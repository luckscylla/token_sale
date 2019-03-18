App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	tokenPrice: 1000000000000000,
	tokensSold: 0,
	tokensAvailable: 750000,

	init: function() {
		console.log("App initialized ...");
		return App.initWeb3();
	},

	initWeb3: function() {
		// If a web3 instance is already provided by Meta Mask.
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);

		// Specify default instance if no web3 instance provided
		} else {
			App.web3Provider = new Web3.providers.WebsocketProvider('ws://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContract();
	},

	initContract: function() {
		$.getJSON("DappTokenSale.json", function(dappTokenSale) {
			App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
			App.contracts.DappTokenSale.setProvider(App.web3Provider);
			App.contracts.DappTokenSale.deployed().then(function(dappTokenSale) {
				console.log("Dapp Token Sale Address:", dappTokenSale.address);
			});
		}).done(function() {
			$.getJSON("DappToken.json", function(dappToken) {
				App.contracts.DappToken = TruffleContract(dappToken);
				App.contracts.DappToken.setProvider(App.web3Provider);
				App.contracts.DappToken.deployed().then(function(dappToken) {
					console.log("Dapp Token Address:", dappToken.address);
				});
				return App.render();
			});
		});
	},

	render: function() {
		$('#loader').show();

		// load account data
		web3.eth.getCoinbase(function(err, account) {
			if(err === null) {
				App.account = account;
				$('#accountAddress').html("Your Account: " + account);
			}
		});

		App.contracts.DappTokenSale.deployed().then(async function(instance) {
			tokenPrice = await instance.tokenPrice();
			App.tokenPrice = tokenPrice.toNumber();
			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
			tokensSold = await instance.tokensSold();
			// App.tokensSold = 500000;
			App.tokensSold = tokensSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);
			$('.tokens-available').html(App.tokensAvailable);
			let progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
			$('#progress').css('width', progressPercent + '%');
		});

		App.contracts.DappToken.deployed().then(async function(instance) {
			balance = await instance.balanceOf(App.account);
			$('.dapp-balance').html(balance.toNumber());
			$('#loader').hide();
		});

	},

	buyTokens: function() {
		var numberOfTokens = $('#numberOfTokens').val();
		App.contracts.DappTokenSale.deployed().then(async function(instance) {
			result = await instance.buyTokens(numberOfTokens, {
				from: App.account, 
				value: numberOfTokens * App.tokenPrice,
				gas: 500000	// gas limit
			});
			console.log("Tokens bought ... ");
			return App.render();
		});
	},

}

$(function() {
	$(window).load(function() {
		App.init();
	})
})

