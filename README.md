A very simple displayboard for the display of AppBeat, Netdata, Sirportly and Google Calendar in the Dogsbody Technology Office

## Setup 
Requires PHP Hosting. Everything else is static files.

See `nginx.example` for an example Nginx configuration. The entire repo should be on the webserver but only /public should be accessable via the browser and only /public/php should be accessable by PHP.

Uses Github Actions to deploy to a server via SSH. This also pulls in any dependencies.

## Configuration
This is very much configured for use by Dogsbody Technology with our endpoints hard coded in various files. Most of these settings can be overwritten using the settings below if needed. The aim is for there to be no need to fork the code.

### AppBeat
* Copy `config/appbeatproxy.config.sample` to `config/appbeatproxy.config`.
* Edit `config/appbeatproxy.config` and update the `$apiHeaders` array with the HTTP headers needed for authentication.
* Optionally the `$cacheFile` and `$cacheDuration` can be overwritten in this file.

### Netdata
* Copy `config/netdataproxy.config.sample` to `config/netdataproxy.config`.
* Edit `config/netdataproxy.config` and update the `$apiUrl` variable & `$apiHeaders` array with the URI and headers needed for authentication.
* Optionally the `$cacheFile` and `$cacheDuration` can be overwritten in this file.

### Sirportly
* Copy `config/sirportlyproxy.config.sample` to `config/sirportlyproxy.config`.
* Edit `config/sirportlyproxy.config` and update the `$apiHeaders` array with the HTTP headers needed for authentication.
* Optionally the `$cacheFile` and `$cacheDuration` can be overwritten in this file.

### Google Calendar
* Go to https://console.cloud.google.com/ , log in if necessary and/or check you are the right user.
* Click on the 3-dot logo / pull down menu at the top to open the "Select a project" box. Click on "Add new project" or select one if you already have one you are going to use.

* Click on the "IAM & Admin" quick access button or select it from the navigation menu on the left.
* Click on "Service Accounts" on the left navigation pane to bring up a list of service accounts belonging to the project.
* Click "+ CREATE SERVICE ACCOUNT" to go to the next page, which has 3 steps to creating it. First, give your service account a name and description:
* **Make a note of the email address**. You will need it later when you share the calendar with your service account. Click "CREATE AND CONTINUE".
* Skip the next two optional steps.
* You will now be back at the service account list, with your newly created account showing:

* You now want to set up authorisation for your service account by creating keys so it can access APIs. 
* Click on the "Actions" dots and choose "Manage keys". You will go to a page with an empty list of keys for that service.
* Click on "ADD KEY" and choose "Create new key".
* Make sure that "JSON" is selected and choose "CREATE". 
* Your browser will automatically download a file containing your private key. 
* Upload this file to `/config/googlecalendar.json.config` on your site.
* **Do not git commot this file!**

* You now need to enable the Calendar API for your project. 
* Click on "APIs & Services" in the quick links box of the "Welcome" page or the left menu. Click on "+ ENABLE APIS AND SERVICES".
* Do a search for "Calendar" and click on the result that says "Google Calendar API".
* Click on the "Enable" button and you will be taken to the entry for the Calendar API off the "Enabled APIs and Services" page, showing stats for that API.

* Before you can access the calendar from your PHP pages, you need to share it with your service account.
* Start Calendar in a web browser and click on the burger of the calender you want to use in the "My calendars" section and choose "Settings":
* Scroll down to the "Share with specific people or groups" section and click "Add people and groups".
* Remember the part of setting up the service account where I said make a note of the email address? Yup. That’s what you put in the "Add email or name" box. Make sure the "See all event details" is chosen and then click "Send". 
*  Scroll down to the "Integrate calendar" section and make a note of the Calendar ID. It looks something like "qhhbdvqi5dom44arse60oav68k@group.calendar.google.com".

If you are adapting this code you will want to change the calendar ID.
* Just copy `config/googlecalendar.config.sample` to `config/googlecalendar.config` and edit the `$calendarId` variable to your calendar ID
* Other settings like file locations, cache time and Timezone can be set here too

(Thank you to Naich for [their page on setting this up properly](https://naich.net/wordpress/index.php/using-the-google-calendar-api-from-your-web-site-with-php/).)


## To Do

### Sirportly
* Write it :-p

### Add support for an ICS feed
* could be messy but we can't get the vacation feed from Google calendar so will have to parse it ourselves.

