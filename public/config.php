<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "sports_academy");

if ($conn->connect_error) {
    die(json_encode(["status"=>"error","message"=>"Database connection failed"]));
}
?>
