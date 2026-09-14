<?php
/**
 * Copy this file to enquire-config.php on Hostinger and fill in a mailbox
 * created under agmaritim.com in hPanel → Emails.
 *
 * SMTP is the reliable Hostinger path. If this file is absent, the form
 * still sends through FormSubmit to corporate@stratconagaraglobal.com.
 */
return array(
    "to" => "corporate@stratconagaraglobal.com",
    "from" => "noreply@agmaritim.com",
    "from_name" => "AGM Website",
    "smtp_host" => "smtp.hostinger.com",
    "smtp_port" => 465,
    "smtp_user" => "noreply@agmaritim.com",
    "smtp_pass" => "PUT_MAILBOX_PASSWORD_HERE",
);
