# serverchecker
Server status tracker using free Cloudflare Workers service: status.danirebollo.es

The goal of this project is to have an high availability web service with cheap resources like OVH VPS, free Cloudflare plan and home server or redirect page like personal github profile (if web is not available, better to be redirected than get DNS error...). 

# Setup
## create telegram bot
To Be Done.

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


# TODO
telegram/js: send telegram notification to server bot

js: check for specific code instead simple PING?

js: check if enviroment variables are empty.. show message...

js: add bootstrap design

js: require GET value to see sensible data (redirect url, server1/2 DNS...)

sh/cmd: create script to get parameters (instead using postman collection...) or do it with worker.
# Bugs

# Docs
https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record

https://support.cloudflare.com/hc/en-us/articles/115002323852-Using-Cloudflare-API-with-Postman-Collections

