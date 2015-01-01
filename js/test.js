angular.module('routerApp', ['ui.router'])
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/home');

		$stateProvider
			// Home state
			.state('home', {
				url: '/home',
				templateUrl: 'views/home.html'
			})
			.state('stock', {
				url: '/stock',
				templateUrl: 'views/stock.html'
			});
	});