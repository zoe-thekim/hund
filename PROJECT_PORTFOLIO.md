# HUND - 반려동물 의류 쇼핑몰 프로젝트

## 🎯 프로젝트 개요

반려견을 위한 프리미엄 의류 쇼핑몰로, 사용자가 쉽게 반려동물 의류를 탐색하고 구매할 수 있는 **풀스택 이커머스 플랫폼**입니다. 현대적인 기술 스택을 활용하여 확장 가능하고 안정적인 웹 애플리케이션을 구현했습니다.

**개발 기간**: 2025년 말 ~ 2026년 초
**프로젝트 성격**: 개인 포트폴리오 프로젝트
**배포 환경**: Spring Boot + PostgreSQL(Supabase) + React

## 🛠 기술 스택 및 아키텍처

### Backend (Spring Boot 3.2.1 / Java 17)
- **Framework**: Spring Boot, Spring Security, Spring Data JPA
- **Database**: PostgreSQL (Supabase 클라우드 DB)
- **Security**: JWT 기반 인증/인가 시스템
- **Build Tool**: Maven
- **Additional**: Lombok, Validation API

### Frontend (React 19 / TypeScript)
- **Framework**: React 19 + TypeScript + Vite 7
- **Routing**: React Router DOM 7
- **State Management**: Zustand (전역 상태)
- **HTTP Client**: Axios
- **UI Framework**: Tailwind CSS + Radix UI Components
- **Icons**: Lucide React

### DevOps & Infrastructure
- **Database**: Supabase (PostgreSQL managed service)
- **Development**: Hot reload, TypeScript 지원
- **Version Control**: Git

## 🚀 핵심 기능 및 구현 능력

### 🔐 사용자 인증/인가 시스템
- JWT 토큰 기반 보안 구현
- 이메일/닉네임/휴대폰번호 중복 확인 API
- Spring Security + Custom Filter Chain 적용
- 비밀번호 암호화 및 검증

### 🛒 이커머스 핵심 기능
- **상품 관리**: CRUD 작업, 카테고리별 필터링, 검색 기능
- **장바구니 시스템**: 로컬 상태 기반 장바구니 관리, 수량 변경/삭제
- **주문 시스템**: 주문 생성, 재고 관리 연동
- **사용자 프로필**: 개인정보 수정, 프로필 이미지 업로드

### 📊 데이터베이스 설계
- **정규화된 스키마 설계**: User, Product, Order, OrderItem, Inventory 등
- **관계형 데이터 모델링**: JPA Entity 관계 설정 (OneToMany, ManyToOne)
- **재고 관리**: 실시간 재고 추적 및 이력 관리 (InventoryHistory)

### 🎨 사용자 인터페이스
- **반응형 디자인**: Tailwind CSS 활용 모바일/데스크톱 지원
- **컴포넌트 아키텍처**: 재사용 가능한 React 컴포넌트 설계
- **사용자 경험**: 직관적인 상품 탐색, 필터링, 정렬 기능

## 🤖 생성형 AI 활용 및 문제해결

### AI 역할 구분

#### 🏗 시스템 아키텍처 및 설정 (개발자: Claude Code)
- **프로젝트 구조 설계**: Frontend/Backend 분리된 모노레포 구조
- **Spring Boot 프로젝트 초기 설정**: Maven 기반 의존성 관리, application.properties 환경 설정
- **Database 연결**: Supabase PostgreSQL 연동 및 환경변수 관리
- **빌드 시스템 구축**: Vite + TypeScript 개발 환경 최적화

#### 🔧 Backend API 개발 (개발자: Claude Code)
- **RESTful API 설계**: 상품, 사용자, 주문, 장바구니 CRUD 엔드포인트 구현
- **JWT 인증 시스템**: Spring Security + JWT Provider + Filter Chain 구현
- **데이터 유효성 검증**: Bean Validation 활용 입력 데이터 검증
- **예외 처리**: Global Exception Handler 및 커스텀 예외 클래스

#### 🎨 Frontend 인터페이스 개발 (개발자: Claude Code)
- **React Router 구조**: 페이지별 라우팅 및 중첩 라우팅 설정
- **상태 관리**: Zustand를 활용한 전역 상태 관리 패턴
- **API 통신**: Axios 기반 HTTP 클라이언트 및 에러 핸들링
- **반응형 UI**: Tailwind CSS + Radix UI 컴포넌트 조합

#### 📊 데이터베이스 최적화 (개발자: Claude Code)
- **스키마 마이그레이션**: JPA DDL 자동 생성 및 스키마 버전 관리
- **샘플 데이터 생성**: 개발/테스트용 초기 데이터 자동 생성 로직
- **쿼리 최적화**: JPA Query Method 및 JPQL 활용

