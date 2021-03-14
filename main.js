//var HOSTNAME = // SET ENV VARIABLE
//var VPSADDRESSWOSCH = // SET ENV VARIABLE
//var SERVERBKADDRESSWOSCH = // SET ENV VARIABLE
//var PINGTESTADDRESS = // SET ENV VARIABLE
//var HOMEDNSRECORDID = // SET ENV VARIABLE
//var MAINDNSRECORDID = // SET ENV VARIABLE
//var ZONEID = // SET ENV VARIABLE
//var XAUTHEMAIL = // SET ENV VARIABLE
//var XAUTHKEY = // SET ENV VARIABLE
//var REDIRECTIONID= // SET ENV VARIABLE
//var REDIRECTIONURL = // SET ENV VARIABLE

var HOSTNAME = "https://" + HOSTNAMEWOSCH
var VPSADDRESS = "https://" + VPSADDRESSWOSCH
var SERVERBKADDRESS = "https://" + SERVERBKADDRESSWOSCH

//////////////////////////////////////////////////////////////////////
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
function printcolorcell(value) {
    if (value)
        return "<div class=\"success\" \"></div>"
    else
        return "<div class=\"alert\" \"></div>"
}
async function setDNS(request, destiny, name, type) {
    const urlvps3 = "https://api.cloudflare.com/client/v4/zones/" + ZONEID + "/dns_records/" + MAINDNSRECORDID

    var reqbody3 = "{\
    \"type\": \""+ type + "\",\
    \"name\": \""+ name + "\",\
    \"content\": \""+ destiny + "\",\
    \"ttl\": 1,\
    \"proxied\": true\
}"

    var pingvps3 = false
    let requestvps3 = new Request(urlvps3, {
        body: reqbody3,
        headers: request.headers,
        method: "PUT",
        redirect: request.redirect
    })
    requestvps3.headers.set("Host", "api.cloudflare.com")
    requestvps3.headers.set("X-Auth-Email", XAUTHEMAIL)
    requestvps3.headers.set("X-Auth-Key", XAUTHKEY)
    requestvps3.headers.set("Content-Type", "application/json")
    requestvps3.headers.set("Content-Length", "453")

    const responsevps3 = new Response()
    try {
        const originalResponse = await fetch(urlvps3, requestvps3)
        pingvps3 = true
    }
    catch (e) {
    }
}

async function getDNS(request, zonename, name, type) {
    const urlvps3 = "https://api.cloudflare.com/client/v4/zones/" + ZONEID + "/dns_records"

    var pingvps3 = false
    let requestvps3 = new Request(urlvps3, {
        headers: request.headers,
        method: "GET"
    })
    requestvps3.headers.set("Host", "api.cloudflare.com")
    requestvps3.headers.set("X-Auth-Email", XAUTHEMAIL)
    requestvps3.headers.set("X-Auth-Key", XAUTHKEY)


    originalResponse = await fetch(urlvps3, requestvps3)
        .then((resp) => resp.json())
        .then(function (data) {
            return data
        })
        .catch(function (error) {
            return "error"
        });
    var status = "not found"
    if (originalResponse.result)
        for (var i = 0; i < originalResponse.result.length; i++) {
            if ((originalResponse.result[i].zone_name == zonename) && (originalResponse.result[i].name == name) && (originalResponse.result[i].type == type)) {
                status = originalResponse.result[i].content;
            }
        }

    return status
}

async function getredirectstatus(request) {
    const urlvps3 = "https://api.cloudflare.com/client/v4/zones/" + ZONEID + "/pagerules"

    var pingvps3 = false
    let requestvps3 = new Request(urlvps3, {
        headers: request.headers,
        method: "GET"
    })
    requestvps3.headers.set("Host", "api.cloudflare.com")
    requestvps3.headers.set("X-Auth-Email", XAUTHEMAIL)
    requestvps3.headers.set("X-Auth-Key", XAUTHKEY)


    originalResponse = await fetch(urlvps3, requestvps3)
        .then((resp) => resp.json())
        .then(function (data) {
            return data
        })
        .catch(function (error) {
            return "error"
        });
    var status = "not found"
    if (originalResponse.result)
        for (var i = 0; i < originalResponse.result.length; i++) {
            if (originalResponse.result[i].id == REDIRECTIONID) {
                status = originalResponse.result[i].status;
                if (status == "active")
                    status = true
                else
                    status = false
            }
        }

    return status
}

