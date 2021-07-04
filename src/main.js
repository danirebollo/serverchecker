//var HOSTNAME = // SET ENV VARIABLE
//var VPSADDRESSWOSCH = // SET ENV VARIABLE
//var SERVERBKADDRESSWOSCH = // SET ENV VARIABLE
//var MAINDNSRECORDID = // SET ENV VARIABLE
//var ZONEID = // SET ENV VARIABLE
//var XAUTHEMAIL = // SET ENV VARIABLE
//var XAUTHKEY = // SET ENV VARIABLE
//var REDIRECTIONID= // SET ENV VARIABLE
//var REDIRECTIONURL = // SET ENV VARIABLE
//var TELEGRAM_BOTID = // SET ENV VARIABLE
//var TELEGRAM_CHATID = // SET ENV VARIABLE
//var VPSENABLED = // SET ENV VARIABLE
//var BACKUPDNSRECORDID = // SET ENV VARIABLE
//var GETSECRETKEY = // SET ENV VARIABLE
//var TUNNELENABLED = // SET ENV VARIABLE
//var TUNNELADDRESSWOSCH= // SET ENV VARIABLE
//var TELEGRAMAVAILABLE= // SET ENV VARIABLE

var TUNNELADDRESS = "https://"+TUNNELADDRESSWOSCH
var HOSTNAME = "https://" + HOSTNAMEWOSCH
var VPSADDRESS = "https://" + VPSADDRESSWOSCH
var SERVERBKADDRESS = "https://" + SERVERBKADDRESSWOSCH
var alertDNS=""

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

async function sendTelegramMessage(request, mymessage) {
    if(TELEGRAMAVAILABLE==1)
    {  
    const urlvps3 = "https://api.telegram.org/bot" + TELEGRAM_BOTID + "/sendMessage?chat_id=" + TELEGRAM_CHATID + "&text=" + encodeURI(mymessage)
    console.log(urlvps3)

    var pingvps3 = false
    let requestvps3 = new Request(urlvps3, {
        headers: request.headers,
        method: "GET"
    })
    requestvps3.headers.set("Host", "api.telegram.org")

    originalResponse = await fetch(urlvps3, requestvps3)
        .then((resp) => resp.json())
        .then(function (data) {
            return data
        })
        .catch(function (error) {
            return "error"
        });
    }
    var status = "not found"

    return status
}

