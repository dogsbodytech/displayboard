<?php
/*
 * Description: A simple proxy script for the Netdata API.
 *     This script is not technically required as we can pull directly from
 *     the Netdata API however it allows options as Netdata evolves and
 *     allows us to put extra protection in place as well as caching.
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

$apiUrl = "https://netdata.example.com/api/v2/nodes";
$apiHeaders = [];
$cacheFile = '../../cache/netdataproxy.cache';
$cacheDuration = 14;

include '../../config/netdataproxy.config';
require_once 'common.php';

if (empty($apiHeaders)) {
    http_response_code(500);
    echo json_encode(["success" => "false","error" => "API headers not set"]);
    exit;
}

proxyRequest($apiUrl, $apiHeaders, $cacheFile, $cacheDuration);

?>
