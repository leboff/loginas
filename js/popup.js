var bp = chrome.extension.getBackgroundPage();

var templates = bp.templates;
var loading = $(Mustache.render(templates.spinner, {size: 'small'}));
var bigLoading = $(Mustache.render(templates.spinner, {size: 'large', brand: true}));

//facilitate adding messages
function addMessage(theme, message,icon){
	var toast = $(Mustache.render(templates.message, {theme: theme, message: message, icon:icon}));
	$('#notifications').append(toast);
	toast.delay(5000).fadeOut();
}

//facilitate modal creation
function showDebugModal(sfid){
	$('body').append(bigLoading);

	bp.getDebugLevels().done(function(debugLevels){
		bigLoading.remove();
		//setup view
		view = {
			header: 'Select a Debug Level',
			label: 'Debug Level',
			options: []
		}
		for(i in debugLevels){
			var log = debugLevels[i];

			view.options.push({
				label: log.MasterLabel,
				value: log.Id
			});
		}

		//render modal
		var modal = $(Mustache.render(templates.modal, view, {
			content: templates.select
		}));

		//add save button
		modal.find('#modal-save').click(function(btn){
			$(btn.target).append(loading);

			var debugLevel = $('#debuglevels').val();

			bp.debugUser(sfid, debugLevel).done(function(sucess){
				addMessage('success', 'Debug log added successfully');
			}).fail(function(error){
				addMessage('error', error, 'error');
			}).always(function(){
				if(trackEvent) trackEvent('debug');
				loading.remove();
				modal.remove();
			});
		});

		//add cancel button
		modal.find('#modal-cancel').click(function(){
			modal.remove();
		});

		//append to the body
		$('body').append(modal);

	}).fail(function(error){
		log.error('Loginas', 'Failed to get debug logs', error);
	});


}
//if we have our session id lets get our users
function renderView(view){
	$('#userTable').empty();

	var table = Mustache.render(templates.table, view, {
		head: templates.head,
		user: templates.user
	});

	$('#userTable').append(table);

	//setup login button
	$('.login-btn').click(function(btn){
		var sfid = $(btn.target).data('sfid');
		$(btn.target).append(loading);

		bp.loginAsUser(sfid).fail(function(error){
			addMessage('error', error, 'error');
		}).always(function(){
			if(trackEvent) trackEvent('login');
			loading.remove();
		});
	});

	//setup debug button
	$('.debug-btn').click(function(btn){
		var sfid = $(btn.target).data('sfid');

		showDebugModal(sfid);
	
	});

	//setup view button
	$('.view-btn').click(function(btn){
		var sfid = $(btn.target).data('sfid');
		$(btn.target).append(loading);
		
		bp.viewUser(sfid).fail(function(error){
			addMessage('error', error, 'error');
		}).always(function(){
			if(trackEvent) trackEvent('view');
			loading.remove();
		});
	});
}


function filter(users){
	//filter user list
	var query = $('#lookup').val().toLowerCase();
	if(query.length < 2) return users;
	return _.filter(users, function(user){
		var objString = JSON.stringify(user).toLowerCase();
		return objString.indexOf(query) != -1;
	});

}

log.debug('Loginas', 'background sid', bp.sid);
if(bp.sid){
	log.debug('Loginas', 'Getting users');

	//load users
	$('#userTable').append(bigLoading);

	bp.getUsers().done(function(users){

		//setup view
		var view = {
			columns: ['Action', 'Last', 'First',  'Role', 'Profile'],
			users: users
		}

		//render view
		renderView(view);

		//setup lookup search
		$('#lookup').keyup(function(){
			view.users = filter(users);
			renderView(view);
		});

	}).fail(function(error){
		bigLoading.remove();
		addMessage('error', error, 'error');
		log.error('Loginas', 'Failed to get users', error);
	});
}
else{
	addMessage('error', 'No session id found', 'error');
}

//setup showlogs button
$('#showLogs').click(function(){
	bp.showDebugLogs().then(function(){
		if(trackEvent) trackEvent('showLogs');
	});
});