async function setredirectstatus(request, redirectstatus) {
    const urlvps3 = "https://api.cloudflare.com/client/v4/zones/" + ZONEID + "/pagerules/"+REDIRECTIONID

    if (redirectstatus == false || redirectstatus == null)
        redirectstatus = "disabled"
    else
        redirectstatus = "active"

    var reqbody3 = "{\
    \"targets\": [\
        {\
            \"target\": \"url\",\
            \"constraint\": {\
                \"operator\": \"matches\",\
                \"value\": \""+HOSTNAMEWOSCH+"/\"\
            }\
        }\
    ],\
    \"actions\": [\
        {\
            \"id\": \"forwarding_url\",\
            \"value\": {\
                \"url\": \""+REDIRECTIONURL+"\",\
                \"status_code\": 302\
            }\
        }\
    ],\
    \"priority\": 2,\
    \"status\": \""+ redirectstatus + "\"\
}"

    var pingvps3 = false
    let requestvps3 = new Request(urlvps3, {
        body: reqbody3,
        headers: request.headers,
        method: "PUT",
        redirect: request.redirect
    })
    requestvps3.headers.set("Host", "api.cloudflare.com")
    requestvps3.headers.set("X-Auth-Email", XAUTHEMAIL)
    requestvps3.headers.set("X-Auth-Key", XAUTHKEY)
    requestvps3.headers.set("Content-Type", "application/json")
    //requestvps3.headers.set("Content-Length", "453")

    const responsevps3 = new Response()
    try {
        const originalResponse = await fetch(urlvps3, requestvps3)
        pingvps3 = true
    }
    catch (e) {
    }
    //
}

