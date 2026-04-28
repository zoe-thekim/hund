-- 재고 테스트 데이터 삽입
-- Product 5: Earth and Fire Shirt (사이즈: L, M, S, XL, XS, XXL, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(5, 'XS', 15, 0, 15, 5, 10, NOW()),
(5, 'S', 25, 2, 23, 5, 10, NOW()),
(5, 'M', 30, 1, 29, 5, 10, NOW()),
(5, 'L', 20, 0, 20, 5, 10, NOW()),
(5, 'XL', 18, 3, 15, 5, 10, NOW()),
(5, 'XXL', 12, 0, 12, 5, 10, NOW()),
(5, 'XXS', 8, 1, 7, 5, 10, NOW());

-- Product 14: The Betty Raincoat (사이즈: L, M, S, XL, XS, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(14, 'XS', 22, 0, 22, 5, 10, NOW()),
(14, 'S', 35, 1, 34, 5, 10, NOW()),
(14, 'M', 28, 2, 26, 5, 10, NOW()),
(14, 'L', 24, 0, 24, 5, 10, NOW()),
(14, 'XL', 16, 1, 15, 5, 10, NOW()),
(14, 'XXS', 10, 0, 10, 5, 10, NOW());

-- Product 4: Café in Paris Sweatshirt (사이즈: L, M, S, XL, XS, XXL, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(4, 'XS', 18, 1, 17, 5, 10, NOW()),
(4, 'S', 32, 0, 32, 5, 10, NOW()),
(4, 'M', 26, 2, 24, 5, 10, NOW()),
(4, 'L', 21, 1, 20, 5, 10, NOW()),
(4, 'XL', 14, 0, 14, 5, 10, NOW()),
(4, 'XXL', 9, 1, 8, 5, 10, NOW()),
(4, 'XXS', 6, 0, 6, 5, 10, NOW());

-- Product 10: Dijon Shirt (사이즈: L, M, S, XL, XS, XXL, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(10, 'XS', 20, 0, 20, 5, 10, NOW()),
(10, 'S', 38, 3, 35, 5, 10, NOW()),
(10, 'M', 33, 1, 32, 5, 10, NOW()),
(10, 'L', 27, 2, 25, 5, 10, NOW()),
(10, 'XL', 19, 0, 19, 5, 10, NOW()),
(10, 'XXL', 11, 1, 10, 5, 10, NOW()),
(10, 'XXS', 7, 0, 7, 5, 10, NOW());

-- Product 18: Classic Fleece Hoodie Frost - Madhappy (사이즈: L, M, S, XL, XS, XXL, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(18, 'XS', 16, 2, 14, 5, 10, NOW()),
(18, 'S', 29, 1, 28, 5, 10, NOW()),
(18, 'M', 34, 0, 34, 5, 10, NOW()),
(18, 'L', 25, 1, 24, 5, 10, NOW()),
(18, 'XL', 17, 2, 15, 5, 10, NOW()),
(18, 'XXL', 13, 0, 13, 5, 10, NOW()),
(18, 'XXS', 5, 1, 4, 5, 10, NOW());

-- Product 3: Kiss Me Shirt (사이즈: L, M, S, XL, XS, XXL, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(3, 'XS', 23, 0, 23, 5, 10, NOW()),
(3, 'S', 41, 2, 39, 5, 10, NOW()),
(3, 'M', 36, 1, 35, 5, 10, NOW()),
(3, 'L', 28, 3, 25, 5, 10, NOW()),
(3, 'XL', 22, 1, 21, 5, 10, NOW()),
(3, 'XXL', 15, 0, 15, 5, 10, NOW()),
(3, 'XXS', 9, 2, 7, 5, 10, NOW());

-- Product 6: Cloud Nine Fleece Shirt (사이즈: L, M, S, XL, XS, XXL, XXS, XXXL)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(6, 'XS', 19, 1, 18, 5, 10, NOW()),
(6, 'S', 31, 0, 31, 5, 10, NOW()),
(6, 'M', 37, 2, 35, 5, 10, NOW()),
(6, 'L', 26, 1, 25, 5, 10, NOW()),
(6, 'XL', 21, 0, 21, 5, 10, NOW()),
(6, 'XXL', 14, 2, 12, 5, 10, NOW()),
(6, 'XXS', 8, 0, 8, 5, 10, NOW()),
(6, 'XXXL', 6, 1, 5, 5, 10, NOW());

-- Product 7: Magic Brownie Fleece Shirt (사이즈: L, M, S, XL, XS, XXL, XXS, XXXL)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(7, 'XS', 17, 0, 17, 5, 10, NOW()),
(7, 'S', 33, 1, 32, 5, 10, NOW()),
(7, 'M', 39, 3, 36, 5, 10, NOW()),
(7, 'L', 29, 2, 27, 5, 10, NOW()),
(7, 'XL', 24, 0, 24, 5, 10, NOW()),
(7, 'XXL', 16, 1, 15, 5, 10, NOW()),
(7, 'XXS', 10, 0, 10, 5, 10, NOW()),
(7, 'XXXL', 7, 0, 7, 5, 10, NOW());

-- Product 13: The Blue Dot Raincoat (사이즈: L, M, S, XL, XS, XXS)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(13, 'XS', 21, 1, 20, 5, 10, NOW()),
(13, 'S', 27, 0, 27, 5, 10, NOW()),
(13, 'M', 32, 2, 30, 5, 10, NOW()),
(13, 'L', 23, 1, 22, 5, 10, NOW()),
(13, 'XL', 18, 0, 18, 5, 10, NOW()),
(13, 'XXS', 11, 1, 10, 5, 10, NOW());

-- Product 8: Green Pie Shirt (사이즈: L, M, S)
INSERT INTO inventory (product_id, size, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, restock_point, created_at) VALUES
(8, 'S', 45, 2, 43, 5, 10, NOW()),
(8, 'M', 52, 1, 51, 5, 10, NOW()),
(8, 'L', 38, 3, 35, 5, 10, NOW());