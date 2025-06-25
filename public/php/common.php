<?php
/*
 * Description: Common functions for proxy scripts
 *
 * Usage: Typically called by calling `proxyRequest($apiUrl,$apiKey,$cacheFile,$cacheDuration)`
 *
 *        Adds a "X-Data-Source" header to show the status of the cache.
 *           Live         - Data was grabbed and is being returned live
 *           Cached       - Data was returned from the cache file
 *           Stale Cache  - Data returned from cache file and stale
 *
 * Notes: Currently only supports bearer token authentication
 *
 */


// Return 403 Forbidden if this file is accessed directly via HTTP
if (php_sapi_name() !== 'cli' && basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}

/**
 * Fetch data from an API endpoint using a Bearer token.
 */
function fetchFromApi(string $apiUrl, string $apiKey) {
    $options = [
        'http' => [
            'header' => 'Authorization: Bearer ' . $apiKey,
            'method' => 'GET',
        ],
    ];
    $context = stream_context_create($options);
    return @file_get_contents($apiUrl, false, $context);
}

/**
 * Attempt to read cached data if it is still valid.
 *
 * @return string|false Cached JSON string or false if not usable
 */
function getCachedData(string $cacheFile, int $cacheDuration) {
    if (!file_exists($cacheFile)) {
        return false;
    }

    $cacheData = json_decode(file_get_contents($cacheFile), true);
    if (!isset($cacheData['timestamp'], $cacheData['data'])) {
        return false;
    }

    $cacheAge = time() - $cacheData['timestamp'];
    if ($cacheAge > $cacheDuration) {
        return false;
    }

    return $cacheData['data'];
}

/**
 * Save API response to cache.
 */
function writeCache(string $cacheFile, string $response): void {
    $cacheData = [
        'timestamp' => time(),
        'data' => $response,
    ];
    file_put_contents($cacheFile, json_encode($cacheData));
}

/**
 * Proxy a request to a remote API with caching and fallback logic.
 */
function proxyRequest(string $apiUrl, string $apiKey, string $cacheFile, int $cacheDuration): void {
    // return cached data if possible
    $cached = getCachedData($cacheFile, $cacheDuration);
    if ($cached !== false) {
        header('Content-Type: application/json');
        header('X-Data-Source: Cached');
        echo $cached;
        return;
    }

    $response = fetchFromApi($apiUrl, $apiKey);

    if ($response === false) {
        // if api call failed try serving stale cache
        $stale = file_exists($cacheFile) ? json_decode(file_get_contents($cacheFile), true)['data'] ?? false : false;
        if ($stale !== false) {
            header('Content-Type: application/json');
            header('X-Data-Source: Stale Cache');
            echo $stale;
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch data from Remote API']);
        return;
    }

    // store and serve fresh response
    writeCache($cacheFile, $response);
    header('Content-Type: application/json');
    header('X-Data-Source: Live');
    echo $response;
}

?>
