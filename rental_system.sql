-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 12, 2026 at 06:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rental_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_accounts`
--

CREATE TABLE `admin_accounts` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT 'Admin',
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_accounts`
--

INSERT INTO `admin_accounts` (`admin_id`, `username`, `password`, `full_name`, `email`, `created_at`, `updated_at`) VALUES
(1, 'admin1', '$2y$10$Z3pWQIF/TSA4Hj5GvGuVeuyEYGhos4uEUKT7zgOKQKcKxJlWtRj1y', 'Admin User', 'admin@certicode.com', '2026-02-11 06:23:42', '2026-02-11 06:34:38');

-- --------------------------------------------------------

--
-- Table structure for table `calendar`
--

CREATE TABLE `calendar` (
  `calendar_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `booked_date_from` date DEFAULT NULL,
  `booked_date_to` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `driver`
--

CREATE TABLE `driver` (
  `driver_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `status` enum('available','on_delivery','off_duty') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `favorite_id` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`favorite_id`, `id`, `item_id`, `added_at`) VALUES
(1, 8, 1, '2026-02-09 01:02:58');

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `item_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT NULL,
  `reviews` int(11) DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `deposit` decimal(10,2) DEFAULT NULL,
  `condition` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Available',
  `maintenance_notes` text DEFAULT NULL,
  `total_times_rented` int(11) DEFAULT 0,
  `total_units` int(11) NOT NULL DEFAULT 1,
  `available_units` int(11) NOT NULL DEFAULT 1,
  `repairing_units` int(11) NOT NULL DEFAULT 0,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `tags` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`item_id`, `item_name`, `description`, `category`, `image`, `rating`, `reviews`, `price_per_day`, `deposit`, `condition`, `status`, `maintenance_notes`, `total_times_rented`, `total_units`, `available_units`, `is_visible`, `is_featured`, `tags`) VALUES
(1, 'Karaoke King Pro v2', 'Professional dual-mic setup with 10k+ songs and built-in studio effects.', 'premium', 'Karaoke-King.png', 4.5, 24, 120.00, NULL, NULL, 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(2, 'EchoStream Portable', 'Battery powered, Bluetooth ready. Perfect for small gatherings and picnics.', 'portable', 'EchoStream.png', 5.0, 18, 65.00, NULL, NULL, 'Booked', NULL, 0, 1, 0, 1, 0, NULL),
(3, 'VocalStar 5000 Stage', 'Event-grade system with 4 microphones and integrated subwoofer.', 'professional', 'VStar.jpg', 4.2, 31, 250.00, NULL, NULL, 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(4, 'HomeParty Ultra', 'Best seller. Features YouTube integration and scoring system.', 'premium', 'HomeParty.jpg', 4.8, 56, 120.00, NULL, NULL, 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(5, 'MiniSing Pocket', 'Ultra-portable. Fits in a backpack. Surprise your friends anywhere!', 'portable', 'MiniSing.jpg', 3.5, 12, 120.00, NULL, NULL, 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(6, 'Pro-Ject Rockbox', 'Heavy duty casing with high-fidelity sound output for outdoor events.', 'professional', 'Karaoke-King.png', 4.7, 15, 180.00, NULL, NULL, 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(7, 'Longganisa Maker', 'qweqwe', 'portable', 'item_1770294426_69848c9ac4c86.jpg', NULL, 0, 100.00, 80.00, 'good', 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(8, 'macmac test', 'lakas neto', 'portable', 'item_1770355768_69857c38382e9.jpg', NULL, 0, 300.00, 50.00, 'excellent', 'Available', NULL, 0, 1, 1, 1, 0, NULL),
(9, 'macmac pogi', 'pogi ako', 'professional', 'item_1770355915_69857ccb89fb5.png', NULL, 0, 500.00, 50.00, 'good', 'Repairing', NULL, 0, 1, 1, 1, 1, 'malakas'),
(10, 'leander gwapings', 'gwapo magcode', 'premium', 'item_1770363559_69859aa7d4266.png', NULL, 0, 250.00, 50.00, 'good', 'Available', NULL, 0, 1, 1, 1, 1, 'gwapings');

-- --------------------------------------------------------

--
-- Table structure for table `penalty_tracker`
--

CREATE TABLE `penalty_tracker` (
  `penalty_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `penalty_type` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `penalty_status` varchar(50) DEFAULT NULL,
  `issued_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental`
--

