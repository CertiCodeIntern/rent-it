<?php
session_start();
include_once($_SERVER['DOCUMENT_ROOT'] . '/rent-it/shared/php/db_connection.php');
include '../../shared/php/auth_check.php';

$user_id = $_SESSION['user_id'];


$user_query = "SELECT full_name, email, phone, address FROM users WHERE id = ?";
$stmt = $conn->prepare($user_query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user_data = $stmt->get_result()->fetch_assoc();


$items_to_show = isset($_GET['items']) ? $_GET['items'] : '';

if (empty($items_to_show)) {

    header("Location: ../cart/cart.php");
    exit();
}


$ids_array = explode(',', $items_to_show);
$clean_ids = implode(',', array_map('intval', $ids_array));



$cart_query = "SELECT c.id as cart_row_id, c.quantity, i.item_name, i.category, i.price_per_day, i.image,
                      c.start_date, c.end_date 
               FROM cart c 
               JOIN item i ON c.item_id = i.item_id 
               WHERE c.user_id = ? AND c.id IN ($clean_ids)";

$stmt = $conn->prepare($cart_query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$cart_items = $stmt->get_result();

$total_subtotal = 0;
$items_list = []; 
while($row = $cart_items->fetch_assoc()){
    $d1 = new DateTime($row['start_date']);
    $d2 = new DateTime($row['end_date']);
    
    // DIFF + 1 para maging inclusive (Feb 10 to Feb 11 = 2 days)
    $diff = $d1->diff($d2);
    $days = $diff->days + 1; 

    $qty = isset($row['quantity']) ? intval($row['quantity']) : 1;
    $row['quantity'] = $qty;
    $row['rental_days'] = $days;
    $row['line_total'] = $row['price_per_day'] * $days * $qty;
    
    $total_subtotal += $row['line_total'];
    $items_list[] = $row;
}

$order_ref = "RIT-" . date('Ymd') . "-" . strtoupper(substr(uniqid(), -6));

$delivery_fee = 150;
$service_fee = 50;
$grand_total = $total_subtotal + $delivery_fee + $service_fee;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt - Checkout">
    <title>RentIt - Checkout</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="../../shared/css/theme.css">
    <link rel="stylesheet" href="../../shared/css/globals.css">
    <link rel="stylesheet" href="../../client/dashboard/dashboard.css">
    <link rel="stylesheet" href="../checkout/checkout.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
</head>
<body>
    <div class="page-skeleton-overlay" aria-hidden="true">
        <div class="page-skeleton-shell">
            <aside class="page-skeleton-sidebar">
                <div class="page-skeleton-logo skeleton-shape"></div>
                <div class="page-skeleton-nav">
                    <span class="page-skeleton-pill skeleton-shape w-70"></span>
                    <span class="page-skeleton-pill skeleton-shape w-60"></span>
                    <span class="page-skeleton-pill skeleton-shape w-80"></span>
                    <span class="page-skeleton-pill skeleton-shape w-50"></span>
                    <span class="page-skeleton-pill skeleton-shape w-70"></span>
                </div>
                <div class="page-skeleton-user">
                    <span class="page-skeleton-circle skeleton-shape"></span>
                    <span class="page-skeleton-line skeleton-shape w-60" style="height: 12px;"></span>
                </div>
            </aside>
            <section class="page-skeleton-main">
                <div class="page-skeleton-topbar">
                    <span class="page-skeleton-line skeleton-shape w-30" style="height: 14px;"></span>
                    <span class="page-skeleton-circle skeleton-shape"></span>
                </div>
                <div class="page-skeleton-card">
                    <div class="page-skeleton-row" style="grid-template-columns: 1fr auto;">
                        <span class="page-skeleton-line skeleton-shape w-40" style="height: 14px;"></span>
                        <span class="page-skeleton-pill skeleton-shape w-20"></span>
                    </div>
                    <div class="page-skeleton-table">
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-35 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-25 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-40 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-30 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-50 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-25 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                    </div>
                </div>
                <div class="page-skeleton-loader">
                    <span class="page-skeleton-spinner" aria-hidden="true"></span>
                    <span>Loading content...</span>
                </div>
            </section>
        </div>
    </div>
    <div class="app-container">
        <!-- Sidebar Container (Injected by JS) -->
        <div id="sidebarContainer"></div>
        
        <!-- Main Content -->
        <main class="main-content">
            <!-- Topbar Container (Injected by JS) -->
            <div id="topbarContainer"></div>
            
            <!-- Content Area -->
            <div class="content-area fade-in-up" id="contentArea">
                <!-- Page Header -->
                <div class="page-header-dashboard">
                    <div class="page-header-info">
                        <h1 class="page-title">Checkout</h1>
                        <p class="page-subtitle">Complete your rental booking</p>
                    </div>
                </div>

               
                <div class="checkout-layout">
    <div class="checkout-main">
        <div class="checkout-card receipt-card">
            <div class="receipt-header">
                <div class="receipt-info">
                    <span class="receipt-label">Order Reference</span>
                    <span class="receipt-id"><?php echo $order_ref; ?></span>
                </div>
            </div>
            <div class="receipt-status">
                <span class="status-badge pending">Pending Confirmation</span>
            </div>
        </div>

        <div class="checkout-card">
            <div class="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <h2>Customer Information</h2>
                
            </div>
            <div class="customer-details">
                <div class="detail-row">
                    <span class="detail-label">Full Name</span>
                    <span class="detail-value"><?php echo htmlspecialchars($user_data['full_name']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value"><?php echo htmlspecialchars($user_data['email']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value"><?php echo htmlspecialchars($user_data['phone'] ?? 'Not set'); ?></span>
                </div>
            </div>
        </div>

        <div class="checkout-card">
            <div class="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <h2>Delivery Options</h2>
            </div>
            <div class="delivery-options">
                <label class="delivery-option selected">
                    <input type="radio" name="delivery" value="standard" data-price="150" checked>
                    <div class="option-content">
                        <div class="option-info"><span class="option-name">Standard Delivery</span></div>
                        <span class="option-price">₱150</span>
                    </div>
                </label>

                <label class="delivery-option">
                    <input type="radio" name="delivery" value="express" data-price="300">
                    <div class="option-content">
                        <div class="option-info"><span class="option-name">Express Delivery</span></div>
                        <span class="option-price">₱300</span>
                    </div>
                </label>

                <label class="delivery-option disabled">
                    <input type="radio" name="delivery" value="pickup" data-price="0" disabled>
                    <div class="option-content">
                        <div class="option-info">
                            <span class="option-name">Store Pickup</span>
                            <span class="option-unavailable">Coming Soon</span>
                        </div>
                        <span class="option-price">Free</span>
                    </div>
                </label>
            </div>
        </div>
    </div>

    <div class="checkout-sidebar">
        <div class="checkout-card">
            <div class="card-header">
                <h2>Order Items</h2>
                <?php
                    $total_units = array_sum(array_column($items_list, 'quantity'));
                    $row_count = count($items_list);
                    if ($total_units > $row_count) {
                        echo '<span class="item-count">' . $row_count . ' ' . ($row_count == 1 ? 'item' : 'items') . ' &middot; ' . $total_units . ' units</span>';
                    } else {
                        echo '<span class="item-count">' . $row_count . ' ' . ($row_count == 1 ? 'item' : 'items') . '</span>';
                    }
                ?>
            </div>

          <div class="order-items">
    <?php foreach($items_list as $item): 
        // Image logic
        $imgName = !empty($item['image']) ? $item['image'] : 'catalog-fallback.svg';
    ?>
    <div class="order-item checkout-order-item">
        <div class="checkout-item-thumb">
            <img src="../../assets/images/items/<?php echo htmlspecialchars($imgName); ?>" 
                 onerror="this.src='../../assets/images/catalog-fallback.svg'">
        </div>
        
        <div class="order-item-details">
            <h4 class="order-item-name">
                <?php echo htmlspecialchars($item['item_name']); ?>
                <?php if ($item['quantity'] > 1): ?>
                    <span style="font-size:0.8rem;font-weight:600;color:#6b7280;background:#f3f4f6;border-radius:6px;padding:2px 8px;margin-left:6px;">x<?php echo $item['quantity']; ?></span>
                <?php endif; ?>
            </h4>
            
            <div class="checkout-item-dates">
                <div>
                    <span>Start: <b><?php echo date('M d, Y', strtotime($item['start_date'])); ?></b></span>
                </div>
                <div>
                    <span>End: <b><?php echo date('M d, Y', strtotime($item['end_date'])); ?></b></span>
                </div>
                <small class="checkout-rental-duration">
                    (<?php echo $item['rental_days']; ?> <?php echo ($item['rental_days'] > 1 ? 'days' : 'day'); ?> rental<?php if ($item['quantity'] > 1): ?> &times; <?php echo $item['quantity']; ?> units<?php endif; ?>)
                </small>
            </div>

            <span class="item-subtotal">
                ₱<?php echo number_format($item['line_total'], 2); ?>
            </span>
        </div>
    </div>
    <?php endforeach; ?>
</div>
        </div>

        <div class="checkout-card order-summary-card">
        <div class="summary-breakdown">
        <div class="summary-row">
    <span>Subtotal</span>
    <span id="summarySubtotal">₱<?php echo number_format($total_subtotal, 2); ?></span>
</div>
    <div class="summary-row">
        <span>Delivery Fee</span>
        <span id="summaryDelivery">₱<?php echo number_format($delivery_fee, 2); ?></span>
    </div>
    <div class="summary-row">
        <span>Service Fee</span>
        <span id="summaryService">₱<?php echo number_format($service_fee, 2); ?></span>
    </div>
    <div class="summary-total">
    <span>Total</span>
    <span id="summaryTotal">₱<?php echo number_format($grand_total, 2); ?></span>
</div>
</div>

            <div class="payment-section">
                <h3>Payment Method</h3>
                <div class="payment-options">
                    <label class="payment-option selected"><input type="radio" name="payment" value="cod" checked> Cash on Delivery</label>
                    <label class="payment-option disabled"><input type="radio" name="payment" value="gcash" disabled> GCash <span class="option-unavailable">Coming Soon</span></label>
                    <label class="payment-option disabled"><input type="radio" name="payment" value="bt" disabled> Bank Transfer <span class="option-unavailable">Coming Soon</span></label>
                </div>
            </div>

            <form id="checkoutForm">
    <input type="hidden" name="order_ref" value="<?php echo $order_ref; ?>">
    <input type="hidden" name="grand_total" id="hiddenGrandTotal" value="<?php echo $grand_total; ?>">
    
    <input type="hidden" name="rental_days" value="<?php echo $items_list[0]['rental_days']; ?>">
    
    <button type="submit" class="btn-confirm-order">Confirm Order</button>
</form>


            <p class="terms-note">
                                By confirming, you agree to our 
                                <a href="/rent-it/pages/terms.html">Terms of Service</a> and 
                                <a href="/rent-it/pages/privacy-policy.html">Privacy Policy</a>.
                            </p>
                        </div>
            
            <a href="../../client/cart/cart.php" class="btn-back-cart" style="display: block; text-align: center; margin-top: 15px; text-decoration: none; color: #666;">
                ← Back to Cart
            </a>
        </div>
    </div>
</div>
        </main>
    </div>
    <script> 
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const deliveryFee = parseFloat(this.getAttribute('data-price')) || 0;
        
        const subtotalText = document.getElementById('summarySubtotal').innerText;
        const subtotal = parseFloat(subtotalText.replace(/[^\d.]/g, ''));
        
        const serviceFeeText = document.getElementById('summaryService').innerText;
        const serviceFee = parseFloat(serviceFeeText.replace(/[^\d.]/g, ''));
        
        document.getElementById('summaryDelivery').innerText = '₱' + deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2});
        
        const newTotal = subtotal + deliveryFee + serviceFee;
        
        document.getElementById('summaryTotal').innerText = '₱' + newTotal.toLocaleString(undefined, {minimumFractionDigits: 2});

        console.log("Delivery updated to: " + deliveryFee); 
    });
});
</script>
<script>
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const totalElement = document.getElementById('summaryTotal');
    const grandTotal = totalElement ? parseFloat(totalElement.innerText.replace(/[^\d.]/g, '')) : 0;

    const formData = new FormData(this); 
    
    // --- ETO ANG DAGDAG ---
    // Ipinapasa nito yung string ng IDs (e.g., "12,15") sa place_order.php
    formData.append('cart_ids', '<?php echo $items_to_show; ?>'); 
    // ---------------------

    formData.append('grand_total', grandTotal);
    
    const delivery = document.querySelector('input[name="delivery"]:checked');
    const payment = document.querySelector('input[name="payment"]:checked');
    
    formData.append('delivery_type', delivery ? delivery.value : 'standard');
    formData.append('payment_method', payment ? payment.value : 'cod');
    formData.append('venue', "Home Delivery");

    Swal.fire({
        title: 'Processing Order...',
        text: 'Please wait while we secure your booking.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('place_order.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text()) 
    .then(text => {
        Swal.close(); 
        try {
            const data = JSON.parse(text); 
            if (data.status === 'success') {
                Swal.fire({
                    title: 'Order Confirmed!',
                    text: 'Your Order ID is: ' + data.order_id,
                    icon: 'success',
                    confirmButtonText: 'View My Rentals',
                    confirmButtonColor: '#4f46e5'
                }).then(() => {
                    window.location.href = '../myrentals/myrentals.php';
                });
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (err) {
            console.error("Server Error Response:", text);
            Swal.fire({
                title: 'System Error',
                text: 'Maling response mula sa server.',
                icon: 'error'
            });
        }
    })
    .catch(error => {
        Swal.close(); 
        console.error('Fetch Error:', error);
        Swal.fire('Error', 'Hindi makakonekta sa server.', 'error');
    });
});
</script>
    <!-- Scripts -->
    <script src="../../shared/js/components.js"></script>
    <script src="checkout.js"></script>
</body>
</html>
