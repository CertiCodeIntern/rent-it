<?php
session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';

$user_id = $_SESSION['user_id'];

// SQL Query: Gamitin ang 'f.id' base sa structure mo
$query = "SELECT f.favorite_id, i.item_id, i.item_name, i.price_per_day, i.image, i.status 
          FROM favorites f 
          JOIN item i ON f.item_id = i.item_id 
          WHERE f.id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$favoritesCount = $result->num_rows;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RentIt - My Favorites</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    
    <link rel="stylesheet" href="/rent-it/shared/css/theme.css">
    <link rel="stylesheet" href="/rent-it/shared/css/globals.css">
    <link rel="stylesheet" href="/rent-it/client/dashboard/dashboard.css">
    <link rel="stylesheet" href="favorites.css">
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
        <div id="sidebarContainer"></div>
        <main class="main-content">
            <div id="topbarContainer"></div>
            
            <div class="content-area fade-in-up favorites-page" id="contentArea">
                <div class="page-header-dashboard">
                    <div class="page-header-info">
                        <h1 class="page-title">Machines you've saved for later.</h1>
                        <?php if(!$user_id): ?>
                            <p style="color: red;">Warning: Please login to see your favorites.</p>
                        <?php endif; ?>
                    </div>
                    <div class="page-header-actions">
                        <span class="favorites-count">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span id="favoritesCount"><?php echo $favoritesCount; ?></span> items saved
                        </span>
                    </div>
                </div> 
                <section class="favorites-section">
                    <div class="favorites-grid <?php echo ($favoritesCount == 0) ? 'is-hidden' : ''; ?>" id="favoritesGrid">
                        <?php if($result && $favoritesCount > 0): ?>
                            <?php while($row = $result->fetch_assoc()): ?>
                                <article class="favorite-card" data-id="<?php echo $row['item_id']; ?>">
                                    <div class="favorite-image-wrap">
                                        <img src="../../assets/images/items/<?php echo htmlspecialchars($row['image']); ?>" 
                                             alt="<?php echo htmlspecialchars($row['item_name']); ?>" 
                                             class="favorite-image"
                                             onerror="this.onerror=null;this.src='/rent-it/assets/images/catalog-fallback.svg';">
                                        
                                        <?php if(!empty($row['status'])): ?>
                                        <span class="favorite-badge <?php echo strtolower($row['status']); ?>">
                                            <?php echo htmlspecialchars($row['status']); ?>
                                        </span>
                                        <?php endif; ?>
                                        
                                        <button class="btn-remove-favorite" onclick="removeFavorite(<?php echo $row['item_id']; ?>)" title="Remove from favorites">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div class="favorite-content">
                                        <h3 class="favorite-name"><?php echo htmlspecialchars($row['item_name']); ?></h3>
                                        <div class="favorite-price">₱<?php echo number_format($row['price_per_day'], 2); ?> <span>/ day</span></div>
                                        
                                        <div class="favorite-actions">
                                            <button class="btn-move-to-cart" onclick="moveToCart(<?php echo $row['item_id']; ?>, <?php echo $row['favorite_id']; ?>)">
                                                Move to Cart
                                            </button>
                                            <a href="../catalog/itemdescription.php?id=<?php echo $row['item_id']; ?>" class="btn-view-details">View Details</a>
                                        </div>
                                    </div>
                                </article>
                            <?php endwhile; ?>
                        <?php endif; ?>
                    </div>
                </section>
                <!-- Favorites Pagination -->
                <nav class="pagination-controls is-hidden" id="favoritesPagination" aria-label="Favorites pagination"></nav>
                <div class="empty-favorites <?php echo ($favoritesCount > 0) ? 'is-hidden' : ''; ?>" id="emptyFavorites">
                    <div class="empty-icon">💔</div>
                    <h2 class="empty-title">No Favorites Yet</h2>
                    <a href="../catalog/catalog.php" class="btn-browse-catalog">Browse Catalog</a>
                </div>
            </div>
            <div id="footerContainer"></div>
        </main>
    </div>
    
    <script src="../../shared/js/components.js"></script>
    <script src="../../shared/js/pagination.js"></script>
    <script src="favorites.js"></script> 
</body>
</html>