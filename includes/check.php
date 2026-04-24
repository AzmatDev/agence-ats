<?php
require_once __DIR__ . '/../config.php';

if (!SITE_ACTIVE) {
    header("Location: /suspended.html");
    exit();
}