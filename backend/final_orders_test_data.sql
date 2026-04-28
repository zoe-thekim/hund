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
) RETURNING id;

-- 주문 2: 배송 중인 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260309-SHIPPING', 15, 'SHIPPED', 152300, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-09 14:20:00', NOW()
) RETURNING id;

-- 주문 3: 처리 중인 주문
INSERT INTO orders (
    order_number, user_id, status, total_amount, shipping_fee, discount_amount,
    payment_method, payment_status, delivery_postal_code, delivery_address,
    delivery_detail_address, ordered_at, created_at
) VALUES (
    'ORD-20260310-PROCESSING', 15, 'PROCESSING', 93800, 0, 0,
    'CARD', 'COMPLETED', '06234', '서울시 강남구 테헤란로 123', '456호',
    '2026-03-10 09:15:00', NOW()
) RETURNING id;

-- 수동으로 각각의 order_item 삽입
-- 주문 1의 주문 항목 (order_id = 1로 가정)
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    price, unit_price, total_price, item_status, created_at, discount_amount
) VALUES (
    1, 5, 3, 'Earth and Fire Shirt', 'M', 1,
    67400, 67400, 67400, 'DELIVERED', NOW(), 0
);

-- 주문 2의 주문 항목들 (order_id = 2로 가정)
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    price, unit_price, total_price, item_status, created_at, discount_amount
) VALUES
    (2, 14, 10, 'The Betty Raincoat', 'M', 1, 84900, 84900, 84900, 'SHIPPED', NOW(), 0),
    (2, 4, 16, 'Café in Paris Sweatshirt', 'S', 1, 67400, 67400, 67400, 'SHIPPED', NOW(), 0);

-- 주문 3의 주문 항목들 (order_id = 3로 가정)
INSERT INTO order_items (
    order_id, product_id, inventory_id, product_name, size, quantity,
    price, unit_price, total_price, item_status, created_at, discount_amount
) VALUES
    (3, 6, 31, 'Cloud Nine Fleece Shirt', 'M', 1, 46900, 46900, 46900, 'PROCESSING', NOW(), 0),
    (3, 7, 39, 'Magic Brownie Fleece Shirt', 'L', 1, 46900, 46900, 46900, 'PROCESSING', NOW(), 0);