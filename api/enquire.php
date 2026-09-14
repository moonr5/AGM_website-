<?php
/**
 * Enquiry mailbox for the public form at /en/enquire/.
 *
 * Hostinger runs this file. Each valid submit is mailed to the corporate
 * inbox and a private copy is kept under /storage/enquiries/.
 */

header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: no-referrer");
header("Cache-Control: no-store");

const AGM_ENQUIRE_TO = "corporate@stratconagaraglobal.com";
const AGM_ENQUIRE_FROM_ADDR = "noreply@agmaritim.com";
const AGM_ENQUIRE_FROM_NAME = "AGM Website";
const AGM_ENQUIRE_MAX = 8;
const AGM_ENQUIRE_WINDOW = 3600;

require_once __DIR__ . "/enquire-letter.php";

function agm_wants_json()
{
    $accept = isset($_SERVER["HTTP_ACCEPT"]) ? $_SERVER["HTTP_ACCEPT"] : "";
    $type = isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : "";
    if (isset($_SERVER["HTTP_X_REQUESTED_WITH"]) && strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) === "xmlhttprequest") {
        return true;
    }
    return stripos($accept, "application/json") !== false
        || stripos($type, "application/json") !== false;
}

function agm_clean_header($value)
{
    return trim(str_replace(array("\r", "\n", "%0a", "%0d", "%0A", "%0D"), "", (string) $value));
}

function agm_text($value, $max)
{
    $value = trim(preg_replace("/[ \t]+/u", " ", str_replace("\0", "", (string) $value)));
    if (function_exists("mb_substr")) {
        return mb_substr($value, 0, $max, "UTF-8");
    }
    return substr($value, 0, $max);
}

function agm_reply($status, $ok, $error = "", $extra = array())
{
    $payload = array_merge(array("ok" => $ok, "error" => $error), $extra);
    http_response_code($status);
    if (agm_wants_json()) {
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode($payload);
        exit;
    }
    header("Content-Type: text/html; charset=utf-8");
    $title = $ok ? "Enquiry sent" : "Enquiry not sent";
    $body = $ok
        ? "Thank you. Your enquiry has been sent. We will reply shortly."
        : ($error !== "" ? $error : "The message could not be sent.");
    $back = "/en/enquire/";
    echo "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>"
        . htmlspecialchars($title, ENT_QUOTES, "UTF-8")
        . "</title></head><body style=\"font-family:Georgia,serif;padding:48px 24px;max-width:40em\">"
        . "<p>" . htmlspecialchars($body, ENT_QUOTES, "UTF-8") . "</p>"
        . "<p><a href=\"" . htmlspecialchars($back, ENT_QUOTES, "UTF-8") . "\">Back to the form</a></p>"
        . "</body></html>";
    exit;
}

function agm_enquire_config()
{
    $defaults = array(
        "to" => AGM_ENQUIRE_TO,
        "from" => AGM_ENQUIRE_FROM_ADDR,
        "from_name" => AGM_ENQUIRE_FROM_NAME,
        "smtp_host" => getenv("AGM_SMTP_HOST") ?: "",
        "smtp_port" => (int) (getenv("AGM_SMTP_PORT") ?: 465),
        "smtp_user" => getenv("AGM_SMTP_USER") ?: "",
        "smtp_pass" => getenv("AGM_SMTP_PASS") ?: "",
    );
    $file = __DIR__ . "/enquire-config.php";
    if (is_file($file)) {
        $loaded = include $file;
        if (is_array($loaded)) {
            $defaults = array_merge($defaults, $loaded);
        }
    }
    return $defaults;
}

function agm_smtp_expect($fp, $want)
{
    $chunk = "";
    while (!feof($fp)) {
        $line = fgets($fp, 512);
        if ($line === false) {
            break;
        }
        $chunk .= $line;
        if (strlen($line) < 4 || $line[3] !== "-") {
            break;
        }
    }
    $code = (int) substr($chunk, 0, 3);
    return $code >= $want && $code < $want + 100;
}

function agm_smtp_cmd($fp, $cmd, $want)
{
    fwrite($fp, $cmd . "\r\n");
    return agm_smtp_expect($fp, $want);
}

