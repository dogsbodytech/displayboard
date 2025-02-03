# displayboard
A very simple displayboard for the display of AppBeat, Netdata, Sirportly and Google Calendar in the Dogsbody Technology Office

Requires PHP Hosting. Everything else is static files.

Uses Github Actions to deploy to a server via SSH. This also pulls in any dependancies.

## Configuration

This is very much configured for use by Dogsbody Technology with our endpoints hard coded in various files. All of these settings can be overwritten using the settings below if needed. There should be no need to fork the code.

### AppBeat
* Just copy `config/appbeatproxy.config.sample` to `config/appbeatproxy.config` and edit the `$apiKey` variable to your API key found at https://my.appbeat.io/manage/account
* Optionally the `$cacheFile` and `$cacheDuration` can be overwritten in this file

### Netdata
* Just allow Your Netdata instance/parent access from the IP addresses that will use this displayboard
* We'd love to allow users to easily overide the URL in `public/js/netdata.js` but can't think of an easy way to allow this to be done without additional API calls.


## To Do

### Google Calendar
* Make it work!

### Sirportly
* Write it :-p 

### AppBeat
* Add a Description to the top of `public/js/appbeat.js`
* Use the X-Data-Source header to show when the data is cached

### Netdata
* Add a Description to the top of `public/js/netdata.js`
* Allow settings to be overwritten by someone else using the code. Perhaps a single API call from `public/js/netdata.js` to a php script (seeing as we are using it elsewhere) just to return the URL (and perhaps a key).


