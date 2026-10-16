# Run At Your Pace

> **"The route you ran becomes the course."**  
> 실제 러닝 GPX 기록을 평탄하고 겹치지 않는(Flat 0m · Non-Overlapping) 3레인 파스텔 3D 러닝 코스로 변환해 달리는 인터랙티브 웹 애플리케이션입니다.

---

## 주요 기능 (Key Features)

### 1. 시작 화면 (`#screen-home`)
- 실시간 3D 파스텔 러닝 월드 배경 위에 **Run At Your Pace** 글로시 3D 버블 로고와 슬로건(`The route you ran becomes the course.`), **`Run!`** 시작 버튼을 제공합니다.

### 2. 마이 루트 대시보드 (`#screen-select`)
- **파스텔 라벤더 테마 (`#ebd7f0` / `#d1bcd6`)**: 대시보드 배경(`#ebd7f0`)과 사이드바·검색창·액션 버튼·카드 배지(`#d1bcd6`)가 통일된 파스텔 톤으로 구성되어 있습니다.
- **3D 프로스티드 글래스 GPX 코스 카드**: 각 GPX 경로의 기하학적 형태를 3D 유리 튜브 조형물로 시각화하며, 최신순 정렬 및 실시간 검색을 지원합니다.
- **커스텀 `.GPX` 업로드 및 내보내기**: Strava, Garmin, Nike Run Club, Apple Watch 등에서 추출한 `.gpx` 파일을 드래그 앤 드롭하거나 업로드해 즉시 3레인 3D 코스를 생성할 수 있습니다.
- **4종 아트워크 테마 전환**:
  - `Pink Fluffy Meadow` (기본 테마)
  - `Cloud Stride Autumn`
  - `Luminous Night Garden`
  - `Riverside Felt Stroll`

### 3. 5종 3D 캐릭터 (`FIVE_CHARACTERS`)
그리드 형태의 캐릭터 선택창에서 짧은 닉네임과 함께 선택할 수 있으며, **Hoodie**가 기본 메인 캐릭터로 지정되어 있습니다.
1. **Hoodie (메인, `hoodie_kid`)**: 옐로우~민트 그라데이션 후드, 민트 앞머리, 후드 스트링 및 코랄 스니커즈
2. **Momo (`topknot_kid`)**: 핑크~옐로우~민트 그라데이션 구체 헤드, 더블 핑크 헤어밴드와 민트 새싹 머리묶음, 레인보우 부츠
3. **Bling (`starlight_fox`)**: 피치~코랄 헤드, 민트 리본과 옐로우 폼폼, X자 눈, 4단 골드 체인 목걸이와 그린 부츠
4. **Flora (`flower_orb`)**: 민트~라벤더~핑크 그라데이션 구체 바디, 머리 위 핑크 데이지 꽃과 초록 잎사귀, 도톰한 노란 입술
5. **Mint (`mint_sprinter`)**: 아쿠아 틸 헤드, 크림 옐로우 롤업 비니 모자, 옐로우~코랄 벨 라인 원피스

### 4. 코스 프리뷰 & 캐릭터 선택 (`#screen-preview` / `#screen-character`)
- **코스 프리뷰**: 오버뷰 카메라 시점에서 전체 3레인 비겹침 트랙과 총 거리, 실제 소요 시간, 평균 페이스 및 4단계 페이스 구간 범례를 확인합니다.
- **캐릭터 선택**: 좌측에 3D 캐릭터가 가려지지 않고 선명하게 표시되며, 우측 그리드 패널에서 레이스에 참여할 캐릭터를 선택해 출발합니다.

### 5. 3레인 3D 러닝 플레이 (`#screen-play`)
- **평탄화 및 비겹침 경로 보정 (Flat 0m · Non-Overlapping)**: 모든 고도를 `0m`로 평탄화하고, 왕복/교차 구간의 자기 교차(Self-Intersection)를 자동으로 펴서 트랙이 겹치지 않도록 생성합니다.
- **코인 러시 & 피버 시스템**:
  - 일반 골드 코인 (`+100 PTS`), 대형 스타 코인 (`+500 PTS`), 구름 허들 점프 돌파, 터보 패드 및 5km 에너지 젤 아이템을 제공합니다.
- **다양한 카메라 시점 & 실시간 미니맵**:
  - `3rd-Person Chase`, `Front Look`, `Side Felt`, `Drone Aerial`, `First-Person` 5가지 카메라 시점 전환을 지원합니다.
  - 우측 상단 Google Maps 실시간 미니맵과 하단 페이스 타임라인 독을 통해 현재 위치를 확인하고 원하는 지점으로 즉시 이동(Scrub)할 수 있습니다.

---

## 조작 방법 (Controls)

| 동작 | 키보드 단축키 | 화면 조작 |
| :--- | :--- | :--- |
| **레인 이동 (좌 / 우)** | `A` / `D` 또는 `←` / `→` | 하단 독 `Lane 1 (L)` · `Lane 2 (C)` · `Lane 3 (R)` 버튼 |
| **점프 & 아이템 사용** | `Space` / `W` / `↑` | 하단 독 `JUMP` 버튼 |
| **아이템 슬롯 개별 사용** | `1` / `2` / `3` | 보유 아이템 자동/수동 발동 |
| **카메라 시점 전환** | `C` | 하단 독 카메라 모드 버튼 |
| **하단 컨트롤 독 접기/펴기** | `H` | 하단 독 상단 토글 핸들 |
| **일시정지 / 코스 나가기** | `Esc` | 좌측 상단 `Pause` / `Stop` 버튼 |

---

## 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **3D Rendering**: Three.js (WebGL, Procedural Felt/Glossy Materials, Instanced Collectibles & Landmarks)
- **Map Integration**: `@vis.gl/react-google-maps` (Google Maps JavaScript API)
- **Icons & Audio**: `lucide-react`, Web Audio API 합성 사운드 엔진 (`soundEffects.ts`)
- **Build Tool**: Vite

---

## 실행 및 빌드 (Getting Started)

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Port 3000)
npm run dev

# 프로덕션 빌드
npm run build
```
