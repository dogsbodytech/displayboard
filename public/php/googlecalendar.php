<?php

/*
 * Description: Get data from private Google Calendar.
 *     The script has a few additional advantages
 *       - We are caching the last results so we don't get rate limited
 *       - We can hide our API key in this script instead of the website
 *       - We add a header to show when the data is old
 *
 * Configuration:  The following variables can be set
 *     $apiKey      = The API Key
 *     $calendarId  = ID of Calendar to look at
 *     $cacheFile   = Path to the cache file
 *     $cacheTime   = How many seconds to cache the response
 *
 */

$apiKey = "NotSet";
$calendarId = 'NotSet';
$cacheFile = '../../cache/googlecalendar.cache';
$cacheTime = 900;  // 15 minutes

include '../../config/googlecalendar.config';

// If apiKey is not set then don't even try doing anything
if ($apiKey == "NotSet" || $calendarId == "NotSet") {
    http_response_code(500);
    echo json_encode(["success" => "false","error" => "Script not configured"]);
    exit;
}

require '../../google-api-php-client/vendor/autoload.php';

use Google\Client;
use Google\Service\Calendar;

session_start();

$client = new Google_Client();
$client->setAuthConfig('../../config/googlecalendar.json.config');

$client->setScopes('https://www.googleapis.com/auth/calendar.readonly');
$client->setApplicationName("Calendar");

$service = new Google_Service_Calendar($client);

$calendar = $service->calendars->get('primary');

echo $calendar->getSummary();









/*


$calendar = $service->calendars->get('primary');

echo $calendar->getSummary();


// Return cached files if exists and is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    header('Content-Type: application/json');
    echo file_get_contents($cacheFile);
    exit;
}

// Fetch events from Google Calendar API
$url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events?key=$apiKey&timeMin=" . urlencode(gmdate('c')) . "&maxResults=10&orderBy=startTime&singleEvents=true";
$response = file_get_contents($url);

if ($response === FALSE) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch events"]);
    exit;
}

// Save response to cache
file_put_contents($cacheFile, $response);

// Output response
header('Content-Type: application/json');
echo $response;
 */

?>