CREATE TABLE `rental` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rental_status` varchar(50) DEFAULT NULL,
  `return_reason` text DEFAULT NULL,
  `extension_days` int(11) DEFAULT 0,
  `total_price` decimal(10,2) DEFAULT NULL,
  `late_fee` decimal(10,2) DEFAULT 0.00,
  `venue` varchar(255) DEFAULT NULL,
  `customer_address` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rental`
--

INSERT INTO `rental` (`order_id`, `user_id`, `rental_status`, `return_reason`, `extension_days`, `total_price`, `late_fee`, `venue`, `customer_address`, `start_date`, `end_date`, `driver_id`) VALUES
(1, NULL, NULL, NULL, 0, NULL, 0.00, NULL, NULL, NULL, NULL, NULL),
(2, 8, 'Completed', 'asd', 0, 320.00, 0.00, 'Home Delivery', NULL, '2026-02-09', '2026-02-10', NULL),
(3, 8, 'Pending Return', NULL, 0, 1270.00, 0.00, 'Home Delivery', NULL, '2026-02-09', '2026-02-10', NULL),
(4, 8, 'Pending Return', NULL, 0, 700.00, 0.00, 'Home Delivery', NULL, '2026-02-09', '2026-02-10', NULL),
(5, 8, 'Returned', 'asd', 0, 450.00, 0.00, 'Home Delivery', NULL, '2026-02-09', '2026-02-10', NULL),
(6, 8, 'Active', NULL, 0, 500.00, 0.00, 'Home Delivery', NULL, '2026-02-09', '2026-02-10', NULL),
(7, 8, 'Late', NULL, 0, 300.00, 0.00, 'Home Delivery', NULL, '2026-02-09', '2026-02-10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rental_item`
--

CREATE TABLE `rental_item` (
  `rental_item_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `item_price` decimal(10,2) DEFAULT NULL,
  `item_status` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rental_item`
--

INSERT INTO `rental_item` (`rental_item_id`, `order_id`, `item_id`, `item_price`, `item_status`) VALUES
(1, 2, 1, 120.00, 'Returned'),
(2, 3, 1, 120.00, 'Reserved'),
(3, 3, 8, 300.00, 'Reserved'),
(4, 3, 9, 500.00, 'Reserved'),
(5, 4, 9, 500.00, 'Reserved'),
(6, 5, 10, 250.00, 'Rented'),
(7, 6, 8, 300.00, 'Rented'),
(8, 7, 7, 100.00, 'Late');




CREATE TABLE notifications (
    id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) DEFAULT NULL,
    title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'info',
    link_url VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



-- --------------------------------------------------------

--
-- Table structure for table `repair`
--

CREATE TABLE `repair` (
  `repair_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `issue_type` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` varchar(50) DEFAULT 'in-progress',
  `created_date` date DEFAULT NULL,
  `eta_date` date DEFAULT NULL,
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `repair`
--

INSERT INTO `repair` (`repair_id`, `item_id`, `issue_type`, `priority`, `status`, `created_date`, `eta_date`, `estimated_cost`, `notes`) VALUES
(4, 9, 'Autodisassemble', 'medium', 'completed', '2026-02-09', '2026-02-20', 6000.00, '');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `review_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `feedback` text DEFAULT NULL,
  `review_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` longblob DEFAULT NULL,
  `id_front` longblob DEFAULT NULL,
  `id_back` longblob DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expiry` datetime DEFAULT NULL,
  `membership_level` varchar(20) DEFAULT 'Bronze'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password`, `profile_picture`, `id_front`, `id_back`, `address`, `role`, `created_at`, `updated_at`, `reset_token`, `reset_expiry`, `membership_level`) VALUES
(1, 'Admin User', 'admin@certicode.com', '+639123456789', '$2y$10$N9qo8uLOickgx2ZMRZoMye7b6Zx7Z9z8C7qZ8J5QYb3zNQrNcXvHy', NULL, NULL, NULL, NULL, 'admin', '2026-01-29 05:24:26', '2026-01-29 05:24:26', NULL, NULL, 'Bronze'),
(2, 'shiro yashi', 'lpochea@bpsu.edu.ph', '+631231312312', '$2y$10$TxyCAtsPjqxO4mZUtFuTROIJ0RrZfNzmWFJJ61gH0g0ethuyjEUKy', NULL, NULL, NULL, NULL, 'customer', '2026-01-29 05:24:44', '2026-01-29 05:24:44', NULL, NULL, 'Bronze'),
(3, 'Via Umali', 'viaumali24@gmail.com', '09925228671', '$2y$10$DFt9IEwtSwxTAzntdGOu2u4qtZZKS53k0gA59BgZKNPh3gr9XhjPK', NULL, NULL, NULL, NULL, 'customer', '2026-01-29 17:30:40', '2026-02-02 18:29:34', NULL, NULL, 'Gold'),
(4, 'Via', 'viavinusumali@gmail.com', '09746873322', '$2y$10$ZkMHx7N1X0ThH/yGvjdqKO6dAZAEKyTxS8ggAauO750ik1qGJQxpi', NULL, NULL, NULL, NULL, 'customer', '2026-01-29 19:16:37', '2026-01-29 19:16:37', NULL, NULL, 'Bronze'),
(5, 'try try', 'via@gmail.com', '09124567890', '$2y$10$Lx42t0tANSNowiJw2lk0cORb8BpuRfR1LRWNMovb5M1JzXYb0BHHy', NULL, NULL, NULL, NULL, 'customer', '2026-01-29 19:20:15', '2026-01-29 19:20:15', NULL, NULL, 'Bronze'),
(6, 'via', 'viaa@gmail.com', '09124466897', '$2y$10$Fx8uDn7O52YpdLr5Zhq3F.i7gxoiti.LWSqOBvRxRXXF0Qd6xo1LW', NULL, NULL, NULL, NULL, 'customer', '2026-01-29 19:21:01', '2026-01-29 19:21:01', NULL, NULL, 'Bronze'),
(7, 'lean', 'qwerty@gmail.com', '+63 032 216 1665', '$2y$10$Dwuyb8FLC1mwgK3ntLXJ9ev2LwAB9dVYi54XGp7SErANyOuaW8J6.', NULL, NULL, NULL, NULL, 'customer', '2026-02-05 12:33:06', '2026-02-05 12:33:06', NULL, NULL, 'Bronze'),
(8, 'macmac', 'macmacpalo@gmail.com', '+63 092 222 3333', '$2y$10$pZqWSpV4PPg7qXiYDJJh.evrD4xYXsdeGkx3HfkOCsJt2n6UaOD3O', NULL, NULL, NULL, NULL, 'customer', '2026-02-09 01:02:30', '2026-02-09 05:35:27', NULL, NULL, 'Bronze'),
(9, 'Veeny Ree Mae Robles Bautista', 'vrmb.tech@gmail.comSSSSSSSSSSSSSSS', '+63 222 222 2222weww', '$2y$10$0chBEmg.5rJPRjmSjK65c.S/XUYQSgQL5XI49F5kKwTo9bUm2teKi', NULL, NULL, NULL, NULL, 'customer', '2026-02-10 03:24:02', '2026-02-11 01:04:56', NULL, NULL, 'Bronze');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `setting_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_accounts`
--
ALTER TABLE `admin_accounts`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `calendar`
--
ALTER TABLE `calendar`
  ADD PRIMARY KEY (`calendar_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `driver`
--
ALTER TABLE `driver`
  ADD PRIMARY KEY (`driver_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favorite_id`),
  ADD KEY `id` (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `penalty_tracker`
--
ALTER TABLE `penalty_tracker`
  ADD PRIMARY KEY (`penalty_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `rental`
--
ALTER TABLE `rental`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_user_rental` (`user_id`),
  ADD KEY `fk_rental_driver` (`driver_id`);

--
-- Indexes for table `rental_item`
--
ALTER TABLE `rental_item`
  ADD PRIMARY KEY (`rental_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `repair`
--
ALTER TABLE `repair`
  ADD PRIMARY KEY (`repair_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_accounts`
--
ALTER TABLE `admin_accounts`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `calendar`
--
ALTER TABLE `calendar`
  MODIFY `calendar_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `driver`
--
ALTER TABLE `driver`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favorite_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `penalty_tracker`
--
ALTER TABLE `penalty_tracker`
  MODIFY `penalty_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rental`
--
ALTER TABLE `rental`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `rental_item`
--
ALTER TABLE `rental_item`
  MODIFY `rental_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `repair`
--
ALTER TABLE `repair`
  MODIFY `repair_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calendar`
--
ALTER TABLE `calendar`
  ADD CONSTRAINT `calendar_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `penalty_tracker`
--
ALTER TABLE `penalty_tracker`
  ADD CONSTRAINT `penalty_tracker_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `rental` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `penalty_tracker_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rental`
--
ALTER TABLE `rental`
  ADD CONSTRAINT `fk_rental_driver` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_rental` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rental_item`
--
ALTER TABLE `rental_item`
  ADD CONSTRAINT `rental_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `rental` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rental_item_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `repair`
--
ALTER TABLE `repair`
  ADD CONSTRAINT `repair_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `review_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
