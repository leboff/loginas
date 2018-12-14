var userFields = [
	{
		id: 'Id',
		label: 'Id'
	},
	{
		id: 'Profile-Name',
		label: 'Profile'
	},
	{
		id: 'UserRole-Name',
		label: 'Role'
	},
	{
		id: 'Username',
		label: 'Username'
	},
	{
		id: 'Email',
		label: 'Email'
	}

];

var saveOptions = function(options){
	var deferred = new $.Deferred();
	
	chrome.storage.sync.set(options, deferred.resolve);

	return deferred;
}

var restoreOptions = function(){
	var deferred = new $.Deferred();
	chrome.storage.sync.get({
		userFields: [
			{
				id: 'Profile-Name',
				label: 'Profile'
			},
			{
				id: 'UserRole-Name',
				label: 'Role'
			}
		],
		standardUsersOnly: true
	},deferred.resolve);

	return deferred;
}
