var templates = {};
var templateNames = ['user', 'table', 'head', 'select', 'spinner', 'message', 'modal'];

/**
 * Load templates
 */
function getTemplate(name){
  var deferred = $.Deferred();
  $.get('../views/partials/'+name+'.mst', function(template){
    Mustache.parse(template);
    deferred.resolve(template);
  });
  return deferred;
}

var templateDeferreds = [];
for(i in templateNames){
	templateDeferreds.push(getTemplate(templateNames[i]));
}

$.when.apply($, templateDeferreds).done(function(){
	for(i in templateNames){
		templates[templateNames[i]] = arguments[i]; 
	}

	log.debug('Loginas', 'loaded templates', templateNames );
});