<?php
/**
 * Server-side Data Docked proxy. The browser never sees the API key.
 * Copy datadocked-config.sample.php to datadocked-config.php on Hostinger.
 */

header("X-Content-Type-Options: nosniff");
header("Cache-Control: no-store");
header("Content-Type: application/json; charset=utf-8");

$allowed = array(
    "my-credits",
    "get-vessels-by-area",
    "get-vessel-info",
    "get-vessel-historical-data",
    "port-calls-by-port",
);

$path = isset($_GET["dd"]) ? (string) $_GET["dd"] : "";
$path = strtolower(trim($path, "/"));
if (!in_array($path, $allowed, true)) {
    http_response_code(404);
    echo json_encode(array("error" => "unknown_endpoint", "message" => "That Data Docked path is not exposed."));
    exit;
}

$key = getenv("DATADOCKED_API_KEY");
$configFile = __DIR__ . "/datadocked-config.php";
if (!$key && is_file($configFile)) {
    $cfg = include $configFile;
    if (is_array($cfg) && !empty($cfg["api_key"])) {
        $key = (string) $cfg["api_key"];
    }
}

if (!$key) {
    http_response_code(401);
    echo json_encode(array("error" => "unauthorized", "message" => "No Data Docked key configured."));
    exit;
}

$query = $_GET;
unset($query["dd"]);
$url = "https://datadocked.com/api/vessels_operations/" . $path;
if ($query) {
    $url .= "?" . http_build_query($query);
}

$ch = curl_init($url);
curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => array(
        "Accept: application/json",
        "x-api-key: " . $key,
    ),
));
$body = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    echo json_encode(array("error" => "upstream", "message" => $err ?: "Data Docked could not be reached."));
    exit;
}

http_response_code($status ?: 502);
echo $body;