async function setDNS(request, destiny, name, type, recordid, proxied) {
    const urlvps3 = "https://api.cloudflare.com/client/v4/zones/" + ZONEID + "/dns_records/" + recordid
    var proxied2 = ""
    if (proxied == "true")
        proxied2 = "\"proxied\": true\","

    var reqbody3 = "{\
    \"type\": \""+ type + "\",\
    \"name\": \""+ name + "\",\
    \"content\": \""+ destiny + "\",\
    "+ proxied2 + "\"ttl\": 1\
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

    var responsestatus=0
    const responsevps3 = new Response()
    try {
        const originalResponse = await fetch(urlvps3, requestvps3)
        console.log("CONSOLE: " + JSON.stringify(originalResponse))
        responsestatus=originalResponse.status     
    }
    catch (e) {
    }

    if(responsestatus!=200)
    {
        alertDNS="ERROR SETTING DNS (destiny: '"+destiny+"', name:'"+name+"', type:'"+type+"', proxied:'"+proxied+"'). ENABLING REDIRECT"

        //send telegram notification to server bot "ERROR SETTING DNS"
        await sendTelegramMessage(request, "ERROR SETTING DNS. ENABLING REDIRECT")
        await setredirectstatus(request, 1)
        return false
    }
    return true
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
    const urlvps3 = "https://api.cloudflare.com/client/v4/zones/" + ZONEID + "/pagerules/" + REDIRECTIONID

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
                \"value\": \""+ HOSTNAMEWOSCH + "/\"\
            }\
        }\
    ],\
    \"actions\": [\
        {\
            \"id\": \"forwarding_url\",\
            \"value\": {\
                \"url\": \""+ REDIRECTIONURL + "\",\
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
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function myping(url) {
    var pingvpsstatus = await myping0(url)
    console.log("## myping:: '" + url + "' 1st attempt: " + pingvpsstatus)
    if (!pingvpsstatus) {
        console.log("## myping:: '" + url + "' first attempt fail. waiting 2s...")
        await sleep(2000)
        pingvpsstatus = await myping0(url)
        console.log("## myping:: '" + url + "' 2nd attempt: " + pingvpsstatus)
        return pingvpsstatus
    }
    else
        return true
}

async function myping0(url) {

    if (url == "" || url === null || url === "")
        return false

    timeout = 5000
    return new Promise((reslove, reject) => {
        const urlRule = new RegExp('(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
        if (!urlRule.test(url)) reslove(false);  //reject('invalid url');
        try {
            fetch(url)
                .then(() => {
                    console.log("## myping:: resolve true...")
                    reslove(true)
                })
                .catch(() => {
                    console.log("## myping:: resolve false...")
                    reslove(false)
                });
            setTimeout(() => {
                console.log("## myping:: setTimeout...: " + timeout)
                reslove(false);
            }, timeout);
        } catch (e) {
            //reject(e);
            console.log("## myping:: Timeout catch...")
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
    alertDNS=""

    var pingvpsstatus = 0
    if (VPSENABLED==1 || VPSENABLED=="1") {
        console.log("VPSENABLED "+VPSENABLED)
        console.log("Ping vps...")
        pingvpsstatus = await myping(VPSADDRESS)
    }

    console.log("Ping hostname...")
    var pinghoststatus = await myping(HOSTNAME)
    console.log("Ping serverbk...")
    var pingbk2status = await myping(SERVERBKADDRESS + "/check/check.php")
    var pingtunnelstatus=0
    if(TUNNELENABLED==1)
    {
       console.log("Ping tunnel...")
       pingtunnelstatus = await myping(TUNNELADDRESS+ "/rt/check.html")
    } 
    

    console.log("Ping redirectionurl...")
    var pingredirectstatus = await myping(REDIRECTIONURL)



    console.log("getting redirect status...")
    var currentRedirectStatus = await getredirectstatus(request)
    console.log("getting hostname dns status...")

    var mainDNScontent = await getDNS(request, HOSTNAMEWOSCH, HOSTNAMEWOSCH, "CNAME")

    console.log("getting serverbk dns status...")
    var backupDNScontent = await getDNS(request, HOSTNAMEWOSCH, SERVERBKADDRESSWOSCH, "A")
    var DNSisVPS = false
    if (mainDNScontent == VPSADDRESSWOSCH)
        DNSisVPS = true

    var resp = ""
    alertmsg = ""
    warningmsg = ""
    successmsg = ""
    //await sendTelegramMessage(request, "INIT")
    console.log("handling request...")
    //GET request
    const params = {}
    const url = new URL(request.url)
    const queryString = url.search.slice(1).split('&')

    queryString.forEach(item => {
        const kv = item.split('=')
        if (kv[0]) params[kv[0]] = kv[1] || true
    })

    resp += "<div> " + JSON.stringify(params) + "</div>"

    if (params.d1 === GETSECRETKEY) {
        resp += "<div> ##################################################### </div>"
        resp += "<div> current backupdns content: " + backupDNScontent + "</div>"
        resp += "<div> received ip: " + params.d2 + "</div>"
        //received IP (DDNS) is= ddnsip    
        //read backup DNS ip
        if (backupDNScontent != params.d2)
        //if backupdns==ddnsip
        {
            resp += "<div> updating DNS to: " + params.d2 + "</div>"
            //nothing
            //else
            //update backup dns ip
            await setDNS(request, params.d2, "bk.danirebollo.es", "A", BACKUPDNSRECORDID, "true")
            //await setDNS(request, SERVERBKADDRESSWOSCH, HOSTNAMEWOSCH, "CNAME", MAINDNSRECORDID,"true")
            //disabling redirection
            await setredirectstatus(request, 0)

            //send telegram notification
            await sendTelegramMessage(request, "UPDATING BK DNS IP to: " + params.d2) //+ "\nDisabling redirection"
        }
    }
    else {
        resp += "<!DOCTYPE html>\
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
    <link rel=\"icon\" type=\"image/png\" href=\"https://dash.cloudflare.com/favicon.ico\"/>\
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
    <td>Main DNS content</td>"

        resp += "<td>" + mainDNScontent + "</td>"

        resp += "<td>"
        if (VPSENABLED)
            resp += printcolorcell(DNSisVPS)
        else
            resp += printcolorcell(1)


        resp += "</td>\
  </tr>"
        if (VPSENABLED) {
            resp += "<tr>\
    <td>Main server ping</td>\
    <td>"+ VPSADDRESS + "</td>\
    <td>\
    "+ printcolorcell(pingvpsstatus) + "\
    </td>\
  </tr>"
        }
        if (TUNNELENABLED==1) 
        {
            resp += "<tr>\
    <td>Tunnel ping</td>\
    <td>"+ TUNNELADDRESS + "</td>\
    <td>\
    "+ printcolorcell(pingtunnelstatus) + "\
    </td>\
  </tr>"
        }

        resp += "<tr>\
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
    "+ printcolorcell(!currentRedirectStatus) + "\
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
        if ((mainDNScontent == VPSADDRESSWOSCH) && pingvpsstatus)  //pinghoststatus
        {
            successmsg += "Server working"
        }
        else if ((mainDNScontent != VPSADDRESSWOSCH) && pingvpsstatus)  //pinghoststatus
        {
            //set DNS to VPSADDRESS
            await setDNS(request, VPSADDRESSWOSCH, HOSTNAMEWOSCH, "CNAME", MAINDNSRECORDID, "true")

            //disable redirect
            await setredirectstatus(request, 0)

            //send telegram notification to server bot "RESTORING DNS"
            await sendTelegramMessage(request, "RESTORING DNS")
            //verbose
            successmsg += "Restoring server. <br>Setting DNS to VPSADDRESS<br>-disable redirect<br>-send telegram notification to server bot \"RESTORING DNS\""
        }
        else if (TUNNELENABLED==1 && pingtunnelstatus) {
                successmsg += "Tunnel working"

            if (currentRedirectStatus) {
                warningmsg += "Disabling redirect<br>"
                //disable redirect
                await setredirectstatus(request, 0)
                await sendTelegramMessage(request, "TUNNEL is UP. Disabling redirect")
            }

            if (mainDNScontent != TUNNELADDRESSWOSCH) {
                //set DNS to TUNNELADDRESSWOSCH
                await setDNS(request, TUNNELADDRESSWOSCH, HOSTNAMEWOSCH, "CNAME", MAINDNSRECORDID, "true")

                //send telegram notification to server bot "VPS DOWN, SETTING BK2"
                await sendTelegramMessage(request, "SETTING DNS TO TUNNEL")
                //verbose
                warningmsg += "setting DNS to TUNNEL<br>sending telegram notification to server bot \"VPS DOWN: SETTING TUNNEL\"<br>"
            }
            else
                warningmsg += "Setted DNS to TUNNEL<br>"
        }
        else if (SERVERBKADDRESSWOSCH != "" && pingbk2status) {
            if (!VPSENABLED)
                successmsg += "Server working"
            else
                warningmsg += "Service partially degraded.<br>"

            if (currentRedirectStatus) {
                warningmsg += "Disabling redirect<br>"
                //disable redirect
                await setredirectstatus(request, 0)
                await sendTelegramMessage(request, "BK2 is UP. Disabling redirect")
            }


            if (mainDNScontent != SERVERBKADDRESSWOSCH) {
                //set DNS to SERVERBKADDRESS
                await setDNS(request, SERVERBKADDRESSWOSCH, HOSTNAMEWOSCH, "CNAME", MAINDNSRECORDID, "true")

                //send telegram notification to server bot "VPS DOWN, SETTING BK2"
                await sendTelegramMessage(request, "VPS DOWN, SETTING BK2")
                //verbose
                warningmsg += "setting DNS to SERVERBKADDRESS<br>sending telegram notification to server bot \"VPS DOWN: SETTING BK2\"<br>"
            }
            else
                warningmsg += "Setted DNS to SERVERBKADDRESS<br>"
        }
        else {
            alertmsg += "Service totally degraded. "
            if (!currentRedirectStatus) {
                //enable redirect
                await setredirectstatus(request, 1)

                //send telegram notification to server bot "VPS & BK2 DOWN, SETTING REDIRECT"
                await sendTelegramMessage(request, "VPS and BK2 DOWN, SETTING REDIRECT")
                //verbose
                alertmsg += "<br>Enabling redirection<br>sending telegram notification to server bot \"VPS & BK2 DOWN: SETTING REDIRECT\""
            }
            else
                alertmsg += "Redirection enabled"
        }
    }

    if (successmsg != "") {
        resp += "<div class=\"success\">\
  "+ successmsg + "</div>"
    }
    if (alertmsg != "") {
        resp += "<div class=\"alert\">\
  "+ alertmsg + "</div>"
    }
    if (alertDNS != "") {
        resp += "<div class=\"alert\">\
  "+ alertDNS + "</div>"
    }

    if (warningmsg != "") {
        resp += "<div class=\"warning\">\
  "+ warningmsg + "</div>"
    }
    var endtime = Date.now() / 1000
    resp += "<p>Execution time: " + (endtime - starttime).toFixed(2) + " seconds. </p>"
    resp += "</body>\
            </html>";

    console.log("Execution time: " + (endtime - starttime).toFixed(2) + " seconds")
    return new Response(resp, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    })

}