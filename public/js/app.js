'use strict';

angular.module('rafc', ['ngRoute', 'rafc.controllers', 'rafc.filters']).config(['$routeProvider', function ($routeProvider) {

		$routeProvider.when('/', {templateUrl: 'partial/index.html'});
		$routeProvider.when('/main', {templateUrl: 'partial/main.html', controller: 'MainPageCtrl'});
		$routeProvider.when('/game/:rno/:uno', {templateUrl: 'partial/game.html', controller: 'GameCtrl'});


    	$routeProvider.otherwise({redirectTo: '/'});
	}]);

