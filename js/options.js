var messageTemplate;
getTemplate('message').then(function(messageTmpl){
	messageTemplate = messageTmpl;
});



$(function(){
	restoreOptions(function(options){
		$('#apexCode').val(options.ApexCode);
		$('#apexProfiling').val(options.ApexProfiling);
		$('#callout').val(options.Callout);
		$('#database').val(options.Database);
		$('#system').val(options.System);
		$('#validation').val(options.Validation);
		$('#visualforce').val(options.Visualforce);
		$('#workflow').val(options.Workflow);
	});
	$('#save').click(function(){
		var options = 
		{
			ApexCode: $('#apexCode').val();
			ApexProfiling: $('#apexProfiling').val();
			Callout: $('#callout').val();
			Database: $('#database').val();
			System: $('#system').val();
			Validation: $('#validation').val();
			Visualforce: $('#visualforce').val();
			Workflow: $('#workflow').val();
		}
		saveOptions(function(){
		if(messageTemplate){
			var successMsg = $(Mustache.render(messageTemplate, {
				theme: 'success',
				message: 'Settings saved successfully'
			}));
			$('#notifications').append(successMsg);
			successMsg.delay(1000).fadeOut();
		}
		});
	});
});

