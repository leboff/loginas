//setup a new forcetk client
var conn;

var instanceUrl; //used to store the instance url
var orgId; //used to store the orgId
var sid; //used to store the instance sid
var users; //used to store users
var debugLevels; //used to debugLevels
/**
 * Get the session Id
 */
function getSessionId(instance) {
    var deferred = new $.Deferred();
    chrome.cookies.getAll({
        name: "sid",
        domain: "salesforce.com"
    }, function(cookies) {
        var cookie = _.find(cookies.reverse(), function(c){
          return c.domain.indexOf(instance+'.') != -1;
        });
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
  if(orgId){
    deferred.resolve(orgId);
  }
  else{
    conn.query("select id, instancename from organization limit 1", function(err, results) {
      if(err) return deferred.reject(err);
      orgId = results.records[0].Id;
      deferred.resolve(results.records[0].Id);
    });
  }
  return deferred;
}

function getSelect(selectFields){
  var queryFields = _.map(selectFields, function(field){
    return field.replace('-', '.');
  });
  return queryFields.join(',');
}

function getWhere(selectFields, query){

  var where = _.map(_.without(selectFields, 'Id'), function(field){
    return field +" like '%"+query+"%' ";
  });
  return where.join(' or ');
}

function getUsers(name){
  var deferred = new $.Deferred();
  var query = name || '';
  restoreOptions().then(function(options){
    var fieldNames = _.map(_.map(options.userFields, 'id'), function(field){
      return field.replace('-', '.');
    });

    var selectFields = _.union(fieldNames, ['Id', 'Name', 'FirstName', 'LastName']);

    conn.query("select  " + selectFields.join(',') +
                "  from User where isactive = true and (" + getWhere(selectFields, query) +
                ") order by LastName limit 100",
      function(err, results){
        if(err) return deferred.reject(err);
        users = results.records;
        deferred.resolve(results.records);
    });
  })



  return deferred;
}

/**
 * Get the Org's debug levels
 */
function getDebugLevels(){
  var deferred = new $.Deferred();
  if(debugLevels){
    deferred.resolve(debugLevels);
  }
  else{
    conn.tooling.sobject('DebugLevel').find().execute(function(err, records){
      if(err) {return deferred.reject(err)}
      //store for future
      debugLevels = records;
      deferred.resolve(records);
    });
  }
  return deferred;
}
/**
 * Get the instance url (same as forcetk)
 */
function getInstance(hostname) {
    var elements = hostname.split(".");

    if(elements[0] === 'c'){
      return elements[1];
    }

    if(elements[0].indexOf('--c')!=-1){
      return elements[0].substring(0, elements[0].indexOf('--c'));
    }

    return elements[0];

}

/**
 * Reset the cached data
 */
function resetCache(){
    users = null;
    sid = null;
    orgId = null;
    debugLevels = null;
}

/**
 * Setup the background page, get the session id and create a new connection
 */
function setup(tab) {
    if (tab.url && (tab.url.indexOf('.force.com') != -1 || tab.url.indexOf('.salesforce.com') != -1)) {
        var pageUrl = new URL(tab.url);
        var instance = getInstance(pageUrl.hostname);

        instanceUrl = 'https://'+pageUrl.hostname;
        log.debug('Loginas', 'At a Salesforce URL', instanceUrl, instance);

        //setup client
        getSessionId(instance).done(function(newSid){
          if(sid != newSid){
            log.debug('Loginas', 'New session id');

            resetCache();
            //store the new session id
            sid = newSid;

            //create a new jsforce connection
            conn = new jsforce.Connection({
              serverUrl : instanceUrl,
              sessionId : sid
            });

          }
        }).fail(function(error){
          resetCache();
          log.error('Loginas', 'Error getting session id');
          log.error('Loginas', error);
        });

        chrome.pageAction.show(tab.id);
    }
    else{
      log.debug('Loginas', 'Not a Salesforce URL');
    }
}

/**
 * Open the active tab to a particular URL
 */
function openURL(url){
  var deferred = new $.Deferred();

  chrome.tabs.query({active: true, currentWindow: true}, function(tab){
    chrome.tabs.update(tab[0].id, {url: url});
    deferred.resolve();
  });

  return deferred;
}

/**
 * Show the user detail page
 */
function viewUser(id){
  log.debug('Loginas', 'Showing user', id);
  return openURL(instanceUrl + '/'+id+'?noredirect=1&isUserEntityOverride=1');
}

/**
 * Show the debug logs page
 */
function showDebugLogs(){
  log.debug('Loginas', 'Showing debug logs');
  return openURL(instanceUrl + '/setup/ui/listApexTraces.apexp')
}

/**
 * Login as a user
 */
function loginAsUser(id){
  log.debug('Loginas', 'Logging in as', id);

  var deferred = new $.Deferred();
  //get the org id for logging in
  getOrgId().done(function(newOrgId){
    log.debug('Loginas', 'Retrieved org id '+newOrgId);
    openURL(instanceUrl +
      '/servlet/servlet.su?oid='+orgId+
      '&suorgadminid='+id +
      '&retURL=%2Fhome%2Fhome.jsp'+
      '&targetURL=%2Fhome%2Fhome.jsp').then(deferred.resolve);
  }).fail(function(error){
    log.error('Loginas', 'Error retrieving org id');
    log.error('Loginas', error);
    deferred.reject(error);
  });

  return deferred;

}



/**
 * Add a debug log to a particular users
 */
function debugUser(id, debugLevelId){
  log.debug('Loginas', 'Creating debug log', id, debugLevelId);

  var deferred = new $.Deferred();

  //setup dates
  var start = new Date();
  var end = new Date();
  end.setHours(end.getHours()+4);

  //create traceflag
  conn.tooling.sobject('TraceFlag').create({
    DebugLevelId: debugLevelId,
    ExpirationDate: end.toISOString(),
    LogType: 'USER_DEBUG',
    StartDate: start.toISOString(),
    TracedEntityId: id
  }, function(err, result){
    if(err) {
      log.error('Loginas', 'Error creating debug log');
      log.error('Loginas', err);

      deferred.reject(err);
    }
    else{
      log.debug('Loginas', 'Created debug log for ',id, result);

      deferred.resolve(result);
    }
  });

  return deferred;
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