function agm_send_smtp($cfg, $to, $subject, $body, $html, $replyTo)
{
    $host = trim((string) ($cfg["smtp_host"] ?? ""));
    $user = trim((string) ($cfg["smtp_user"] ?? ""));
    $pass = (string) ($cfg["smtp_pass"] ?? "");
    $from = trim((string) ($cfg["from"] ?? AGM_ENQUIRE_FROM_ADDR));
    $fromName = trim((string) ($cfg["from_name"] ?? AGM_ENQUIRE_FROM_NAME));
    $port = (int) ($cfg["smtp_port"] ?? 465);
    if ($host === "" || $user === "" || $pass === "" || $pass === "PUT_MAILBOX_PASSWORD_HERE") {
        return false;
    }

    $remote = ($port === 465 ? "ssl://" : "") . $host . ":" . $port;
    $fp = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
    if (!$fp) {
        return false;
    }
    stream_set_timeout($fp, 20);
    if (!agm_smtp_expect($fp, 200)) {
        fclose($fp);
        return false;
    }
    if (!agm_smtp_cmd($fp, "EHLO agmaritim.com", 200)) {
        fclose($fp);
        return false;
    }
    if ($port === 587) {
        if (!agm_smtp_cmd($fp, "STARTTLS", 200)) {
            fclose($fp);
            return false;
        }
        if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($fp);
            return false;
        }
        if (!agm_smtp_cmd($fp, "EHLO agmaritim.com", 200)) {
            fclose($fp);
            return false;
        }
    }
    if (!agm_smtp_cmd($fp, "AUTH LOGIN", 300)) {
        fclose($fp);
        return false;
    }
    if (!agm_smtp_cmd($fp, base64_encode($user), 300)) {
        fclose($fp);
        return false;
    }
    if (!agm_smtp_cmd($fp, base64_encode($pass), 200)) {
        fclose($fp);
        return false;
    }
    if (!agm_smtp_cmd($fp, "MAIL FROM:<" . $from . ">", 200)) {
        fclose($fp);
        return false;
    }
    if (!agm_smtp_cmd($fp, "RCPT TO:<" . $to . ">", 200)) {
        fclose($fp);
        return false;
    }
    if (!agm_smtp_cmd($fp, "DATA", 300)) {
        fclose($fp);
        return false;
    }

    list($headers, $mimeBody) = agm_mime_email($fromName, $from, $to, $replyTo, $subject, $body, $html);
    fwrite($fp, implode("\r\n", $headers) . "\r\n\r\n" . $mimeBody . "\r\n.\r\n");
    $ok = agm_smtp_expect($fp, 200);
    agm_smtp_cmd($fp, "QUIT", 200);
    fclose($fp);
    return $ok;
}

function agm_http_json_post($url, $payload)
{
    $body = json_encode($payload);
    if (function_exists("curl_init")) {
        $ch = curl_init($url);
        curl_setopt_array($ch, array(
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array(
                "Content-Type: application/json",
                "Accept: application/json",
                "Origin: https://agmaritim.com",
                "Referer: https://agmaritim.com/en/enquire/",
            ),
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_TIMEOUT => 20,
        ));
        $raw = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return array($code, $raw);
    }
    $ctx = stream_context_create(array(
        "http" => array(
            "method" => "POST",
            "header" => "Content-Type: application/json\r\nAccept: application/json\r\nOrigin: https://agmaritim.com\r\nReferer: https://agmaritim.com/en/enquire/\r\n",
            "content" => $body,
            "timeout" => 20,
            "ignore_errors" => true,
        ),
    ));
    $raw = @file_get_contents($url, false, $ctx);
    $code = 0;
    if (isset($http_response_header[0]) && preg_match("/\s(\d{3})\s/", $http_response_header[0], $m)) {
        $code = (int) $m[1];
    }
    return array($code, $raw);
}

function agm_send_formsubmit($to, $name, $email, $phone, $service, $message, $subject)
{
    list($code, $raw) = agm_http_json_post(AGM_FORMSUBMIT_AJAX, agm_formsubmit_fields(
        $name,
        $email,
        $phone,
        $service,
        $message,
        $subject
    ));
    $json = is_string($raw) ? json_decode($raw, true) : null;
    $success = is_array($json) && (
        $json["success"] === true
        || $json["success"] === "true"
        || (isset($json["message"]) && stripos((string) $json["message"], "activat") !== false)
        || (isset($json["message"]) && stripos((string) $json["message"], "confirm") !== false)
        || (isset($json["message"]) && stripos((string) $json["message"], "verify") !== false)
    );
    return $code >= 200 && $code < 300 && $success;
}

