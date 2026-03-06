# 시월(October) - 강아지 옷 쇼핑몰

반려견을 위한 프리미엄 의류 쇼핑몰 프로젝트입니다.

## 프로젝트 구조

```text
october/
├── frontend/          # React + Vite
├── backend/           # Spring Boot + Java 17 + Maven
└── README.md
```

## 기술 스택

### Frontend
- React 19
- Vite 7
- React Router DOM 7
- Zustand
- Axios
- CSS 기반 스타일링 (Tailwind 미사용)

### Backend
- Spring Boot 3.2.1
- Java 17
- Spring Data JPA
- Spring Security
- PostgreSQL
- Maven

## 실행 방법

### 1. PostgreSQL 준비 (Supabase)

기본 연결 정보는 아래와 같습니다.

- DB URL: `jdbc:postgresql://db.kdmxcvlenegvqxpgbaqg.supabase.co:5432/postgres?sslmode=require`
- Username: `postgres`
- Password: 환경 변수 `DB_PASSWORD` 사용

환경 변수로 오버라이드할 수 있습니다.

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

### 2. 백엔드 실행

```bash
cd backend
mvn spring-boot:run
```

서버가 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

## 주요 기능

### 메인 페이지
- 히어로 배너
- 카테고리별 컬렉션 소개

### 상품 목록
- 카테고리 필터 (`all`, `spring-summer`, `fall-winter`, `accessories`)
- 정렬 (이름순, 가격 오름차순, 가격 내림차순)

### 상품 상세
- 상품 정보 조회
- 사이즈 선택
- 수량 선택
- 장바구니 담기

### 장바구니
- 로컬 상태 기반 장바구니 관리
- 수량 변경/삭제/전체 삭제
- 총 금액 및 배송비 계산

### 회원
- 회원가입/로그인 API
- 이메일/닉네임/휴대폰 중복 확인 API

## API 엔드포인트

### 상품 API (`/api/products`)
- `GET /api/products` - 전체 상품 조회
- `GET /api/products?category={category}` - 카테고리별 조회
- `GET /api/products?search={keyword}` - 상품명 검색
- `GET /api/products/{id}` - 상품 상세 조회
- `POST /api/products` - 상품 생성
- `PUT /api/products/{id}` - 상품 수정
- `DELETE /api/products/{id}` - 상품 삭제

### 장바구니 API (`/api/cart`)
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart` - 장바구니 추가
- `DELETE /api/cart/{id}` - 항목 삭제
- `DELETE /api/cart` - 장바구니 비우기

### 인증 API (`/api/auth`)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인 (현재 임시 토큰 반환)
- `GET /api/auth/check-email` - 이메일 중복 확인
- `GET /api/auth/check-nickname` - 닉네임 중복 확인
- `GET /api/auth/check-phone` - 휴대폰 중복 확인
- `POST /api/auth/send-verification` - 휴대폰 인증코드 발송(임시)
- `POST /api/auth/verify-phone` - 휴대폰 인증코드 검증(임시)

### 사용자 API (`/api/users`)
- `GET /api/users/profile/{id}` - 사용자 프로필 조회
- `PUT /api/users/profile/{id}` - 사용자 프로필 수정
- `POST /api/users/change-password` - 비밀번호 변경(현재 기본 응답)

## 샘플 데이터

백엔드 시작 시 상품 데이터가 비어 있으면 샘플 상품 12개가 자동 생성됩니다.

카테고리:
- `spring-summer`
- `fall-winter`
- `accessories`

## 개발 명령어

### 프론트엔드
```bash
cd frontend
npm run dev
npm run build
npm run preview
```

### 백엔드
```bash
cd backend
mvn spring-boot:run
mvn test
mvn package
```
