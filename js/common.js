function getTemplate(name){
  var deferred = $.Deferred();
  $.get('../views/partials/'+name+'.mst', function(template){
    Mustache.parse(template);
    deferred.resolve(template);
  });
  return deferred;
}


function saveOptions(options, callback){
	chrome.storage.sync.set(options, callback);
}

function restoreOptions(callback){
	chrome.storage.sync.get({
		ApexCode: 'DEBUG',
		ApexProfiling: 'DEBUG',
		Callout: 'DEBUG',
		Database: 'DEBUG',
		System: 'DEBUG',
		Validation: 'DEBUG',
		Visualforce: 'DEBUG',
		Workflow: 'DEBUG'
	},callback);
}