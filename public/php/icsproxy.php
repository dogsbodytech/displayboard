<?php
/*
 * Description: A simple proxy script for an ICS calendar file.
 *
 * Configuration:  The following variables can be set
 *     $icsUrl        = The API URL we are calling
 *     $authHeaders    = An array of HTTP headers used for authentication
 *     $cacheFile     = Path to the cache file
 *     $cacheDuration = How many seconds to cache the response
 *
 * Notes:
 *
 */

$icsUrl = "https://ics.example.com/calendar.ics";
$authHeaders = [];
$cacheFile = '../../cache/icsproxy.cache';
$cacheDuration = 300;

include '../../config/icsproxy.config';
require_once 'common.php';

proxyRequest($icsUrl, $authHeaders, $cacheFile, $cacheDuration);

?>
