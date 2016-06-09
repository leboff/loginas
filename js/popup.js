var bp = chrome.extension.getBackgroundPage();

var templates = bp.templates;
//if we have our session id lets get our users
function renderView(view){
	$('#userTable').empty();

	var render = Mustache.render(templates.table, view, {
		head: templates.head,
		user: templates.user
	});

	$('#userTable').append(render);

	$('.login-btn').click(function(btn){
		var sfid = $(btn.target).data('sfid');
		bp.loginAsUser(sfid);
	});

	$('.debug-btn').click(function(btn){
		var sfid = $(btn.target).data('sfid');
		bp.debugUser(sfid);
	});

	$('.view-btn').click(function(btn){
		var sfid = $(btn.target).data('sfid');
		bp.viewUser(sfid);
	});
}


function filter(users){
	var query = $('#lookup').val().toLowerCase();
	if(query.length < 2) return users;
	return _.filter(users, function(user){
		var objString = JSON.stringify(user).toLowerCase();
		return objString.indexOf(query) != -1;
	});

}

if(bp.sid){
	bp.getUsers().then(function(users){		
		var view = {
			columns: ['Action', 'Last', 'First',  'Role', 'Profile'],
			users: users
		}

		renderView(view);

		$('#lookup').keyup(function(){
			view.users = filter(users);
			renderView(view);
		})
	});
}

