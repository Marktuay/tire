<?php
// api-proxy.php
// Proxy script to hide WooCommerce API credentials

// 1. SECURITY: Read-only proxy (supports OPTIONS for CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    header("Content-Type: application/json; charset=UTF-8");
    exit(json_encode(['error' => 'Method not allowed. Read-only access.']));
}

// 2. SECURITY: CORS Control (Strict)
// Add your local dev URL and production URL here
$allowed_origins = [
    'https://www.globaltireservices.com',
    'http://localhost:8000',  // Python server
    'http://localhost:8080',  // PHP built-in server (recommended)
    'http://127.0.0.1:5500'   // VS Code Live Server
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
} else {
    // Optional: Allow public access if you want or restrict strict
    // header("Access-Control-Allow-Origin: *"); 
}

header("Content-Type: application/json; charset=UTF-8");

// Configuration - Credentials are safe here on the server
$baseUrl = 'https://www.globaltireservices.com';
$baseEndpoint = '/wp-json/wc/v3/products';
// Consider moving these to a separate config file outside web root if possible
$consumerKey = 'ck_958c162b7c6421798c910b8ee4dcaa18649f718f';
$consumerSecret = 'cs_d9c3c63344a66c596b913a773d44ac69a9668a40'; 

// Get all query parameters sent by the frontend
$params = $_GET;

// Handle single product request by ID
// Logic: If 'id' is passed, append it to the path (e.g., .../products/123)
$pathExtra = '';
if (isset($params['id']) && !empty($params['id'])) {
    $pathExtra = '/' . urlencode($params['id']);
    // Remove 'id' from the query parameters we send to WooCommerce, as it's now in the path
    unset($params['id']);
}

// Add authentication keys to the parameters
$params['consumer_key'] = $consumerKey;
$params['consumer_secret'] = $consumerSecret;

// Build the final URL
$requestUrl = $baseUrl . $baseEndpoint . $pathExtra . '?' . http_build_query($params);

// Initialize cURL session
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $requestUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Optional: If you have SSL certificate issues on dev, you might need this (set to true in prod)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Check for cURL errors
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy Error: ' . curl_error($ch)]);
} else {
    // Forward the HTTP status code and the response body
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>
