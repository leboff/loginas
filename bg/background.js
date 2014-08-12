//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

// Define behavior when browser action icon is clicked
function showPageAction( tabId, changeInfo, tab ) {
	if(isSFDCUrl(tab.url)){
		tabid = tabid;
	    chrome.pageAction.show(tabId);
	    url = tab.url;
	    getSessionId(tab.url);
	}
};

function checkUrl(activeInfo){
	chrome.tabs.get(activeInfo.tabId, function(tab){
		if(tab.url && isSFDCUrl(tab.url)){
			url = tab.url;
			getSessionId(tab.url);
		}
	});
}

function isSFDCUrl(url){
	if(url.indexOf('.force.com') != -1){
		return true;
	}
	if(url.indexOf('.salesforce.com') != -1){
		return true;
	}

	return false;
}
// Call the above function when the url of a tab changes.
chrome.tabs.onUpdated.addListener(showPageAction);

chrome.tabs.onActivated.addListener(checkUrl);

var url, sid, users, tabid, oid;
var client = new forcetk.Client();

function getSessionId(url){
	chrome.cookies.get({url: getInstanceUrl(url), name: "sid"}, function(cookie){
		if(cookie && sid != cookie.value){
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

function debugLog(userId, callback){
	chrome.tabs.create(
			{
				url: getInstanceUrl(url) + '/setup/ui/listApexTraces.apexp?user_id='+userId+'&user_logging=true',
				active: false,
				selected: false
			}, 
			function(tab){
				chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab2){
					if(tabid == tab.id){
						chrome.tabs.remove(tab.id);
						if(callback){
							callback(userId, tab);
						}
					}
				});
			}
		);
}

function getUrl(){
	return getInstanceUrl(url);
}

function getInstanceUrl(url){
	var spl = url.split('/');
	if(spl[2].indexOf('.salesforce.com')!=-1){
		return spl[0] + '//' + spl[2];
	}
	if(spl[2].indexOf('.force.com') != -1){
		var spl2 = spl[2].split('.');
		return spl[0] + '//' + spl2[1] +'.salesforce.com';
	}
}

function shout(){
	var d = new Date($.now());
	console.log('shout!', d.toTimeString());
}

function getUsers(callback){
	/* first check that oid hasn't changed */
	chrome.cookies.get({url: getInstanceUrl(url), name: "oid"}, function(cookie){
		if((cookie.value && oid !== cookie.value) || !users){
			oid = cookie.value;
			client.query("select id, name, firstname, lastname, profile.name, userrole.name from User where isactive = true order by LastName", function(response){
				users = response.records;
				callback(users);
			});
		}
		else{
			callback(users);
		}
	});
	
}




