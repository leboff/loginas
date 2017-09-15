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

	$('.slds-dropdown-trigger--click').click(function(action){
		var menu = $(action.target).closest('.slds-dropdown-trigger');
		if(menu.hasClass('slds-is-open')){
			menu.removeClass('slds-is-open');
		}
		else{
			menu.addClass('slds-is-open');
		}
	})
	//setup login button
	$('.login-btn').click(function(btn){
		var sfid = $(btn.target).closest('.login-btn').data('sfid');
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
		var sfid = $(btn.target).closest('.debug-btn').data('sfid');
		showDebugModal(sfid);
	});

	//setup view button
	$('.view-btn').click(function(btn){
		var sfid = $(btn.target).closest('.view-btn').data('sfid');
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
	var deferred = new $.Deferred();
	var query = $('#lookup').val().toLowerCase();

	$('body').append(bigLoading);
	
	if(query.length == 0) return bp.getUsers();
	if(query.length < 2) return deferred.resolve(users);

	bp.getUsers(query).then(deferred.resolve)


	return deferred;

}

var createRows = function(users){
	var deferred = new $.Deferred();
	var columns = [{id: 'Name', label: 'Name'}];
	restoreOptions().then(function(options){
		//setup view
		_.each(options.userFields, function(field){
			columns.push(field);
		})
		var rows = _.map(users, function(user){
			var row = _.map(columns, function(column){
				return {
					label: column.label,
					value: _.get(user, column.id.replace('-', '.'))
				}
			})
			row.Id = user.Id;
			return row;
		});
		var view = {
			columns: columns,
			users: rows
		}
		deferred.resolve(view);
	});
	return deferred;
}
log.debug('Loginas', 'background sid', bp.sid);
if(bp.sid){
	log.debug('Loginas', 'Getting users');

	//load users
	$('#userTable').append(bigLoading);

	bp.getUsers().done(function(users){

		//render view
		createRows(users).then(renderView);

		//setup lookup search
		$('#lookup').keyup(function(){

			filter(users)
				.then(createRows)
				.then(function(view){
					bigLoading.remove();
					renderView(view);
				});
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
