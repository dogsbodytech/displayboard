<?php
/*
 * Description: A simple proxy script for the Sirportly API.
 *
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

$apiUrl = "https://sirportly.example.com/";
$apiHeaders = ['X-Auth-Token: YOUR_TOKEN', 'X-Auth-Secret: YOUR_SECRET'];
$cacheFile = '../../cache/sirportlyproxy.cache';
$cacheDuration = 14;

include '../../config/sirportlyproxy.config';
require_once 'common.php';

if (empty($apiHeaders)) {
    http_response_code(500);
    echo json_encode(["success" => "false","error" => "API headers not set"]);
    exit;
}

$spql = 'SELECT COUNT,users.first_name,users.last_name,status.name,status.status_type FROM tickets WHERE statuses.status_type != 1 GROUP BY users.first_name,users.last_name,status.name';
$query = urlencode($spql);

proxyRequest("$apiUrl/api/v2/tickets/spql?spql=$query", $apiHeaders, $cacheFile, $cacheDuration);

?>
