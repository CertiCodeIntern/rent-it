<?php
session_start();
include_once($_SERVER['DOCUMENT_ROOT'] . '/rent-it/shared/php/db_connection.php');

header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Session expired. Please login again.");
    }

    $user_id = $_SESSION['user_id'];
    $total_price = $_POST['grand_total'] ?? 0;
    $venue = $_POST['venue'] ?? 'Home Delivery';
    
    // Kunin ang cart_ids mula sa JavaScript (e.g., "12,15")
    $cart_ids = $_POST['cart_ids'] ?? '';

    if (empty($cart_ids)) {
        throw new Exception("No items selected for checkout.");
    }

    $conn->begin_transaction();

    // 1. FIX: Kunin lang ang SELECTED items gamit ang IN ($cart_ids)
    // Dito natin masisiguro na hindi mag-1970 ang date dahil tama ang mahihila nating row
    $cart_query = "SELECT c.item_id, c.quantity, i.price_per_day, c.start_date, c.end_date 
                   FROM cart c 
                   JOIN item i ON c.item_id = i.item_id 
                   WHERE c.user_id = ? AND c.id IN ($cart_ids)";
    
    $stmt_cart = $conn->prepare($cart_query);
    $stmt_cart->bind_param("i", $user_id);
    $stmt_cart->execute();
    $cart_result = $stmt_cart->get_result();

    if ($cart_result->num_rows === 0) {
        throw new Exception("Selected items not found in your cart.");
    }

    // Collect all cart items into an array so we can find earliest/latest dates
    $cart_items = [];
    while ($item = $cart_result->fetch_assoc()) {
        $cart_items[] = $item;
    }

    // Determine the overall date range for the rental summary
    // Use earliest start_date and latest end_date across all items
    $s_date = $cart_items[0]['start_date'];
    $e_date = $cart_items[0]['end_date'];
    foreach ($cart_items as $ci) {
        if ($ci['start_date'] < $s_date) $s_date = $ci['start_date'];
        if ($ci['end_date'] > $e_date) $e_date = $ci['end_date'];
    }

    // 2. Insert sa main Rental table
    $query = "INSERT INTO rental (user_id, rental_status, total_price, venue, start_date, end_date) 
              VALUES (?, 'Pending', ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("idsss", $user_id, $total_price, $venue, $s_date, $e_date);
    
    if (!$stmt->execute()) {
        throw new Exception("Database Error (Rental): " . $conn->error);
    }
    
    $order_id = $conn->insert_id;

    // 3. Insert bawat item sa rental_item table WITH per-item dates and quantity
    $stmt_ri = $conn->prepare("INSERT INTO rental_item (order_id, item_id, quantity, item_price, item_status, start_date, end_date) VALUES (?, ?, ?, ?, 'Rented', ?, ?)");
    
    foreach ($cart_items as $item) {
        $item_id = $item['item_id'];
        $quantity = $item['quantity'];
        $price = $item['price_per_day'];
        $item_start = $item['start_date'];
        $item_end = $item['end_date'];
        $stmt_ri->bind_param("iiidss", $order_id, $item_id, $quantity, $price, $item_start, $item_end);
        $stmt_ri->execute();
        
        // Recalculate available_units based on total, repairing, and SUM of rented quantities
        $recalc_stmt = $conn->prepare("
            UPDATE item i
            SET available_units = (
                i.total_units - i.repairing_units - COALESCE((
                    SELECT SUM(ri.quantity) 
                    FROM rental_item ri 
                    JOIN rental r ON ri.order_id = r.order_id 
                    WHERE ri.item_id = i.item_id 
                    AND r.rental_status IN ('Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Late')
                ), 0)
            )
            WHERE item_id = ?
        ");
        $recalc_stmt->bind_param("i", $item_id);
        $recalc_stmt->execute();
        $recalc_stmt->close();
    }

    // 4. FIX: Burahin LANG ang mga items na binili (gamit ang IN clause)
    // Para kung may itinira siyang items sa cart, nandoon pa rin yun.
    $delete_query = "DELETE FROM cart WHERE user_id = ? AND id IN ($cart_ids)";
    $stmt_delete = $conn->prepare($delete_query);
    $stmt_delete->bind_param("i", $user_id);
    $stmt_delete->execute();

        // 5. Insert notification for admin
        $notif_title = "New Order Placed";
        $notif_message = "User #$user_id placed a new order #$order_id.";
        $notif_type = "order_placed";
        $notif_link = "/rent-it/admin/dashboard/index.php?order_id=$order_id";

        $notif_query = "INSERT INTO notifications (user_id, title, message, type, link_url, is_read) VALUES (NULL, ?, ?, ?, ?, 0)";
        $stmt_notif = $conn->prepare($notif_query);

        $stmt_notif->bind_param("ssss", $notif_title, $notif_message, $notif_type, $notif_link);
        $stmt_notif->execute();
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'order_id' => $order_id]);

    } catch (Exception $e) {
        if (isset($conn)) $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }