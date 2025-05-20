<?php

/*
 * Description: A simple proxy script for the Netdata API.
 *     This script is not technically required as We can pull durectly from 
 *     the Netdata API however it allows us uptions as Netdata evolves and 
 *     allows us to put extra protection in place as well as caching.
 *
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

$apiUrl = "https://netdata.example.com.com/api/v2/nodes";
$apiKey = "NotSet";
$cacheFile = '../../cache/appbeatproxy.cache';
$cacheDuration = 30;  // maximum we are allowed

include '../../config/appbeatproxy.config';

// If apiKey is not set then don't even try doing anything
if ($apiKey == "NotSet") {
    http_response_code(500);
    echo json_encode(["success" => "false","error" => "API Key not set"]);
    exit;
}

function fetchFromApi($apiUrl, $apiKey) {
    $options = [
        "http" => [
            "header" => "Authorization: Bearer " . $apiKey,
            "method" => "GET",
        ],
    ];
    $context = stream_context_create($options);
    return file_get_contents($apiUrl, false, $context);
}

// Check if cache file exists and is still valid
if (file_exists($cacheFile)) {
    $cacheData = json_decode(file_get_contents($cacheFile), true);
    $cacheAge = time() - $cacheData['timestamp'];

    // If cache is still valid, return cached content
    if ($cacheAge <= $cacheDuration) {
	header("Content-Type: application/json");
        header("X-Data-Source: Cached");  
        echo $cacheData['data'];
        exit;
    }
}

// Fetch new data from the API
$response = fetchFromApi($apiUrl, $apiKey);

if ($response === FALSE) {
    // If API request fails and cache exists, return the cached content
    if (isset($cacheData)) {
	header("Content-Type: application/json");
        header("X-Data-Source: Cached (Fallback)");
        echo $cacheData['data'];
        exit;
    }

    // If no cache exists, return an error
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch data from AppBeat API"]);
    exit;
}

// Cache the response
$cacheData = [
    'timestamp' => time(),
    'data' => $response,
];
file_put_contents($cacheFile, json_encode($cacheData));

// Return the response
header("Content-Type: application/json");
header("X-Data-Source: Live");
echo $response;
?>

