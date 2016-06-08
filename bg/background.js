//setup a new forcetk client
var client = new forcetk.Client();

var instanceUrl; //used to store the instance url
var orgId; //used to store the orgId
var sid; //used to store the instance sid
var users; //used to store users
var templates;

/**
 * Get the session Id
 */
function getSessionId(instanceUrl) {
    var deferred = new $.Deferred();
    chrome.cookies.get({
        url: instanceUrl,
        name: "sid"
    }, function(cookie) {
        if (cookie) {
            deferred.resolve(cookie.value);
        }
    });

    return deferred;
}

function getOrgId(){
  var deferred = new $.Deferred();
  console.log('getting org ID!')
  client.query("select id, instancename from organization limit 1", function(results) {
    if(results.records){
      deferred.resolve(results.records[0].Id);
    }
    else{
      deferred.reject();
    }
  });
  return deferred;
}

function getUsers(){
  var deferred = new $.Deferred();
  console.log('getting users!');
  if(users){
    console.log('no update');
    deferred.resolve(users);
  } 
  else{
    client.query("select id, name, firstname, lastname, profile.name, userrole.name from User where isactive = true order by LastName", function(response){
      console.log('retrieved', response);
      users = response.records;
      deferred.resolve(users);
    });
  }
  return deferred;
}

/** 
 * Get the instance url (same as forcetk)
 */
function getInstanceUrl(hostname) {
    var elements = hostname.split("."),
        instance = null;
    if (elements.length === 4) {
        if (elements[1] === 'my') {
            instance = elements[0] + '.' + elements[1];
        } else if (elements[1] === 'lightning') {
            instance = elements[0];
        }
    } else if (elements.length === 3) {
        instance = elements[0];
    } else {
        instance = elements[1];
    }
    return "https://" + instance + ".salesforce.com";
}

function getTemplate(name){
  var deferred = $.Deferred();
  $.get('../partials/'+name+'.mst', function(template){
    Mustache.parse(template);
    deferred.resolve(template);
  });
  return deferred;
}


function setup(tab) {
    if (tab.url && (tab.url.indexOf('.force.com') != -1 || tab.url.indexOf('.salesforce.com') != -1)) {
        console.log('on sf page!!');
        var pageUrl = new URL(tab.url);
        instanceUrl = getInstanceUrl(pageUrl.hostname);

        //setup client
        getSessionId(instanceUrl).then(function(newSid){
          if(sid != newSid){
            console.log('new sid!! coming in!!')
            sid = newSid;
            users = null;
            console.log('setting session!!')
            client.setSessionToken(sid, 'v36.0', instanceUrl);
            getOrgId().then(function(newOrgId){
              console.log('setting org id!')
              orgId = newOrgId;

            });
            getUsers().then(function(newUsers){
              console.log('setting users!!');
              users = newUsers;
            });
          }
        });

        //setup templates
        var userTmpl = getTemplate('user');
        var tableTmpl = getTemplate('table');
        var headTmpl = getTemplate('head');

        $.when(userTmpl,headTmpl,tableTmpl).done(function(user, head, table){
          templates = {
            user: user,
            head: head,
            table: table
          }
        });

        chrome.pageAction.show(tab.id);
    }
}
/**
 * Show the page action when a tab is updated
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    setup(tab);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        setup(tab);
    })
});