-- 구매 내역 테스트 데이터 삽입 (기존 유저 ID 15만 사용)

-- 주문 1: 완료된 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260308-COMPLETED', 15, 'DELIVERED', 67400, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-08 10:30:00', NOW()
);

-- 주문 1의 주문 항목
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES (
    (SELECT currval('orders_id_seq')), 5, 3, 'Earth and Fire Shirt', 'M', 1, 67400, 67400, 'DELIVERED', NOW()
);

-- 주문 2: 배송 중인 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260309-SHIPPING', 15, 'SHIPPED', 152300, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-09 14:20:00', NOW()
);

-- 주문 2의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES
    ((SELECT currval('orders_id_seq')), 14, 10, 'The Betty Raincoat', 'M', 1, 84900, 84900, 'SHIPPED', NOW()),
    ((SELECT currval('orders_id_seq')), 4, 16, 'Café in Paris Sweatshirt', 'S', 1, 67400, 67400, 'SHIPPED', NOW());

-- 주문 3: 처리 중인 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260310-PROCESSING', 15, 'PROCESSING', 93800, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-10 09:15:00', NOW()
);

-- 주문 3의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES
    ((SELECT currval('orders_id_seq')), 6, 31, 'Cloud Nine Fleece Shirt', 'M', 1, 46900, 46900, 'PROCESSING', NOW()),
    ((SELECT currval('orders_id_seq')), 7, 39, 'Magic Brownie Fleece Shirt', 'L', 1, 46900, 46900, 'PROCESSING', NOW());

-- 주문 4: 확인된 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260310-CONFIRMED', 15, 'CONFIRMED', 71800, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-10 11:30:00', NOW()
);

-- 주문 4의 주문 항목
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES (
    (SELECT currval('orders_id_seq')), 18, 25, 'Classic Fleece Hoodie Frost - Madhappy', 'L', 1, 71800, 71800, 'CONFIRMED', NOW()
);

-- 주문 5: 대기 중인 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260310-PENDING', 15, 'PENDING', 134800, 0, 0,
    'CARD', 'PENDING', '06234', '서울시 강남구 테헤란로 123', '456호',
    NOW(), NOW()
);

-- 주문 5의 주문 항목들
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    unit_price, total_price, item_status, created_at
) VALUES
    ((SELECT currval('orders_id_seq')), 3, 43, 'Kiss Me Shirt', 'L', 1, 67400, 67400, 'PENDING', NOW()),
    ((SELECT currval('orders_id_seq')), 3, 44, 'Kiss Me Shirt', 'XL', 1, 67400, 67400, 'PENDING', NOW());