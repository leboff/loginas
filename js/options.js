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

var saveOptions = function(selectedItems){
	var deferred = new $.Deferred();
	
	chrome.storage.sync.set({
		userFields: selectedItems
	}, deferred.resolve);

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
		]
	},deferred.resolve);

	return deferred;
}
