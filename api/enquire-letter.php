<?php
/**
 * Shared enquiry letter — HTML for SMTP/mail, and FormSubmit field map.
 */

const AGM_FORMSUBMIT_ID = "61682d31a83783a04281843d3581c10f";
const AGM_FORMSUBMIT_AJAX = "https://formsubmit.co/ajax/" . AGM_FORMSUBMIT_ID;

function agm_letter_h($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, "UTF-8");
}

function agm_letter_subject($name, $service)
{
    $subject = "New AGM enquiry — " . $name;
    if ($service !== "") {
        $subject .= " — " . $service;
    }
    return $subject;
}

function agm_letter_text($name, $email, $phone, $service, $message, $when, $consent = "")
{
    return implode("\n", array(
        "PT. Agara Global Maritim",
        "New website enquiry",
        "",
        "Who wrote:       " . $name,
        "Their email:     " . $email,
        "Their phone:     " . ($phone !== "" ? $phone : "Not given"),
        "About:           " . ($service !== "" ? $service : "General enquiry"),
        "Privacy consent: " . ($consent !== "" ? $consent : "Not recorded"),
        "Sent:            " . $when,
        "",
        "What they wrote",
        $message,
        "",
        "Reply to this email to reach the visitor.",
        "Marunda yard · North Jakarta 14150 · +62 819-231-001",
    ));
}

function agm_letter_html($name, $email, $phone, $service, $message, $when, $consent = "")
{
    $safeName = agm_letter_h($name);
    $safeEmail = agm_letter_h($email);
    $safePhone = agm_letter_h($phone !== "" ? $phone : "Not given");
    $safeService = agm_letter_h($service !== "" ? $service : "General enquiry");
    $safeConsent = agm_letter_h($consent !== "" ? $consent : "Not recorded");
    $safeWhen = agm_letter_h($when);
    $safeMessage = nl2br(agm_letter_h($message), false);
    $mailto = agm_letter_h("mailto:" . $email);

    return '<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#e8eef3">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8eef3;padding:28px 12px">'
        . '<tr><td align="center">'
        . '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #d5dee7;border-radius:18px;overflow:hidden">'
        . '<tr><td style="background:#0b1c33;padding:28px 32px">'
        . '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#96f878">New website enquiry</div>'
        . '<div style="font-family:Georgia,Times,serif;font-size:24px;line-height:1.25;color:#ffffff;margin-top:8px">PT. Agara Global Maritim</div>'
        . '<div style="font-family:Georgia,Times,serif;font-style:italic;font-size:15px;color:#c5d4e2;margin-top:6px">A visitor wrote from agmaritim.com</div>'
        . '</td></tr>'
        . '<tr><td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;color:#06101c">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        . agm_letter_row("Who wrote", $safeName)
        . agm_letter_row("Their email", '<a href="' . $mailto . '" style="color:#185684;text-decoration:none">' . $safeEmail . "</a>")
        . agm_letter_row("Their phone", $safePhone)
        . agm_letter_row("About", $safeService)
        . agm_letter_row("Privacy consent", $safeConsent)
        . agm_letter_row("Sent", $safeWhen)
        . "</table>"
        . '<div style="margin:22px 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6a7b8c">What they wrote</div>'
        . '<div style="background:#f4f7fa;border-left:3px solid #96f878;padding:14px 16px;font-size:15px;line-height:1.55;color:#06101c">' . $safeMessage . "</div>"
        . '<p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#4d5d6e">Reply to this email to write to ' . $safeName . " directly.</p>"
        . "</td></tr>"
        . '<tr><td style="padding:18px 32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6a7b8c;border-top:1px solid #e4ebf1">'
        . "Marunda yard · North Jakarta 14150<br>+62 819-231-001 · corporate@stratconagaraglobal.com"
        . "</td></tr>"
        . "</table></td></tr></table></body></html>";
}

function agm_letter_row($label, $value)
{
    return '<tr>'
        . '<td style="padding:0 0 12px;width:112px;vertical-align:top;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6a7b8c">' . $label . "</td>"
        . '<td style="padding:0 0 12px;font-size:15px;line-height:1.4;color:#06101c">' . $value . "</td>"
        . "</tr>";
}

function agm_formsubmit_fields($name, $email, $phone, $service, $message, $subject)
{
    return array(
        "Who wrote" => $name,
        "Their email" => $email,
        "Their phone" => $phone !== "" ? $phone : "Not given",
        "About" => $service !== "" ? $service : "General enquiry",
        "Privacy consent" => "Yes",
        "What they wrote" => $message,
        "_subject" => $subject,
        "_template" => "box",
        "_captcha" => "false",
        "_replyto" => $email,
        "_autoresponse" => "Thank you for writing to PT. Agara Global Maritim. We have received your enquiry and will reply shortly.",
    );
}

function agm_mime_email($fromName, $from, $to, $replyTo, $subject, $text, $html)
{
    $boundary = "agm" . bin2hex(random_bytes(8));
    $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $encodedFrom = "=?UTF-8?B?" . base64_encode($fromName) . "?= <" . $from . ">";
    $headers = array(
        "Date: " . gmdate("D, d M Y H:i:s") . " +0000",
        "From: " . $encodedFrom,
        "To: " . $to,
        "Reply-To: " . $replyTo,
        "Subject: " . $encodedSubject,
        "MIME-Version: 1.0",
        "Content-Type: multipart/alternative; boundary=\"" . $boundary . "\"",
        "X-Mailer: AGM Website",
    );
    $parts = array(
        "--" . $boundary,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        $text,
        "--" . $boundary,
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        $html,
        "--" . $boundary . "--",
        "",
    );
    return array($headers, implode("\r\n", $parts));
}
