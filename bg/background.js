// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

// Define behavior when browser action icon is clicked
function showPageAction( tabId, changeInfo, tab ) {
	if(tab.url.indexOf('salesforce.com') != -1){
		tabid = tabid;
	    chrome.pageAction.show(tabId);
	    url = tab.url;
	    getSessionId(tab.url);
	}
};

function checkUrl(activeInfo){
	chrome.tabs.get(activeInfo.tabId, function(tab){
		if(tab.url && tab.url.indexOf('salesforce.com') != -1){
			url = tab.url;
			getSessionId(tab.url);
		}
	});
}
// Call the above function when the url of a tab changes.
chrome.tabs.onUpdated.addListener(showPageAction);

chrome.tabs.onActivated.addListener(checkUrl);

var url, sid, users, tabid, oid;
var client = new forcetk.Client();

function getSessionId(url){
	chrome.cookies.get({url: url, name: "sid"}, function(cookie){
		if(sid != cookie.value){
			sid = cookie.value;
			client.setSessionToken(sid, null, getInstanceUrl(url));
		}
	})
}

function loginAs(userId){
	chrome.tabs.update(tabid, {url: getInstanceUrl(url) +
		 '/servlet/servlet.su?oid='+oid+
		 '&suorgadminid='+userId + 
		 '&retURL=%2Fhome%2Fhome.jsp'+
		 '&targetURL=%2Fhome%2Fhome.jsp'
	});
}

function getUrl(){
	return getInstanceUrl(url);
}

function getInstanceUrl(url){
	var spl = url.split('/');
	return spl[0] + '//' + spl[2];
}

function shout(){
	var d = new Date($.now());
	console.log('shout!', d.toTimeString());
}

function getUsers(callback){
	/* first check that oid hasn't changed */
	chrome.cookies.get({url: url, name: "oid"}, function(cookie){
		if((cookie.value && oid !== cookie.value) || !users){
			oid = cookie.value;
			client.query("select id, firstname, lastname, profile.name, userrole.name from User where isactive = true order by LastName", function(response){
				users = response.records;
				callback(users);
			});
		}
		else{
			callback(users);
		}
	});
	
}



