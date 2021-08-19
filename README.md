# serverchecker
Server status tracker using free Cloudflare Workers service: status.danirebollo.es

The goal of this project is to have an high availability web service with cheap resources like OVH VPS, free Cloudflare plan and home server or redirect page like personal github profile (if web is not available, better to be redirected than get DNS error...). 

Also use our OpenWRT router or Windows server to act as a DDNS client service using Cloudflare API (our worker will do the job).
# Setup
## create telegram bot
Use botfather to create telegram bot.
You need BOT_API_KEY (created in BotFather) and CHAT_ID to create TELEGRAM_BOTID and TELEGRAM_CHATID environmental variables.

https://xabaras.medium.com/sending-a-message-to-a-telegram-channel-the-easy-way-eb0a0b32968

https://sean-bradley.medium.com/get-telegram-chat-id-80b575520659

## create backup server A type DNS entry 
Create backup server subdomain pointing to different machine.

example: bk, 12.11.13.15 (bk.danirebollo.es points to 12.11.13.15)

## get cloudflare variables

Get your api variables using this postman collection: https://support.cloudflare.com/hc/en-us/articles/115002323852-Using-Cloudflare-API-with-Postman-Collections 
### HOSTNAMEWOSCH
This is your main hostname
example: danirebollo.es

### MAINDNSRECORDID
This is the recordID of your main DNS entry. You can check it with postman colledtion.

example: 4dc31145962338c75db3b8151cfc036d

### VPSADDRESSWOSCH
This is the vps address (not IP) of out main server.

Example: vps-aaaaaaaa.vps.ovh.net
### SERVERBKADDRESSWOSCH
This is the backup subdomain that it is already pointing to the backup server.
Because we're dealing with A type DNS entries we need to use this.
Example: bk.danirebollo.es

### REDIRECTIONURL          
This is the URL to redirect main hostname if both primary server and backup server are down.
example: https://github.com/danirebollo

### REDIRECTIONID
Create a redirection ("cloudflare/select DNS/DNS/page rules/create rule page/redirect URL") and get the ID of this redirection with postman.

### ZONEID
ZoneID of your domain's DNS settings. Get this variable from postmain collection

### XAUTHEMAIL
This is the email used for cloudflare login.

### XAUTHKEY
To get this key, go to cloudflare "profile/api tokens" and get "global API key" or "API key token" with the rights to edit the used DNS entries and redirection.

### TELEGRAM_BOTID

### TELEGRAM_CHATID

## cloudflare setup

1- Go to https://dash.cloudflare.com/

2- Select desired hostname (ej: "mydomain.com")

3- Create subdomain to host this worker (CNAME. Ej: "status")

4- Go to Workers section

5- Create worker with the js code in src/main.js

6- Create route pointing this worker with desired subdomain (ej: "status.danirebollo.es")

7- Disable "Route Workers.dev" if you don't need this additional domain (using "status.subdomain.com" you don't need other hostname)

8- Add this enviroment variables to match your adjusts from step 0
```
HOSTNAMEWOSCH           // example: danirebollo.es
MAINDNSRECORDID         // example: 4dc31145962338c75db3b8151cfc036d
REDIRECTIONID           // example: 0f68d2bb34a219e0e97d032f65d7d72e
REDIRECTIONURL          // example: https://github.com/danirebollo
SERVERBKADDRESSWOSCH    // example: bk.danirebollo.es
VPSADDRESSWOSCH         // example: vps-aaaaaaaa.vps.ovh.net
XAUTHEMAIL              // example: myemail@gmail.com
XAUTHKEY                // example: 8fcd5a0ae22d4fff07f3794d7ca7dc3ac
ZONEID                  // example: f79ddda8dd00f322a7dca89b8c869a9c
```

9-  Add cron activator (cloudflare/workers/cron activator): 
*/30 * * * *

## cloudflare tunnel
TODO documentation

# DDNS client
## Using OpenWRT
OpenWrt has the WAN IP we're looking for, so we can use directly.

Create ddnsscript.sh
```
$ vi ddnsscript.sh
```
ddnsscript.sh content:
```
#!/bin/sh
ip=`ubus call network.interface.wan status | grep \"address\" | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}';`
wget -qO- 'https://serverchecker.danirebollo.workers.dev/?d1=GETSECRETKEY&d2='$ip;
```
Get GETSECRETKEY from cloudflare worker environment variable.

Add execution rights:
```
$ chmod +x ddnsscript.sh
```
Test: 
```
$ ./ddnsscript.sh
```
Add to cron:

A- using ssh
```
$ crontab -e 
```
Crontab content:
```
*/5 * * * * /bin/sh /root/ddnsscript.sh
```

B- Using OpenWrt Scheduled tasks menu
```
*/5 * * * * /bin/sh /root/ddnsscript.sh
```

Enable cron (Cron is not enabled by default, so your jobs won't be run)
```
$ /etc/init.d/cron enable
$ /etc/init.d/cron reload
```
## Using windows
Windows doesn't have the WAN IP we want, so we need to use some external service to get it. In this example: https://ipecho.net/plain

Create a task in windows task scheduler witch calls the following:
```
php.exe -f C:\cron.php
```
cron.php content:
```
<?php

print("Running php script...");

$realIP = file_get_contents("https://ipecho.net/plain");

$response = file_get_contents("https://serverchecker.danirebollo.workers.dev/?d1=GETSECRETKEY&d2=".$realIP);
print("\nReal IP: ".$realIP."\nResponse:\n");
if ( php_sapi_name() != 'cli' )
    echo "<br>Real IP: ".$realIP."<br>Response:<br>".$response;

$replacetospace=array("<body>","<html>","<div>");
$response =str_replace($replacetospace,"",$response);
$replacetonewline=array("</body>","</html>","</div>","<br>");
$response =str_replace($replacetonewline,"\n",$response);

if ( php_sapi_name() == 'cli' )
    print($response);

```
Get GETSECRETKEY from cloudflare worker environment variable.

# TODO
js: check if enviroment variables are empty.. show message...

js: require GET value to see sensible data (redirect url, server1/2 DNS...)

sh/cmd: create script to get Cloudflare parameters (instead using postman collection...) or do it with worker.
# Bugs

# Docs
https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record

https://support.cloudflare.com/hc/en-us/articles/115002323852-Using-Cloudflare-API-with-Postman-Collections