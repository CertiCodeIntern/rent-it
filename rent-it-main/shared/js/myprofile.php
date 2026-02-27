<?php
session_start();
include '../php/db_connection.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: /rent-it/client/auth/login.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$query = "SELECT full_name, email, phone, profile_picture, address, created_at FROM users WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

$member_since = $user['created_at'] ? date('F Y', strtotime($user['created_at'])) : 'N/A';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RentIt - My Profile</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="../css/theme.css">
    <link rel="stylesheet" href="../css/globals.css">
    <link rel="stylesheet" href="/rent-it/client/dashboard/dashboard.css">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">

    <style>
        /* ===== PROFILE PAGE STYLES ===== */
        .profile-grid {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 24px;
        }

        /* --- Profile Sidebar Card --- */
        .profile-sidebar-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg, 16px);
            padding: 32px 24px;
            text-align: center;
            height: fit-content;
            position: sticky;
            top: 24px;
        }

        .profile-avatar-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 16px;
        }

        .profile-avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--accent, #4f46e5);
            background: var(--bg-primary);
        }

        .profile-avatar-upload {
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: var(--accent, #4f46e5);
            color: #fff;
            border: 3px solid var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
            font-size: 14px;
        }

        .profile-avatar-upload:hover {
            transform: scale(1.1);
            background: var(--accent-hover, #4338ca);
        }

        .profile-sidebar-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--heading-primary);
            margin-bottom: 4px;
        }

        .profile-sidebar-role {
            font-size: 0.8rem;
            font-weight: 500;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 20px;
        }

        .profile-sidebar-meta {
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .profile-meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .profile-meta-item svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            opacity: 0.6;
        }

        .profile-meta-item span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* --- Main Form Card --- */
        .profile-form-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg, 16px);
            padding: 32px;
        }

        .profile-form-header {
            margin-bottom: 28px;
        }

        .profile-form-header h2 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--heading-primary);
            margin: 0 0 4px;
        }

        .profile-form-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .profile-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .profile-form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .profile-form-group.full-width {
            grid-column: 1 / -1;
        }

        .profile-form-group label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .profile-form-group input,
        .profile-form-group textarea {
            padding: 10px 14px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius, 10px);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 0.95rem;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .profile-form-group input:focus,
        .profile-form-group textarea:focus {
            outline: none;
            border-color: var(--accent, #4f46e5);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }

        .profile-form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .profile-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
        }

        .btn-profile-cancel {
            padding: 10px 24px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius, 10px);
            background: transparent;
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-profile-cancel:hover {
            background: var(--bg-primary);
            color: var(--text-primary);
        }

        .btn-profile-save {
            padding: 10px 28px;
            border: none;
            border-radius: var(--radius, 10px);
            background: var(--accent, #4f46e5);
            color: #fff;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-profile-save:hover {
            background: var(--accent-hover, #4338ca);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-profile-save:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* --- Security Section --- */
        .profile-security-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg, 16px);
            padding: 32px;
            margin-top: 24px;
        }

        .profile-security-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--heading-primary);
            margin: 0 0 4px;
        }

        .profile-security-card > p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0 0 24px;
        }

        .security-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid var(--border-color);
        }

        .security-item:last-child {
            border-bottom: none;
        }

        .security-info h4 {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 2px;
        }

        .security-info p {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .btn-security {
            padding: 8px 18px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius, 10px);
            background: transparent;
            color: var(--text-primary);
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .btn-security:hover {
            background: var(--bg-primary);
            border-color: var(--accent, #4f46e5);
            color: var(--accent, #4f46e5);
        }

        /* --- Responsive --- */
        @media (max-width: 900px) {
            .profile-grid {
                grid-template-columns: 1fr;
            }

            .profile-sidebar-card {
                position: static;
            }
        }

        @media (max-width: 600px) {
            .profile-form-grid {
                grid-template-columns: 1fr;
            }

            .profile-form-card,
            .profile-security-card {
                padding: 20px;
            }

            .profile-form-actions {
                flex-direction: column;
            }

            .btn-profile-cancel,
            .btn-profile-save {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
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
                        <h1 class="page-title">My Profile</h1>
                        <p class="page-subtitle">Manage your personal information and account settings</p>
                    </div>
                    <div class="page-header-actions">
                        <a href="/rent-it/client/dashboard/dashboard.php" class="btn-new">← Back to Dashboard</a>
                    </div>
                </div>

                <!-- Profile Layout -->
                <div class="profile-grid">
                    <!-- Left: Profile Sidebar -->
                    <div class="profile-sidebar-card">
                        <div class="profile-avatar-wrapper">
                            <?php 
                                $profilePic = !empty($user['profile_picture']) 
                                    ? '/rent-it/assets/profile/' . $user['profile_picture'] 
                                    : '/rent-it/assets/images/default-avatar.png';
                            ?>
                            <img src="<?php echo $profilePic; ?>" id="imgPreview" class="profile-avatar-img" alt="Profile Photo">
                            <label for="profile_pic" class="profile-avatar-upload" title="Change Photo">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                            </label>
                        </div>
                        <div class="profile-sidebar-name"><?php echo htmlspecialchars($user['full_name'] ?? 'User'); ?></div>
                        <div class="profile-sidebar-role">Customer</div>

                        <div class="profile-sidebar-meta">
                            <div class="profile-meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                <span><?php echo htmlspecialchars($user['email'] ?? 'Not set'); ?></span>
                            </div>
                            <div class="profile-meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                <span><?php echo htmlspecialchars($user['phone'] ?? 'Not set'); ?></span>
                            </div>
                            <div class="profile-meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <span>Member since <?php echo $member_since; ?></span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Form Section -->
                    <div>
                        <div class="profile-form-card">
                            <div class="profile-form-header">
                                <h2>Personal Information</h2>
                                <p>Update your personal details below</p>
                            </div>

                            <form id="profileForm">
                                <input type="file" id="profile_pic" name="profile_pic" style="display:none;" accept="image/*">

                                <div class="profile-form-grid">
                                    <div class="profile-form-group">
                                        <label for="fullName">Full Name</label>
                                        <input type="text" id="fullName" name="full_name" value="<?php echo htmlspecialchars($user['full_name'] ?? ''); ?>" required>
                                    </div>
                                    <div class="profile-form-group">
                                        <label for="email">Email Address</label>
                                        <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email'] ?? ''); ?>" required>
                                    </div>
                                    <div class="profile-form-group">
                                        <label for="phone">Phone Number</label>
                                        <input type="text" id="phone" name="phone" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>" placeholder="e.g. 09171234567">
                                    </div>
                                </div>

                                <div class="profile-form-actions">
                                    <button type="button" class="btn-profile-cancel" onclick="location.reload()">Cancel</button>
                                    <button type="submit" class="btn-profile-save" id="saveBtn">Save Changes</button>
                                </div>
                            </form>
                        </div>

                        <!-- Security Section -->
                        <div class="profile-security-card">
                            <h2>Security</h2>
                            <p>Manage your account security settings</p>

                            <div class="security-item">
                                <div class="security-info">
                                    <h4>Password</h4>
                                    <p>Change your account password</p>
                                </div>
                                <button class="btn-security" onclick="Swal.fire('Info', 'Password change feature coming soon.', 'info')">Change Password</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="../js/components.js"></script>

    <script>
        // Initialize sidebar, topbar, footer
        Components.injectSidebar('sidebarContainer', 'profile', 'client');
        Components.injectTopbar('topbarContainer', 'My Profile');
        Components.injectFooter();

        // Image preview
        document.getElementById('profile_pic').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    Swal.fire('Error', 'Please select an image file.', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imgPreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Form submission
        document.getElementById('profileForm').onsubmit = async function(e) {
            e.preventDefault();
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.innerText;

            saveBtn.innerText = "Saving...";
            saveBtn.disabled = true;

            const formData = new FormData(this);
            // Append the file input manually if a file is selected
            const fileInput = document.getElementById('profile_pic');
            if (fileInput.files[0]) {
                formData.append('profile_pic', fileInput.files[0]);
            }

            try {
                const res = await fetch('../php/update_profile.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (data.success) {
                    // Update localStorage
                    let user = JSON.parse(localStorage.getItem('user') || '{}');
                    user.full_name = formData.get('full_name');
                    user.email = formData.get('email');
                    user.phone = formData.get('phone');
                    if (data.profile_picture) {
                        user.profile_picture = data.profile_picture;
                    }
                    localStorage.setItem('user', JSON.stringify(user));

                    Swal.fire({
                        title: 'Success!',
                        text: 'Your profile has been updated.',
                        icon: 'success',
                        confirmButtonColor: '#4f46e5'
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire('Error', data.message || 'Update failed.', 'error');
                }
            } catch (err) {
                console.error('Fetch Error:', err);
                Swal.fire('Error', 'Connection error. Please try again.', 'error');
            } finally {
                saveBtn.innerText = originalText;
                saveBtn.disabled = false;
            }
        };
    </script>
</body>
</html>