function agm_send_mail($cfg, $to, $subject, $body, $html, $replyTo)
{
    $from = trim((string) ($cfg["from"] ?? AGM_ENQUIRE_FROM_ADDR));
    $fromName = trim((string) ($cfg["from_name"] ?? AGM_ENQUIRE_FROM_NAME));
    $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    list($headers, $mimeBody) = agm_mime_email($fromName, $from, $to, $replyTo, $subject, $body, $html);
    $headerStr = implode("\r\n", array_filter($headers, function ($line) {
        return stripos($line, "Subject:") !== 0 && stripos($line, "To:") !== 0;
    }));
    if (@mail($to, $encodedSubject, $mimeBody, $headerStr)) {
        return true;
    }
    return @mail($to, $encodedSubject, $mimeBody, $headerStr, "-f " . $from);
}

function agm_deliver($cfg, $to, $subject, $body, $html, $name, $email, $phone, $service, $message)
{
    if (agm_send_smtp($cfg, $to, $subject, $body, $html, $email)) {
        return "smtp";
    }
    if (agm_send_formsubmit($to, $name, $email, $phone, $service, $message, $subject)) {
        return "formsubmit";
    }
    if (agm_send_mail($cfg, $to, $subject, $body, $html, $email)) {
        return "mail";
    }
    return "";
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    agm_reply(405, false, "Send the enquiry form to this address.");
}

$raw = file_get_contents("php://input");
$input = array();
if ($raw !== false && $raw !== "" && stripos($_SERVER["CONTENT_TYPE"] ?? "", "application/json") !== false) {
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        agm_reply(400, false, "The form could not be read.");
    }
    $input = $decoded;
} else {
    $input = $_POST;
}

$honeypot = agm_text($input["website"] ?? "", 80);
if ($honeypot !== "") {
    agm_reply(200, true);
}

$name = agm_text($input["name"] ?? "", 120);
$email = agm_clean_header(agm_text($input["email"] ?? "", 180));
$phone = agm_text($input["phone"] ?? "", 60);
$service = agm_text($input["service"] ?? "", 80);
$message = agm_text($input["message"] ?? "", 4000);

if ($name === "" || $email === "" || $message === "") {
    agm_reply(400, false, "Please add your name, email, and a short message.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    agm_reply(400, false, "Please use a valid email address so we can reply.");
}

$ip = $_SERVER["REMOTE_ADDR"] ?? "0.0.0.0";
$rateDir = dirname(__DIR__) . "/storage/enquiries/rate";
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0750, true);
}
$rateFile = $rateDir . "/" . hash("sha256", $ip) . ".json";
$now = time();
$hits = array();
if (is_file($rateFile)) {
    $prev = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($prev)) {
        $hits = $prev;
    }
}
$hits = array_values(array_filter($hits, function ($stamp) use ($now) {
    return is_int($stamp) && $stamp > $now - AGM_ENQUIRE_WINDOW;
}));
if (count($hits) >= AGM_ENQUIRE_MAX) {
    agm_reply(429, false, "Please wait a little before sending another enquiry.");
}
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

$when = gmdate("Y-m-d H:i") . " UTC";
$subject = agm_clean_header(agm_letter_subject($name, $service));
$body = agm_letter_text($name, $email, $phone, $service, $message, $when);
$html = agm_letter_html($name, $email, $phone, $service, $message, $when);

$storeDir = dirname(__DIR__) . "/storage/enquiries";
if (!is_dir($storeDir)) {
    @mkdir($storeDir, 0750, true);
}
$record = array(
    "at" => $when,
    "name" => $name,
    "email" => $email,
    "phone" => $phone,
    "service" => $service,
    "message" => $message,
    "ip" => $ip,
);
@file_put_contents(
    $storeDir . "/" . gmdate("Ymd-His") . "-" . bin2hex(random_bytes(3)) . ".json",
    json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

$cfg = agm_enquire_config();
$to = agm_clean_header($cfg["to"] ?? AGM_ENQUIRE_TO);
if ($to === "") {
    $to = AGM_ENQUIRE_TO;
}
$via = agm_deliver($cfg, $to, $subject, $body, $html, $name, $email, $phone, $service, $message);

if ($via === "") {
    agm_reply(502, false, "The mailbox could not be reached. Please email corporate@stratconagaraglobal.com or call +62 819-231-001.");
}

agm_reply(200, true, "", array("mailed" => true, "via" => $via));