async function myping(url) {

    if (url == "" || url === null || url === "")
        return false

    timeout = 1200
    return new Promise((reslove, reject) => {
        const urlRule = new RegExp('(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
        if (!urlRule.test(url)) reslove(false);  //reject('invalid url');
        try {
            fetch(url)
                .then(() => reslove(true))
                .catch(() => reslove(false));
            setTimeout(() => {
                reslove(false);
            }, timeout);
        } catch (e) {
            //reject(e);
            reslove(false);
        }
    });
}
/*
*
*
*
*/
async function handleRequest(request) {
    var pingteststatus = "true" //await myping(PINGTESTADDRESS)
    var pingvpsstatus = await myping(VPSADDRESS)
    var pinghoststatus = await myping(HOSTNAME)
    var pingbk2status = await myping(SERVERBKADDRESS)
    var pingredirectstatus = await myping(REDIRECTIONURL)

    

    var currentRedirectStatus = await getredirectstatus(request)
    var mainDNScontent = await getDNS(request, HOSTNAMEWOSCH, HOSTNAMEWOSCH, "CNAME")
    var DNSisVPS = false
    if (mainDNScontent == VPSADDRESSWOSCH)
        DNSisVPS = true


    var resp = "<!DOCTYPE html>\
    <html>\
    <head>\
<style>\
    .alert {\
  padding: 20px;\
  background-color: #f44336; /* Red */\
  color: white;\
  margin-bottom: 15px;\
}\
.success {\
  padding: 20px;\
  background-color: #4CAF50; /* Green */\
  color: white;\
  margin-bottom: 15px;\
}\
.warning {\
  padding: 20px;\
  background-color: #ff9800; /* Green */\
  color: white;\
  margin-bottom: 15px;\
}\
</style>\
    <title>Serverchecker</title>\
    <link rel=\"icon\" type=\"image/png\" href=\"https://www.google.com/favicon.ico\"/>\
    </head>\
    <body>\
    <h1>Serverchecker</h1>";

    resp += "<table style=\"width:100%\">\
  <tr>\
    <th>object</th>\
    <th>detail</th>\
    <th>status</th>\
  </tr>\
  <tr>\
    <td>host</td>\
    <td>"+ HOSTNAMEWOSCH + "</td>\
    <td>\
    "+ printcolorcell(pinghoststatus) + "\
    </td>\
  </tr>\
  <tr>\
    <td>Main DNS content</td>\
    <td>"+ mainDNScontent + "</td>\
<td>\
"+ printcolorcell(DNSisVPS) + "\
</td>\
  </tr>\
  <tr>\
    <td>Main server ping</td>\
    <td>"+ mainDNScontent + "</td>\
    <td>\
    "+ printcolorcell(pingvpsstatus) + "\
    </td>\
  </tr>\
  <tr>\
    <td>Secundary server ping</td>\
    <td>"+ SERVERBKADDRESSWOSCH + "</td>\
    <td>\
    "+ printcolorcell(pingbk2status) + "\
    </td>\
  </tr>\
  <tr>\
    <td>Redirect status</td>\
    <td>"+ currentRedirectStatus + "</td>\
    <td>\
    "+ printcolorcell(currentRedirectStatus) + "\
    </td>\
  </tr>\
  <tr>\
    <td>Redirect ping</td>\
    <td>"+ REDIRECTIONURL + "</td>\
    <td>\
    "+ printcolorcell(pingredirectstatus) + "\
    </td>\
  </tr>\
</table>"

    alertmsg = ""
    warningmsg = ""
    successmsg = ""
    if ((mainDNScontent == VPSADDRESSWOSCH) && pingvpsstatus)  //pinghoststatus
    {
        successmsg += "Server working"
    }
    else if ((mainDNScontent != VPSADDRESSWOSCH) && pingvpsstatus)  //pinghoststatus
    {
            //set DNS to VPSADDRESS
            await setDNS(request, VPSADDRESSWOSCH, HOSTNAMEWOSCH, "CNAME")

            //disable redirect
            await setredirectstatus(request, 0)

            //send telegram notification to server bot "RESTORING DNS"

            //verbose
            successmsg += "Restoring server. <br>Setting DNS to VPSADDRESS<br>-disable redirect<br>-send telegram notification to server bot \"RESTORING DNS\""
    }
    else if (SERVERBKADDRESSWOSCH != "" && pingbk2status) {
        warningmsg += "Service partially degraded."

        if (mainDNScontent != SERVERBKADDRESSWOSCH) {
            //set DNS to SERVERBKADDRESS
            await setDNS(request, SERVERBKADDRESSWOSCH, HOSTNAMEWOSCH, "CNAME")

            //send telegram notification to server bot "VPS DOWN, SETTING BK2"

            //verbose
            warningmsg += "<br>setting DNS to SERVERBKADDRESS<br>sending telegram notification to server bot \"VPS DOWN: SETTING BK2\""
        }
        else
            alertmsg += "Setted DNS to SERVERBKADDRESS"
    }
    else {
        alertmsg += "Service totally degraded. "
        if (!currentRedirectStatus) {
            //enable redirect
            await setredirectstatus(request, 1)

            //send telegram notification to server bot "VPS & BK2 DOWN, SETTING REDIRECT"

            //verbose
            alertmsg += "<br>Enabling redirection<br>sending telegram notification to server bot \"VPS & BK2 DOWN: SETTING REDIRECT\""
        }
        else
            alertmsg += "Redirection enabled"
    }


    if (successmsg != "") {
        resp += "<div class=\"success\">\
  "+ successmsg + "</div>"
    }
    if (alertmsg != "") {
        resp += "<div class=\"alert\">\
  "+ alertmsg + "</div>"
    }
    if (warningmsg != "") {
        resp += "<div class=\"warning\">\
  "+ warningmsg + "</div>"
    }

    //TODO 
    //check specific code instead simple PING
    //send telegram notification to server bot
    //check if enviroment variables are empty.. show message...

    
    resp += "</body>\
            </html>";

    return new Response(resp, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    })

}
