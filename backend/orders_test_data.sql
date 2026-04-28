-- 구매 내역 테스트 데이터 삽입
-- 기존 유저 ID 15 (zoethekiminseoul@gmail.com) 사용

-- 주문 1: 기존 유저의 첫 번째 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260310-12345678', 15, 'DELIVERED', 67400, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-08 10:30:00', NOW()
);

-- 주문 1의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES (
    1, 5, 3, 'Earth and Fire Shirt', 'M', 1, 67400, 67400, 'DELIVERED', NOW()
);

-- 주문 2: 기존 유저의 두 번째 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260309-87654321', 15, 'SHIPPED', 152300, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-09 14:20:00', NOW()
);

-- 주문 2의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES
    (2, 14, 10, 'The Betty Raincoat', 'M', 1, 84900, 84900, 'SHIPPED', NOW()),
    (2, 4, 16, 'Café in Paris Sweatshirt', 'S', 1, 67400, 67400, 'SHIPPED', NOW());

-- 주문 3: 박테스트 유저 (가정: park@test.com 유저의 ID가 2)
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260307-11223344', 2, 'PROCESSING', 113800, 0, 0,
    'CARD', 'COMPLETED', '06789', '서울시 서초구 서초대로 789', '101동 202호',
    '2026-03-07 16:45:00', NOW()
);

-- 주문 3의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES
    (3, 6, 31, 'Cloud Nine Fleece Shirt', 'M', 1, 46900, 46900, 'PROCESSING', NOW()),
    (3, 7, 39, 'Magic Brownie Fleece Shirt', 'L', 1, 46900, 46900, 'PROCESSING', NOW()),
    (3, 8, 66, 'Green Pie Shirt', 'S', 1, 12500, 12500, 'PROCESSING', NOW()),
    (3, 8, 67, 'Green Pie Shirt', 'M', 1, 12500, 12500, 'PROCESSING', NOW());

-- 주문 4: 박테스트 유저의 두 번째 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260306-55667788', 2, 'CONFIRMED', 71800, 0, 0,
    'CARD', 'COMPLETED', '06789', '서울시 서초구 서초대로 789', '101동 202호',
    '2026-03-06 11:15:00', NOW()
);

-- 주문 4의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES (
    4, 18, 25, 'Classic Fleece Hoodie Frost - Madhappy', 'L', 1, 71800, 71800, 'CONFIRMED', NOW()
);

-- 주문 5: 어드민 계정 주문 (가정: admin@test.com 유저의 ID가 3)
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260305-99887766', 3, 'DELIVERED', 134800, 0, 0,
    'CARD', 'COMPLETED', '00000', '서울시 중구 명동길 789', '관리자실',
    '2026-03-05 09:30:00', NOW()
);

-- 주문 5의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES
    (5, 3, 43, 'Kiss Me Shirt', 'L', 1, 67400, 67400, 'DELIVERED', NOW()),
    (5, 3, 44, 'Kiss Me Shirt', 'XL', 1, 67400, 67400, 'DELIVERED', NOW());

-- 주문 6: 최근 대기 중인 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260310-44556677', 1, 'PENDING', 84900, 0, 0,
    'CARD', 'PENDING', '06234', '서울시 강남구 테헤란로 123', '456호',
    NOW(), NOW()
);

-- 주문 6의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES (
    6, 13, 58, 'The Blue Dot Raincoat', 'M', 1, 84900, 84900, 'PENDING', NOW()
);