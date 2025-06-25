<?php
/*
 * Description: A simple proxy script for the AppBeat API.
 *     This script is due to the missing CORS headers from the AppBeat API
 *       which means the API can't be read directly by a webpage.
 *     The script has a few additional advantages
 *       - We are caching the last results so we don't get rate limited
 *       - We can hide our authentication headers in this script instead of the website
 *       - We add a header to show when the data is old
 *
 * Configuration:  The following variables can be set
 *     $apiUrl        = The API URL we are calling
 *     $apiHeaders    = An array of HTTP headers used for authentication
 *     $cacheFile     = Path to the cache file
 *     $cacheDuration = How many seconds to cache the response
 *
 * Notes:
 *
 */

$apiUrl = "https://www.appbeat.io/API/v1/status";
$apiHeaders = [];
$cacheFile = '../../cache/appbeatproxy.cache';
$cacheDuration = 30;  // maximum we are allowed

include '../../config/appbeatproxy.config';
require_once 'common.php';

if (empty($apiHeaders)) {
    http_response_code(500);
    echo json_encode(["success" => "false","error" => "API headers not set"]);
    exit;
}

proxyRequest($apiUrl, $apiHeaders, $cacheFile, $cacheDuration);

?>
