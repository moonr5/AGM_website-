<?php
/**
 * Public live AIS proxy (Open Waters terrestrial feed).
 * Used when Data Docked has no credits. No secret key is required.
 */

header("X-Content-Type-Options: nosniff");
header("Cache-Control: no-store");
header("Content-Type: application/json; charset=utf-8");

$bbox = isset($_GET["bbox"]) ? (string) $_GET["bbox"] : "";
if (!preg_match('/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/', $bbox)) {
    http_response_code(400);
    echo json_encode(array("error" => "bbox", "message" => "bbox must be minLat,minLon,maxLat,maxLon."));
    exit;
}

$url = "https://ais.openwaters.io/v1/vessels?bbox=" . rawurlencode($bbox);
$ch = curl_init($url);
curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => array("Accept: application/geo+json, application/json"),
));
$body = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    echo json_encode(array("error" => "upstream", "message" => $err ?: "Live AIS could not be reached."));
    exit;
}

http_response_code($status ?: 502);
echo $body;
