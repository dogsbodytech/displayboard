<?php
/*
 * Description: A simple proxy script for the AppBeat API.
 *     This script is due to the missing CORS headers from the AppBeat API
 *       which means the API can't be read directly by a webpage.
 *     The script has a few additional advantages
 *       - We are caching the last results so we don't get rate limited
 *       - We can hide our API key in this script instead of the website
 *       - We add a header to show when the data is old
 *
 * Configuration:  The following variables can be set
 *     $apiUrl        = The API URL we are calling
 *     $apiKey        = The API Key
 *     $cacheFile     = Path to the cache file
 *     $cacheDuration = How many seconds to cache the response
 *
 * Notes:
 *
 */

$apiUrl = "https://www.appbeat.io/API/v1/status";
$apiKey = "NotSet";
$cacheFile = '../../cache/appbeatproxy.cache';
$cacheDuration = 30;  // maximum we are allowed

include '../../config/appbeatproxy.config';
require_once 'common.php';

if ($apiKey == "NotSet") {
    http_response_code(500);
    echo json_encode(["success" => "false","error" => "API Key not set"]);
    exit;
}

proxyRequest($apiUrl, $apiKey, $cacheFile, $cacheDuration);

?>
