-- 테스트 유저 데이터 삽입 (ID와 비밀번호 같게 설정)

-- 비밀번호는 BCrypt로 암호화 필요하지만, 일단 평문으로 진행
-- 실제로는 Spring Security가 암호화하므로 API 사용 권장

-- 테스트 유저 1
INSERT INTO users (
    name, email, password, phone_number, postal_code, address, detail_address,
    agree_to_terms, agree_to_privacy, agree_to_marketing, created_at, enabled, role, provider
) VALUES (
    '김테스트', 'kim@test.com', '$2a$10$E1WXF8yZwNx5R5R5R5R5Ru4Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qe',
    '010-1234-5678', '06234', '서울시 강남구 테헤란로 123', '456호',
    TRUE, TRUE, FALSE, NOW(), TRUE, 'USER', 'LOCAL'
);

-- 테스트 유저 2
INSERT INTO users (
    name, email, password, phone_number, postal_code, address, detail_address,
    agree_to_terms, agree_to_privacy, agree_to_marketing, created_at, enabled, role, provider
) VALUES (
    '박테스트', 'park@test.com', '$2a$10$E1WXF8yZwNx5R5R5R5R5Ru4Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qe',
    '010-9876-5432', '06789', '서울시 서초구 서초대로 789', '101동 202호',
    TRUE, TRUE, TRUE, NOW(), TRUE, 'USER', 'LOCAL'
);

-- 어드민 계정
INSERT INTO users (
    name, email, password, phone_number, postal_code, address, detail_address,
    agree_to_terms, agree_to_privacy, agree_to_marketing, created_at, enabled, role, provider
) VALUES (
    '관리자', 'admin@test.com', '$2a$10$E1WXF8yZwNx5R5R5R5R5Ru4Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qe',
    '010-0000-0000', '00000', '서울시 중구 명동길 789', '관리자실',
    TRUE, TRUE, FALSE, NOW(), TRUE, 'ADMIN', 'LOCAL'
);