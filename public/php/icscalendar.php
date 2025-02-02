<?php

define('ICS_URL', 'https://example.com/calendar.ics'); // Change this to the actual ICS URL
define('CACHE_FILE', 'calendar_cache.json');
define('CACHE_DURATION', 900); // 15 minutes in seconds

include '../../config/icscalendar.config';

// Function to fetch ICS content
function fetch_ics_content($url) {
    $context = stream_context_create(['http' => ['ignore_errors' => true]]);
    return file_get_contents($url, false, $context);
}

// Function to parse ICS data and extract future events
function parse_ics($ics_data) {
    $events = [];
    $lines = explode("\n", $ics_data);
    $event = [];
    $now = time();

    foreach ($lines as $line) {
        $line = trim($line);

        if (strpos($line, "BEGIN:VEVENT") === 0) {
            $event = [];
        } elseif (strpos($line, "END:VEVENT") === 0) {
            if (!empty($event) && isset($event['DTSTART'])) {
                // Convert dates to timestamps and filter past events
                $event['DTSTART'] = parse_ics_date($event['DTSTART']);
                $event['DTEND'] = isset($event['DTEND']) ? parse_ics_date($event['DTEND']) : $event['DTSTART'];

                if ($event['DTSTART'] >= $now) {
                    $events[] = [
                        'DTSTART' => $event['DTSTART'],
                        'DTEND' => $event['DTEND'],
                        'SUMMARY' => $event['SUMMARY'] ?? 'No Title'
                    ];
                }
            }
        } else {
            [$key, $value] = explode(':', $line, 2) + [null, null];
            if ($key && $value && in_array($key, ['DTSTART', 'DTEND', 'SUMMARY'])) {
                $event[$key] = $value;
            }
        }
    }

    return $events;
}

// Function to parse ICS datetime formats
function parse_ics_date($date) {
    if (strpos($date, 'T') !== false) {
        return strtotime($date);
    }
    return strtotime($date . ' 00:00:00'); // If all-day event
}

// Function to get cached data if valid
function get_cached_data() {
    if (file_exists(CACHE_FILE) && (time() - filemtime(CACHE_FILE)) < CACHE_DURATION) {
        return json_decode(file_get_contents(CACHE_FILE), true);
    }
    return null;
}

// Function to save cache
function save_cache($data) {
    file_put_contents(CACHE_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

// Check cache first
$cached_data = get_cached_data();
if ($cached_data) {
    header('Content-Type: application/json');
    echo json_encode($cached_data);
    exit;
}

// Fetch new ICS data
$ics_data = fetch_ics_content(ICS_URL);
if (!$ics_data) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch ICS file']);
    exit;
}

// Parse ICS data
$events = parse_ics($ics_data);

// Save to cache
save_cache($events);

// Return JSON response
header('Content-Type: application/json');
echo json_encode($events);

?>

