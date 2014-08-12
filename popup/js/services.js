'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('loginas.services', []).
  service('BackgroundService',['$q', function($q){
  	var bp = chrome.extension.getBackgroundPage();


  	this.getUsers = function(){
      var deferred = $q.defer();

      bp.getUsers(function(data){
        deferred.resolve(data);
      });

      return deferred.promise;
  	}

    this.getUrl = function(){
      return bp.getUrl();
    }
  	this.shout = function(){
  		bp.shout();
  	}
    this.loginAs = function(userId){
      bp.loginAs(userId);
    }
    this.debugLog = function(userId){
      bp.debugLog(userId);
    }
    this.debugLogin = function(userId){
      bp.debugLog(userId, this.loginAs);
    }
  }]).
  value('version', '0.0.4');
