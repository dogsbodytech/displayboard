<?php

/*
 * Description: Get data from private Google Calendar.
 *     The script has a few additional advantages
 *       - We are caching the last results so we don't run up an API bill 
 *       - We can hide our API key in this script instead of the website
 *
 * Configuration:  The following variables can be set
 *     $calendarId  = ID of Calendar to look at
 *     $apiKeyFile  = Path to Service Account Key file
 *     $cacheFile   = Path to the cache file
 *     $cacheTime   = How many seconds to cache the response
 *     $timezone    = The timezone we want all the results to be in
 *
 */

$calendarId = 'sysadmin@dogsbody.com';
$apiKeyFile = '../../config/googlecalendar.json.config';
$cacheFile = '../../cache/googlecalendar.cache';
$cacheTime = 900;  // 15 minutes
$timezone = 'Europe/London';

include '../../config/googlecalendar.config'; // shouldn't be needed 

// If $apiKeyFile doesn't exist then don't even try doing anything
if (!file_exists($apiKeyFile)) {
  http_response_code(500);
  echo json_encode(["success" => "false","error" => "Script not configured"]);
  exit;
}

// Return cached files if exists and is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
  header('Content-Type: application/json');
  echo file_get_contents($cacheFile);
  exit;
}

// Use the Google API PHP Client
require '../../google-api-php-client/vendor/autoload.php';
session_start();
$client = new Google_Client();
$client->setAuthConfig($apiKeyFile);
$client->setScopes('https://www.googleapis.com/auth/calendar.readonly');
$client->setApplicationName("Displayboard");
$service = new Google_Service_Calendar($client);

// See for options https://developers.google.com/calendar/api/v3/reference/events/list
$optParams = array(
  'maxResults' => 40,
  'orderBy' => 'startTime',
  'singleEvents' => TRUE,
  'timeMin' => date("c", strtotime("today")),  // Sets to midnight of today
);

// Get our list of events
$events = $service->events->listEvents($calendarId, $optParams);

// A fuction for processing the various ways we are passed date and time by Google
function normalizeEventTime($dateTime, $timeZone, $date, $targetTimeZone) {
  if (!empty($dateTime)) {
    $event = $dateTime;
    $eventTimeZone = $timeZone;
  } else {
    $event = $date;
    $eventTimeZone = $targetTimeZone;
  }
  // Create DateTime object with the provided timezone
  $dateTimeObj = new DateTime($event, new DateTimeZone($eventTimeZone));
  // Convert to Europe/London timezone
  $dateTimeObj->setTimezone(new DateTimeZone($targetTimeZone));
  // Return normalized datetime as a single string
  return $dateTimeObj->format("Y-m-d H:i");
}

$response = []; // Initialize an empty array
foreach ($events->getItems() as $event) {
  $start = normalizeEventTime($event->start->dateTime, $event->start->timeZone, $event->start->date, $timezone);
  $end = normalizeEventTime($event->end->dateTime, $event->end->timeZone, $event->end->date, $timezone);
  $response[] = [
    "start" => $start,
    "end" => $end,
    "summary" => $event->getSummary()
  ];
}
$response = json_encode($response, JSON_PRETTY_PRINT);

// Save response to cache
file_put_contents($cacheFile, $response);

// Output response
header('Content-Type: application/json');
echo $response;

?>
