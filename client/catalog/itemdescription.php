<?php
session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';

$user_id = $_SESSION['user_id'];
$item_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($item_id <= 0) {
    header("Location: catalog.php");
    exit();
}

// Fetch item details
$query = "SELECT * FROM item WHERE item_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();
$item = $result->fetch_assoc();

if (!$item) {
    header("Location: catalog.php");
    exit();
}

// Fetch reviews with user info
$reviewQuery = "SELECT r.review_id, r.rating, r.feedback, r.review_date, u.full_name 
                FROM review r 
                LEFT JOIN users u ON r.user_id = u.id 
                WHERE r.item_id = ? 
                ORDER BY r.review_date DESC";
$reviewStmt = $conn->prepare($reviewQuery);
$reviewStmt->bind_param("i", $item_id);
$reviewStmt->execute();
$reviews = $reviewStmt->get_result();
$reviewList = [];
while ($rev = $reviews->fetch_assoc()) {
    $reviewList[] = $rev;
}
$reviewCount = count($reviewList);

// Calculate average rating from reviews
$avgRating = 0;
$ratingDistribution = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
if ($reviewCount > 0) {
    $totalRating = 0;
    foreach ($reviewList as $rev) {
        $totalRating += $rev['rating'];
        if (isset($ratingDistribution[$rev['rating']])) {
            $ratingDistribution[$rev['rating']]++;
        }
    }
    $avgRating = round($totalRating / $reviewCount, 1);
} else {
    $avgRating = $item['rating'] ? floatval($item['rating']) : 0;
}

// Fetch upcoming bookings from rental_item + rental
$rentalBookingQuery = "SELECT r.start_date, r.end_date, r.rental_status 
                       FROM rental r 
                       JOIN rental_item ri ON r.order_id = ri.order_id 
                       WHERE ri.item_id = ? AND r.end_date >= CURDATE() 
                       AND r.rental_status NOT IN ('Completed', 'Cancelled', 'Returned')
                       ORDER BY r.start_date ASC";
$rentalStmt = $conn->prepare($rentalBookingQuery);
$rentalStmt->bind_param("i", $item_id);
$rentalStmt->execute();
$rentalBookings = $rentalStmt->get_result();
$rentalBookingList = [];
while ($rb = $rentalBookings->fetch_assoc()) {
    $rentalBookingList[] = $rb;
}

// Also check calendar table
$calendarQuery = "SELECT booked_date_from, booked_date_to, status 
                  FROM calendar 
                  WHERE item_id = ? AND booked_date_to >= CURDATE() 
                  ORDER BY booked_date_from ASC";
$calStmt = $conn->prepare($calendarQuery);
$calStmt->bind_param("i", $item_id);
$calStmt->execute();
$calBookings = $calStmt->get_result();
$calBookingList = [];
while ($cb = $calBookings->fetch_assoc()) {
    $calBookingList[] = $cb;
}

// Check if item is in user's favorites
$favQuery = "SELECT favorite_id FROM favorites WHERE id = ? AND item_id = ?";
$favStmt = $conn->prepare($favQuery);
$favStmt->bind_param("ii", $user_id, $item_id);
$favStmt->execute();
$isFavorited = $favStmt->get_result()->num_rows > 0;

// Check if item is in user's cart
$cartQuery = "SELECT id FROM cart WHERE user_id = ? AND item_id = ?";
$cartStmt = $conn->prepare($cartQuery);
$cartStmt->bind_param("ii", $user_id, $item_id);
$cartStmt->execute();
$isInCart = $cartStmt->get_result()->num_rows > 0;

// Image path
$imagePath = !empty($item['image']) 
    ? '../../assets/images/items/' . htmlspecialchars($item['image']) 
    : '../../assets/images/catalog-fallback.svg';

// Status class
$statusClass = strtolower(str_replace(' ', '-', $item['status'] ?? 'available'));
$statusLabel = htmlspecialchars($item['status'] ?? 'Available');

// Parse tags
$tags = [];
if (!empty($item['tags'])) {
    $tags = array_map('trim', explode(',', $item['tags']));
}

