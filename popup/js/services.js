'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('loginas.services', []).
  service('BackgroundService',['$q', function($q){
  	var bp = chrome.extension.getBackgroundPage();


  	this.getUsers = function(){
      return $q.when(bp.getUsers());
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
      $.when(bp.debugLog(userId)).then(bp.loginAs);
    }
  }]).
  value('version', '0.0.4');
