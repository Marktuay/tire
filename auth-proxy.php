<?php
// auth-proxy.php
// Handles secure User Registration and Login for GlobalTire Frontend

// 1. SECURITY: CORS & Headers
$allowed_origins = [
    'https://www.globaltireservices.com',
    'http://localhost:8000',
    'http://127.0.0.1:5500'
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Load WordPress Core
// We need access to wp_create_user, wp_signon, etc.
if (file_exists('wp-load.php')) {
    require_once('wp-load.php');
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server Error: WordPress core not found.']);
    exit;
}

// 3. Process Request
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

// Support form-data as well
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

if ($action === 'login') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
        exit;
    }

    $creds = [
        'user_login'    => $username,
        'user_password' => $password,
        'remember'      => true
    ];

    $user = wp_signon($creds, false);

    if (is_wp_error($user)) {
        echo json_encode(['success' => false, 'message' => strip_tags($user->get_error_message())]);
    } else {
        // Success! Return user info (excluding password/sensitive data)
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user->ID,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'avatar_url' => get_avatar_url($user->ID)
            ],
            'message' => 'Login successful'
        ]);
    }

} elseif ($action === 'register') {
    $email = $data['email'] ?? '';
    $username = $data['username'] ?? ''; // New field
    $password = $data['password'] ?? '';
    
    // Quick validation
    if (!is_email($email)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
        exit;
    }
    // Use part of email as fallback username if not provided
    if (empty($username)) {
        $parts = explode('@', $email);
        $username = $parts[0];
    }
    
    if (username_exists($username) || email_exists($email)) {
        echo json_encode(['success' => false, 'message' => 'Account already exists (username or email taken).']);
        exit;
    }
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }

    // Attempt to create customer
    // Check if WooCommerce function exists
    if (function_exists('wc_create_new_customer')) {
        try {
            // wc_create_new_customer( $email, $username, $password )
            $user_id = wc_create_new_customer($email, $username, $password);
            
            if (is_wp_error($user_id)) {
                 echo json_encode(['success' => false, 'message' => $user_id->get_error_message()]);
            } else {
                 // Set Display Name to Username explicitly
                 wp_update_user([
                     'ID' => $user_id, 
                     'display_name' => $username,
                     'first_name' => $username // Fallback for first name
                 ]);
                 echo json_encode(['success' => true, 'message' => 'Registration successful! Please log in.']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    } else {
        // Fallback to standard WP user
        $user_id = wp_create_user($username, $password, $email);
        if (is_wp_error($user_id)) {
            echo json_encode(['success' => false, 'message' => $user_id->get_error_message()]);
        } else {
            // Set Display Name
            wp_update_user([
                'ID' => $user_id, 
                'display_name' => $username,
                'first_name' => $username
            ]);
            echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
        }
    }

} elseif ($action === 'get_orders') {
    // Requires 'user_id' in GET or POST
    $user_id = $_REQUEST['user_id'] ?? 0;
    
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }

    if (function_exists('wc_get_orders')) {
        $orders = wc_get_orders([
            'customer' => $user_id,
            'limit' => 20,
            'orderby' => 'date',
            'order' => 'DESC'
        ]);

        $order_data = [];
        foreach ($orders as $order) {
            $order_data[] = [
                'id' => $order->get_id(),
                'status' => $order->get_status(),
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
                'date_created' => $order->get_date_created()->date('Y-m-d H:i:s'),
                'item_count' => $order->get_item_count()
            ];
        }
        echo json_encode(['success' => true, 'orders' => $order_data]);
    } else {
        echo json_encode(['success' => false, 'message' => 'WooCommerce not active']);
    }

} elseif ($action === 'get_address') {
    $user_id = $_REQUEST['user_id'] ?? 0;
    
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }

    $customer = new WC_Customer($user_id);
    
    echo json_encode([
        'success' => true,
        'billing' => $customer->get_billing(),
        'shipping' => $customer->get_shipping()
    ]);

} elseif ($action === 'get_details') {
    $user_id = $_REQUEST['user_id'] ?? 0;
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    $u = get_userdata($user_id);
    if ($u) {
        echo json_encode([
            'success' => true,
            'user' => [
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'display_name' => $u->display_name,
                'email' => $u->user_email,
                'avatar_url' => get_avatar_url($u->ID)
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }

} elseif ($action === 'update_details') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Support form-data as well
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }
    
    $user_id = $data['user_id'] ?? 0;
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }

    $update_data = ['ID' => $user_id];
    
    if (!empty($data['first_name'])) $update_data['first_name'] = sanitize_text_field($data['first_name']);
    if (!empty($data['last_name'])) $update_data['last_name'] = sanitize_text_field($data['last_name']);
    if (!empty($data['display_name'])) $update_data['display_name'] = sanitize_text_field($data['display_name']);
    if (!empty($data['email'])) $update_data['user_email'] = sanitize_email($data['email']);
    
    // Password change
    if (!empty($data['password_current']) && !empty($data['password_new'])) {
        $user = get_user_by('id', $user_id);
        if ($user && wp_check_password($data['password_current'], $user->user_pass, $user_id)) {
            $update_data['user_pass'] = $data['password_new'];
        } else {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
            exit;
        }
    }

    $result = wp_update_user($update_data);

    if (is_wp_error($result)) {
        echo json_encode(['success' => false, 'message' => $result->get_error_message()]);
    } else {
        // Return updated user object to update localStorage
        $u = get_userdata($user_id);
        echo json_encode([
            'success' => true, 
            'message' => 'Account details updated successfully.',
            'user' => [
                'id' => $u->ID,
                'email' => $u->user_email,
                'display_name' => $u->display_name,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'avatar_url' => get_avatar_url($u->ID)
            ]
        ]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
?>