// JSON API support
if (isset($_GET['format']) && $_GET['format'] === 'json') {
    header('Content-Type: application/json');
    
    // Merge rental and calendar bookings
    $allBookings = array_merge($rentalBookingList, $calBookingList);
    
    $response = [
        'success' => true,
        'item' => $item,
        'reviews' => $reviewList,
        'bookings' => $allBookings,
        'isFavorited' => $isFavorited,
        'isInCart' => $isInCart,
        'avgRating' => $avgRating,
        'reviewCount' => $reviewCount
    ];
    
    echo json_encode($response);
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt - <?php echo htmlspecialchars($item['item_name']); ?>">
    <title>RentIt - <?php echo htmlspecialchars($item['item_name']); ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../../shared/css/theme.css">
    <link rel="stylesheet" href="../../shared/css/globals.css">
    <link rel="stylesheet" href="../../client/dashboard/dashboard.css">
    <link rel="stylesheet" href="itemdescription.css">
    
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
                </div>
                <div class="page-skeleton-loader">
                    <span class="page-skeleton-spinner" aria-hidden="true"></span>
                    <span>Loading content...</span>
                </div>
            </section>
        </div>
    </div>
    <div class="app-container">
        <div id="sidebarContainer"></div>
        
        <main class="main-content">
            <div id="topbarContainer"></div>
            
            <div class="content-area fade-in-up" id="contentArea">
                <!-- Breadcrumb -->
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <a href="catalog.php">Catalog</a>
                    <span class="separator">/</span>
                    <span class="current"><?php echo htmlspecialchars($item['item_name']); ?></span>
                </nav>

                <!-- Product Detail Layout -->
                <div class="product-detail-layout">
                    <!-- Left Column - Image -->
                    <div class="product-gallery">
                        <div class="main-image-wrap">
                            <a class="main-image-link" href="<?php echo $imagePath; ?>" target="_blank" rel="noopener" title="Open image in new tab">
                                <img src="<?php echo $imagePath; ?>" 
                                     alt="<?php echo htmlspecialchars($item['item_name']); ?>" 
                                     class="main-image" id="mainImage"
                                     onerror="this.onerror=null; this.src='../../assets/images/catalog-fallback.svg';">
                            </a>
                            <span class="product-status <?php echo $statusClass; ?>"><?php echo $statusLabel; ?></span>
                        </div>
                    </div>

                    <!-- Right Column - Product Info -->
                    <div class="product-info">
                        <div class="product-header">
                            <?php if (!empty($item['category'])): ?>
                                <span class="product-category"><?php echo htmlspecialchars($item['category']); ?></span>
                            <?php endif; ?>
                            <h1 class="product-title"><?php echo htmlspecialchars($item['item_name']); ?></h1>
                            <div class="product-rating">
                                <div class="rating-stars">
                                    <?php 
                                    $fullStars = floor($avgRating);
                                    $hasHalf = ($avgRating - $fullStars) >= 0.5;
                                    for ($i = 1; $i <= 5; $i++):
                                        if ($i <= $fullStars): ?>
                                            <svg viewBox="0 0 24 24" class="star filled"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        <?php elseif ($i == $fullStars + 1 && $hasHalf): ?>
                                            <svg viewBox="0 0 24 24" class="star half"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        <?php else: ?>
                                            <svg viewBox="0 0 24 24" class="star empty"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        <?php endif; endfor; ?>
                                </div>
                                <span class="rating-score"><?php echo $avgRating; ?></span>
                                <span class="rating-count">(<?php echo $reviewCount; ?> review<?php echo $reviewCount !== 1 ? 's' : ''; ?>)</span>
                            </div>
                        </div>

                        <div class="product-price-section">
                            <div class="price-display">
                                <span class="price-amount">₱<?php echo number_format($item['price_per_day'], 2); ?></span>
                                <span class="price-period">/ day</span>
                            </div>
                            <?php if (!empty($item['deposit']) && $item['deposit'] > 0): ?>
                                <p class="price-note">Security deposit: ₱<?php echo number_format($item['deposit'], 2); ?></p>
                            <?php else: ?>
                                <p class="price-note">Minimum 1 day rental. Delivery fee not included.</p>
                            <?php endif; ?>
                        </div>

                        <!-- Description -->
                        <div class="product-description">
                            <h3>Description</h3>
                            <p><?php echo !empty($item['description']) && $item['description'] !== 'NULL' 
                                    ? htmlspecialchars($item['description']) 
                                    : 'No description available for this item.'; ?></p>
                        </div>

                        <!-- Item Details -->
                        <div class="product-features">
                            <h3>Details</h3>
                            <ul class="features-list">
                                <?php if (!empty($item['condition'])): ?>
                                <li>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Condition: <?php echo htmlspecialchars(ucfirst($item['condition'])); ?>
                                </li>
                                <?php endif; ?>
                                <li>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Category: <?php echo htmlspecialchars($item['category'] ?? 'N/A'); ?>
                                </li>
                                <li>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Total units: <?php echo intval($item['total_units']); ?>
                                </li>
                                <li>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Available units: <?php echo intval($item['available_units']); ?>
                                </li>
                                <li>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Repairing units: <?php echo intval($item['repairing_units'] ?? 0); ?>
                                </li>
                                <li>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Times rented: <?php echo intval($item['total_times_rented']); ?>
                                </li>
                            </ul>
                        </div>

                        <!-- Tags -->
                        <?php if (!empty($tags)): ?>
                        <div class="product-tags-section">
                            <h3>Tags</h3>
                            <div class="product-tags-list">
                                <?php foreach ($tags as $tag): ?>
                                    <span class="product-tag"><?php echo htmlspecialchars($tag); ?></span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <?php endif; ?>

                        <!-- Quantity Selector -->
                        <div class="quantity-selector-section" style="margin-bottom: 1.5rem;">
                            <label for="quantityInput" style="display: block; font-size: 0.95rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">
                                Quantity
                            </label>
                            <div class="quantity-controls" style="display: flex; align-items: center; gap: 1rem;">
                                <button type="button" class="quantity-btn" id="decreaseQty" style="width: 40px; height: 40px; border: 2px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 600; color: #6b7280; transition: all 0.2s;">-</button>
                                <input type="number" id="quantityInput" value="1" min="1" max="<?php echo max(1, intval($item['available_units'])); ?>" readonly style="width: 80px; height: 40px; border: 2px solid #d1d5db; border-radius: 8px; text-align: center; font-size: 1rem; font-weight: 600; background: #f9fafb;" />
                                <button type="button" class="quantity-btn" id="increaseQty" style="width: 40px; height: 40px; border: 2px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 600; color: #6b7280; transition: all 0.2s;">+</button>
                                <span style="font-size: 0.875rem; color: #6b7280; margin-left: 0.5rem;">
                                    (<?php echo intval($item['available_units']); ?> available)
                                </span>
                            </div>
                            <?php if (intval($item['available_units']) < 1): ?>
                                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #ef4444;">Currently out of stock</p>
                            <?php endif; ?>
                        </div>

                        <!-- Action Bar -->
                        <div class="action-bar">
                            <button class="btn-add-cart <?php echo $isInCart ? 'in-cart' : ''; ?>" id="btnAddToCart" data-item-id="<?php echo $item_id; ?>">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <?php if ($isInCart): ?>
                                        <polyline points="20 6 9 17 4 12"/>
                                    <?php else: ?>
                                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                    <?php endif; ?>
                                </svg>
                                <?php echo $isInCart ? 'Already in Cart' : 'Add to Cart'; ?>
                            </button>
                            <button class="btn-add-favorite <?php echo $isFavorited ? 'active' : ''; ?>" id="btnAddFavorite" data-item-id="<?php echo $item_id; ?>" title="<?php echo $isFavorited ? 'Remove from favorites' : 'Add to favorites'; ?>">
                                <svg viewBox="0 0 24 24" fill="<?php echo $isFavorited ? 'currentColor' : 'none'; ?>" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                            <button class="btn-share" id="btnShare" title="Share this product">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Bookings Section -->
                <section class="future-bookings-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Upcoming Bookings
                        </h2>
                    </div>
                    
                    <div class="future-bookings-list" id="futureBookingsList">
                        <?php 
                        $allBookings = array_merge($rentalBookingList, $calBookingList);
                        if (!empty($allBookings)): ?>
                            <?php foreach ($rentalBookingList as $bk): 
                                $start = new DateTime($bk['start_date']);
                                $end = new DateTime($bk['end_date']);
                                $days = max(1, $start->diff($end)->days + 1);
                            ?>
                            <div class="booking-item">
                                <div class="booking-dates">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span><?php echo $start->format('M j') . ' - ' . $end->format('M j, Y'); ?></span>
                                </div>
                                <span class="booking-status-badge"><?php echo htmlspecialchars($bk['rental_status']); ?></span>
                                <span class="booking-days"><?php echo $days; ?> day<?php echo $days > 1 ? 's' : ''; ?></span>
                            </div>
                            <?php endforeach; ?>
                            <?php foreach ($calBookingList as $bk): 
                                $start = new DateTime($bk['booked_date_from']);
                                $end = new DateTime($bk['booked_date_to']);
                                $days = max(1, $start->diff($end)->days + 1);
                            ?>
                            <div class="booking-item">
                                <div class="booking-dates">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span><?php echo $start->format('M j') . ' - ' . $end->format('M j, Y'); ?></span>
                                </div>
                                <span class="booking-days"><?php echo $days; ?> day<?php echo $days > 1 ? 's' : ''; ?></span>
                            </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="booking-empty">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="color: var(--text-muted);">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <p>No upcoming bookings. This item is available!</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </section>

                <!-- Reviews Section -->
                <section class="reviews-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Customer Reviews
                        </h2>
                    </div>

                    <?php if ($reviewCount > 0): ?>
                    <!-- Rating Summary -->
                    <div class="rating-summary">
                        <div class="rating-overview">
                            <div class="rating-big">
                                <span class="rating-number"><?php echo $avgRating; ?></span>
                                <div class="rating-stars-big">
                                    <?php for ($i = 1; $i <= 5; $i++):
                                        if ($i <= floor($avgRating)): ?>
                                            <svg viewBox="0 0 24 24" class="star filled"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        <?php elseif ($i == floor($avgRating) + 1 && ($avgRating - floor($avgRating)) >= 0.5): ?>
                                            <svg viewBox="0 0 24 24" class="star half"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        <?php else: ?>
                                            <svg viewBox="0 0 24 24" class="star empty"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        <?php endif; endfor; ?>
                                </div>
                                <span class="rating-total">Based on <?php echo $reviewCount; ?> review<?php echo $reviewCount !== 1 ? 's' : ''; ?></span>
                            </div>
                        </div>
                        <div class="rating-bars">
                            <?php for ($star = 5; $star >= 1; $star--): 
                                $count = $ratingDistribution[$star];
                                $pct = $reviewCount > 0 ? round(($count / $reviewCount) * 100) : 0;
                            ?>
                            <div class="rating-bar-row">
                                <span><?php echo $star; ?> star<?php echo $star > 1 ? 's' : ''; ?></span>
                                <div class="rating-bar"><div class="rating-fill" style="width: <?php echo $pct; ?>%"></div></div>
                                <span><?php echo $count; ?></span>
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Reviews List -->
                    <div class="reviews-list" id="reviewsList">
                        <?php if ($reviewCount > 0): ?>
                            <?php foreach ($reviewList as $rev): 
                                $reviewerName = $rev['full_name'] ?? 'Anonymous';
                                $nameParts = explode(' ', $reviewerName);
                                $initials = '';
                                foreach ($nameParts as $part) {
                                    $initials .= strtoupper(substr($part, 0, 1));
                                }
                                $initials = substr($initials, 0, 2);
                                $reviewDate = !empty($rev['review_date']) ? date('F j, Y', strtotime($rev['review_date'])) : '';
                            ?>
                            <article class="review-card">
                                <div class="review-header">
                                    <div class="reviewer-info">
                                        <div class="reviewer-avatar"><?php echo $initials; ?></div>
                                        <div class="reviewer-details">
                                            <span class="reviewer-name"><?php echo htmlspecialchars($reviewerName); ?></span>
                                            <?php if ($reviewDate): ?>
                                                <span class="review-date"><?php echo $reviewDate; ?></span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div class="review-rating">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <svg viewBox="0 0 24 24" class="star <?php echo $i <= $rev['rating'] ? 'filled' : 'empty'; ?>">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                        <?php endfor; ?>
                                    </div>
                                </div>
                                <?php if (!empty($rev['feedback'])): ?>
                                    <p class="review-text"><?php echo htmlspecialchars($rev['feedback']); ?></p>
                                <?php endif; ?>
                                <div class="review-footer">
                                    <span class="verified-badge">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        Verified Rental
                                    </span>
                                </div>
                            </article>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="reviews-empty-state">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="color: var(--text-tertiary); opacity: 0.5;">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <p>No reviews yet. Be the first to share your experience!</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </section>
            </div>

            <div id="footerContainer"></div>
        </main>
    </div>
    
    <script src="../../shared/js/components.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // Inject shared components
        Components.injectSidebar('sidebarContainer', 'catalog', 'client');
        Components.injectTopbar('topbarContainer', 'Product Details');
        Components.injectFooter('footerContainer');

        const itemId = <?php echo $item_id; ?>;
        const itemName = <?php echo json_encode($item['item_name']); ?>;
        const maxAvailable = <?php echo max(1, intval($item['available_units'])); ?>;

        // Quantity Controls
        const quantityInput = document.getElementById('quantityInput');
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', function() {
                let currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', function() {
                let currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue < maxAvailable) {
                    quantityInput.value = currentValue + 1;
                }
            });
        }

        // Add to Cart
        const btnAddToCart = document.getElementById('btnAddToCart');
        if (btnAddToCart) {
            btnAddToCart.addEventListener('click', function() {
                if (this.classList.contains('in-cart')) {
                    showToast('Item is already in your cart', 'info');
                    return;
                }
                
                const quantity = parseInt(quantityInput.value) || 1;
                
                fetch('/rent-it/client/cart/add_to_cart.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'item_id=' + itemId + '&quantity=' + quantity
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        this.classList.add('in-cart');
                        this.innerHTML = `
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Added to Cart
                        `;
                        showToast(itemName + ' (x' + quantity + ') added to cart!', 'success');
                    } else {
                        showToast(data.message || 'Could not add to cart', 'error');
                    }
                })
                .catch(err => {
                    console.error('Cart error:', err);
                    showToast('Something went wrong', 'error');
                });
            });
        }

        // Toggle Favorite
        const btnFavorite = document.getElementById('btnAddFavorite');
        if (btnFavorite) {
            btnFavorite.addEventListener('click', function() {
                const isActive = this.classList.contains('active');
                const action = isActive ? 'remove' : 'add';

                fetch('/rent-it/client/catalog/add_favorite.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'item_id=' + itemId + '&action=' + action
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        this.classList.toggle('active');
                        const nowActive = this.classList.contains('active');
                        this.querySelector('svg').setAttribute('fill', nowActive ? 'currentColor' : 'none');
                        showToast(nowActive 
                            ? itemName + ' added to favorites' 
                            : itemName + ' removed from favorites', 'success');
                    }
                })
                .catch(err => console.error('Favorite error:', err));
            });
        }

        // Share
        const btnShare = document.getElementById('btnShare');
        if (btnShare) {
            btnShare.addEventListener('click', function() {
                const url = window.location.href;
                if (navigator.share) {
                    navigator.share({ title: 'RentIt - ' + itemName, url: url }).catch(() => {});
                } else {
                    navigator.clipboard.writeText(url).then(() => {
                        showToast('Link copied to clipboard!', 'success');
                    }).catch(() => showToast('Failed to copy link', 'error'));
                }
            });
        }
    });

    function showToast(message, type) {
        type = type || 'info';
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification toast-' + type;
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:14px 24px;' +
            'background:' + (type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6') + ';' +
            'color:white;border-radius:8px;font-size:14px;font-weight:500;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:99999;opacity:1;transition:opacity .3s ease;';
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }
    </script>
</body>
</html>
