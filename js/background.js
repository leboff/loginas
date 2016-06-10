log.setLevel("debug")
//setup a new forcetk client
var conn;

var instanceUrl; //used to store the instance url
var orgId; //used to store the orgId
var sid; //used to store the instance sid
var users; //used to store users
var templates;
var debugLevelId;

/**
 * Load templates
 */
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
        else{
          deferred.reject('No cookie named sid for '+instanceUrl+' found');
        }
    });
    return deferred;
}

function getOrgId(){
  var deferred = new $.Deferred();
  conn.query("select id, instancename from organization limit 1", function(err, results) {
    if(err) return deferred.reject(err);
    deferred.resolve(results.records[0].Id);
  });
  return deferred;
}

function getUsers(){
  var deferred = new $.Deferred();
  if(users){
    deferred.resolve(users);
  } 
  else{
    conn.query("select id, name, firstname, lastname, profile.name, userrole.name from User where isactive = true order by LastName", function(err, results){
      if(err) return deferred.reject(err);

      users = results.records;
      deferred.resolve(users);
    });
  }
  return deferred;
}

function createDebugLevel(){
  var deferred = new $.Deferred();

  restoreOptions(function(options){
    options.MasterLabel = 'LoginasDebug';
    options.DeveloperName = 'LoginasDebug';
    conn.tooling.sobject('DebugLevel').create(options, function(err, response){
      if(err) return deferred.reject(err);
      deferred.resolve(response);
    });
  });
  return deferred;
}

function updateDebugLevel(){
  var deferred = new $.Deferred();

  restoreOptions(function(options){
    options.DeveloperName = 'LoginasDebug';
    conn.tooling.sobject('DebugLevel').update(options, function(err, response){
      if(err) return deferred.reject(err);
      deferred.resolve(response);
    });
  });
  return deferred;
}



function getDebugLevel(){
  var deferred = new $.Deferred();
  conn.tooling.sobject('DebugLevel').find({MasterLabel: 'LoginasDebug'}).execute(function(err, records){
    if(err) {return deferred.reject(err)}

    if(records.length > 0){
      deferred.resolve(records[0]);
    }
    else{
      createDebugLevel().then(function(debugLevel){
        deferred.resolve(debugLevel);
      });
    }
  });

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



function setup(tab) {
    if (tab.url && (tab.url.indexOf('.force.com') != -1 || tab.url.indexOf('.salesforce.com') != -1)) {
        var pageUrl = new URL(tab.url);
        instanceUrl = getInstanceUrl(pageUrl.hostname);
        log.debug('Loginas', 'At a Salesforce URL', instanceUrl);

        //setup client
        getSessionId(instanceUrl).done(function(newSid){
          if(sid != newSid){
            log.debug('Loginas', 'New session id');

            sid = newSid;
            users = null;

            conn = new jsforce.Connection({
              serverUrl : instanceUrl,
              sessionId : sid
            });

            getOrgId().done(function(newOrgId){
              log.debug('Loginas', 'Retrieved org id '+newOrgId);

              orgId = newOrgId;
            }).fail(function(error){
              log.error('Loginas', 'Error retrieving org id');
              log.error('Loginas', error);
            });

            getUsers().done(function(newUsers){
              log.debug('Loginas', 'Retrieved users', newUsers);

              users = newUsers;
            }).fail(function(error){
              log.error('Loginas', 'Error retrieving users');
              log.error('Loginas', error);
            });

            restoreOptions(function(options){
              log.debug('Loginas', 'Retrieved options', options);

               getDebugLevel().done(function(debugLevel){
                log.debug('Loginas', 'Retrieved debugLevel', debugLevel);

                if(options.ApexCode != debugLevel.ApexCode 
                  || options.ApexProfiling != debugLevel.ApexProfiling 
                  || options.Callout != debugLevel.Callout 
                  || options.Database != debugLevel.Database 
                  || options.System != debugLevel.System 
                  || options.Validation != debugLevel.Validation 
                  || options.Visualforce != debugLevel.Visualforce 
                  || options.Workflow != debugLevel.Workflow){

                  if(debugLevel.id){
                    log.debug('Loginas', 'Updating debug level '+debugLevel.id);

                    options.Id = debugLevel.id;
                    updateDebugLevel(options);
                    debugLevelId = debugLevel.id;
                  }
                  else{
                    createDebugLevel(options).done(function(newDebugLevel){
                      log.debug('Loginas', 'Created debug level '+newDebugLevel);

                      debugLevelId = newDebugLevel.id;
                    }).fail(function(error){
                      log.error('Loginas', 'Error creating debug level');
                      log.error('Loginas', error);
                    });
                  }

                  
                }
              }).fail(function(error){
                log.error('Loginas', 'Error retriving debug level');
                log.error('Loginas', error);
              });
            });
          }
        }).fail(function(error){
          log.error('Loginas', 'Error getting session id');
          log.error('Loginas', error);
        });

        chrome.pageAction.show(tab.id);
    }
    else{
      log.debug('Loginas', 'Not a Salesforce URL');
    }
}

function openURL(url){
  chrome.tabs.query({active: true}, function(tab){
    chrome.tabs.update(tab[0].id, {url: url});
  });
}

function viewUser(id){
  openURL(instanceUrl + '/'+id+'?noredirect=1&isUserEntityOverride=1');
}
function loginAsUser(id){
  openURL(instanceUrl +  
    '/servlet/servlet.su?oid='+orgId+
    '&suorgadminid='+id + 
    '&retURL=%2Fhome%2Fhome.jsp'+
    '&targetURL=%2Fhome%2Fhome.jsp');
}
function debugUser(id){
  var start = new Date();
  var end = new Date();
  end.setHours(end.getHours()+4);

  conn.tooling.sobject('TraceFlag').create({
    ApexCode: 'DEBUG',
    ApexProfiling: 'DEBUG',
    Callout: 'DEBUG',
    Database: 'DEBUG',
    DebugLevelId: debugLevelId,
    ExpirationDate: end.toISOString(),
    LogType: 'USER_DEBUG',
    StartDate: start.toISOString(), 
    System: 'DEBUG',
    TracedEntityId: id,
    Validation: 'DEBUG',
    Visualforce: 'DEBUG',
    Workflow: 'DEBUG'
  });
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