### 문제 해결 사례 및 AI 활용 효과

#### 🔥 Critical Issue: CORS 정책 문제 해결
**문제상황**: Frontend(localhost:5173) → Backend(localhost:8080) API 호출 시 CORS 에러
**AI 해결방법**:
- Spring Boot CorsConfiguration 커스텀 설정 구현
- 개발/운영 환경별 동적 CORS 정책 적용
- Preflight 요청 처리 최적화

#### 🔒 Security Challenge: JWT 토큰 갱신 메커니즘
**문제상황**: 사용자 세션 지속성 및 보안성 균형점 찾기
**AI 해결방법**:
- Access Token + Refresh Token 이중 토큰 시스템 설계
- Spring Security Filter에서 토큰 만료 자동 처리
- Frontend에서 토큰 자동 갱신 Interceptor 구현

#### 📱 UX Problem: 상품 이미지 로딩 최적화
**문제상황**: 다수의 상품 이미지로 인한 초기 로딩 지연
**AI 해결방법**:
- Lazy Loading 구현으로 viewport 진입 시점 이미지 로딩
- 이미지 압축 및 WebP 포맷 적용
- 로딩 스켈레톤 UI 개선

#### 🗄 Database Performance: N+1 쿼리 문제 해결
**문제상황**: 상품 목록 조회 시 관련 이미지 데이터 N+1 쿼리 발생
**AI 해결방법**:
- JPA @EntityGraph 활용한 페치 조인 최적화
- DTO 프로젝션을 통한 필요한 데이터만 조회
- 페이지네이션 적용으로 대량 데이터 처리 개선

### AI 활용이 개발 생산성에 미친 영향

#### ⚡ 개발 속도 향상
- **코드 생성 자동화**: 반복적인 CRUD 코드, DTO 클래스 자동 생성
- **테스트 코드 작성**: Unit Test 및 Integration Test 케이스 자동 생성
- **디버깅 효율성**: 에러 로그 분석 및 해결책 즉시 제안

#### 🎯 코드 품질 개선
- **베스트 프랙티스 적용**: Spring Boot, React 최신 패턴 자동 반영
- **보안 취약점 예방**: SQL Injection, XSS 등 보안 이슈 사전 차단
- **성능 최적화**: 데이터베이스 쿼리, 번들 사이즈 최적화 제안

#### 🧠 학습 및 성장 효과
- **기술 스택 학습**: 새로운 라이브러리/프레임워크 빠른 습득
- **아키텍처 이해**: 대규모 애플리케이션 설계 패턴 학습
- **트러블슈팅 역량**: 다양한 문제 상황 경험 및 해결 능력 향상

## 📈 프로젝트 성과 및 학습 결과

### 기술적 성과
- **풀스택 개발**: Frontend/Backend 통합 개발 경험
- **클라우드 서비스 활용**: Supabase 등 PaaS 서비스 운영 경험
- **현대적 개발 환경**: TypeScript, ESLint, Hot Reload 등 DX 향상 도구 활용

### 비즈니스 관점 성과
- **사용자 중심 설계**: 직관적인 쇼핑 플로우 및 UI/UX 구현
- **확장 가능한 아키텍처**: 마이크로서비스 전환 가능한 모듈형 설계
- **운영 효율성**: 자동화된 배포 파이프라인 및 모니터링 체계

### 개발자 역량 증명
- **문제 해결**: 복잡한 기술적 문제를 체계적으로 분석하고 해결
- **학습 능력**: 새로운 기술 스택을 빠르게 습득하고 프로젝트에 적용
- **협업 역량**: Git 기반 버전 관리 및 코드 리뷰 프로세스 경험
- **AI 활용 능력**: 생성형 AI를 개발 생산성 향상 도구로 효과적 활용

## 🔗 프로젝트 링크 및 추가 정보

**GitHub Repository**: 소스코드 및 상세 구현 내용
**기술 블로그**: 주요 기술적 의사결정 과정 및 트러블슈팅 경험 정리
**라이브 데모**: 실제 동작하는 애플리케이션 체험 가능

---

*본 프로젝트는 현대적인 웹 개발 기술 스택을 활용하여 실무 수준의 이커머스 플랫폼을 구현한 포트폴리오입니다. 특히 생성형 AI(Claude Code)를 개발 파트너로 활용하여 개발 생산성과 코드 품질을 동시에 향상시킨 사례로, AI 시대 개발자의 새로운 협업 모델을 제시합니다.*