# October Frontend

hund 강아지 의류 쇼핑몰 프론트엔드 프로젝트입니다.

## 기술 스택

- React 19
- Vite 7
- React Router DOM 7
- Zustand
- Axios
- CSS 기반 스타일링

## 실행 방법

```bash
cd frontend
npm install
npm run dev
```

- 기본 실행 주소: `http://localhost:5173`
- 백엔드 API 기본 주소: `http://localhost:8080/api`

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## 주요 페이지 라우트

- `/` - 홈
- `/about` - 브랜드 소개
- `/products` - 상품 목록
- `/products/:id` - 상품 상세
- `/cart` - 장바구니
- `/login` - 로그인
- `/register` - 회원가입
- `/mypage` - 마이페이지

## 상태 관리

- `src/store/useStore.js`에서 Zustand로 장바구니 상태를 관리합니다.
- 현재 장바구니는 프론트 로컬 상태 기반으로 동작합니다.

## API 연동

- Axios 인스턴스: `src/api/index.js`
- 사용 API:
  - `GET /products`
  - `GET /products/{id}`
  - `GET /cart`
  - `POST /cart`
  - `DELETE /cart/{id}`

## 디렉터리 구조

```text
frontend/
├── src/
│   ├── api/          # API 클라이언트
│   ├── components/   # 공통 UI 컴포넌트
│   ├── hooks/        # 커스텀 훅
│   ├── pages/        # 라우트 페이지
│   ├── store/        # Zustand 스토어
│   ├── assets/       # 정적 리소스
│   ├── App.jsx
│   └── main.jsx
└── package.json
```
