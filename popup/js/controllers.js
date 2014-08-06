'use strict';

/* Controllers */

angular.module('loginas.controllers', [])
  .controller('UserListController', ['$scope', 'BackgroundService', function($scope, BackgroundService) {
  	var bg = BackgroundService;

  	$scope.loaded = false;
  	$scope.url = bg.getUrl();

	$scope.loginAs = function(loginUser, e){
  		bg.loginAs(loginUser);
  		trackLogin(e);
  		window.close();
  	}


  	var setUsers = function(userData){
  		$scope.users = userData;
  		$scope.loaded = true;
  	}

  	bg.getUsers().then(setUsers);

  }]);