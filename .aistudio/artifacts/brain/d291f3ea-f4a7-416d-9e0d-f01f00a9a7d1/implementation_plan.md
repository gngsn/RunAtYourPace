# 솜털런 (Somteol Run) — 감성 파스텔 3D GPX 러닝 리플레이어 & Google Maps 월드

사용자의 GPX 러닝 기록(경로, 페이스, 고도)과 실시간 Google Maps 데이터를 결합해, 첨부된 레퍼런스 이미지처럼 포근한 양모 펠트(Needle-Felted Wool) 질감의 러너가 분홍빛 털나무 숲과 민트빛 초원, 몽환적인 구름 위를 달리는 3인칭 3D 감성 러닝 리플레이어 웹 애플리케이션입니다.

### User Review & Critical Decisions

> [!IMPORTANT]
> 아래 항목은 1단계 질문에서 확정해주신 핵심 방향성이며, 승인 후 바로 Google Maps Platform 연동 및 3D 월드 구현을 진행합니다.

- **확정 결정 1 (시점 및 아트워크)**: 3인칭 백뷰(Chase Cam) 시점으로, 레퍼런스 이미지들의 포근한 양모 펠트 질감 캐릭터와 솜털 구름·낙엽 파티클, 네온 민트 잔디밭, 핑크빛 털나무 언덕, 그라데이션 야간 조명 식생을 결합한 3D 파스텔 월드를 구현합니다.
- **확정 결정 2 (핵심 플레이 방식)**: 실제 GPX 파일의 좌표·고도·구간별 페이스(min/km) 데이터를 재현하는 **감성 3D 러닝 리플레이어**로 작동하며, 배속 조절(1x~10x), 구간 스크러빙, 카메라 앵글 전환, 키보드 수동 개입(차선 변경·점프·부스트)을 모두 지원합니다.
- **확정 결정 3 (Google Maps & 주변 환경 연동)**: 메인 화면 전체를 3D 파스텔 월드로 채우면서, 우측 상단에 실시간 **Google Maps 미니맵**(`@vis.gl/react-google-maps` + `AdvancedMarkerElement`)을 배치해 실제 지도 위 GPX 경로와 현재 러너의 위치·방향을 동기화합니다. 또한 Google Maps 주변 지형·건물·공원 밀도와 랜드마크 데이터를 기반으로 3D 도로 주변에 파스텔 소프트 빌딩, 수변 윤슬, 핑크 솜털 나무 군락을 동적으로 배치합니다.
- **확정 결정 4 (GPX 업로드 및 한국 대표 코스 프리셋)**: 사용자의 `.gpx` 파일을 드래그 앤 드롭으로 즉시 파싱하여 3D 코스를 생성하며, 파일이 없어도 바로 감상할 수 있도록 **서울 반포 한강공원 달빛 무지개 코스**, **서울숲 & 성수 나들길 코스**, **남산 북측순환로 고도 코스**, **올림픽공원 몽촌토성 코스** 등 4가지 실제 좌표 기반 GPX 프리셋을 기본 탑재합니다.

---

### 1. Overview & Core Concept

- **What It Does**: 러닝 워치나 앱(Strava, Garmin, Nike Run Club 등)에서 추출한 GPX 파일을 불러오면, 삭막한 2D 지도 선 대신 동화 같은 솜털·파스텔 3D 세계의 러닝 트랙으로 변환해 재현합니다. 러너의 실제 속도가 빨라지면 캐릭터 발밑에 몽환적인 솜털 구름과 가을 낙엽이 흩날리고, 오르막 구간에서는 실제 고도 변화에 맞춰 3D 언덕 경사와 하늘빛이 드라마틱하게 변화합니다.
- **Target Audience / Persona**: 자신의 러닝 기록을 감성적인 비주얼 아트워크로 감상·공유하고 싶은 러너, 그리고 실제 도시와 공원의 코스를 아름다운 3D 미니어처 월드로 탐험하고 싶은 사용자.
- **Key Value**: 정적인 GPX 기록 분석(거리, 고도, 구간 페이스 그래프)과 실시간 Google Maps 위치 정보, 그리고 예술적인 파스텔 3D 애니메이션을 하나의 화면에서 끊김 없이 경험할 수 있습니다.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **진입 및 프리셋 즉시 감상**: 앱 접속 즉시 기본 프리셋(반포 한강공원 야간 러닝 코스)이 로드되어, 짙은 남색 밤하늘과 붉은 달빛 아래 민트빛 초원과 핑크 털나무 사이를 달리는 펠트 인형 러너의 3D 주행이 시작됩니다.
  2. **코스 전환 및 내 GPX 업로드**: 하단 통합 컨트롤 독(Dock) 또는 상단 우측의 `'GPX 불러오기'` 버튼을 통해 `.gpx` 파일을 업로드하거나, 프리셋 코스(한강, 서울숲, 남산, 올림픽공원)를 클릭 한 번으로 전환합니다.
  3. **실시간 Google Maps 미니맵 & 주변 랜드마크 동기화**: 우측 상단 미니맵에서 전체 GPX 경로 폴리라인과 현재 러너 마커가 실시간 이동하며, 코스 주변의 실제 공원·강변·주요 건물 지점을 인식해 3D 월드 좌우에 파스텔 캔디 빌딩, 강변 물결, 보랏빛 구름 언덕과 귀여운 구경꾼 캐릭터들을 생성합니다.
  4. **고도/페이스 타임라인 스크러빙 및 분위기 테마 전환**: 하단 도크의 인터랙티브 고도(Elevation) & 페이스(Pace) 차트를 드래그하여 원하는 km 지점으로 즉시 이동하고, 첨부 이미지 4종을 모티브로 한 **4가지 감성 테마**(`Pink Fluffy Meadow`, `Cloud Stride Blue`, `Luminous Night Garden`, `Riverside Felt Stroll`)를 실시간 전환합니다.
  5. **구간 기록 요약 및 피니시 카드**: 완주 시 또는 `'기록 리포트'` 버튼 클릭 시 총 거리, 평균 페이스, 누적 상승 고도, 1km 구간별 스플릿(Splits)이 정리된 포스터 스타일 요약 모달을 확인할 수 있습니다.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: **Tactile Needle-Felted Pastel & Dreamy Bioluminescent Landscape** — 첨부해주신 4장의 아트워크가 가진 부드러운 솜털(Fuzzy/Velvet Rim) 셰이딩, 파스텔 그라데이션, 둥글고 따스한 조형미를 3D PBR + 커스텀 림 라이트(Fresnel Fur/Velvet Effect)로 구현합니다.
  - *Color Palette & Mood*:
    - `--background`: `#0B0C22` (깊고 고요한 미드나잇 인디고 밤하늘) ~ `#4F5BD5` (몽환적인 페리윙클 블루 낮/노을 하늘)
    - `--surface`: `rgba(18, 20, 44, 0.82)` (WebGL 위에서 프레임 저하 없이 선명한 대비를 주는 세련된 다크 네이비 HUD 표면)
    - `--primary`: `#FF85B3` (솜털 핑크 나무 및 주요 액센트 CTA)
    - `--secondary`: `#80FFB4` (네온 민트 잔디밭 및 페이스 하이라이트)
    - `--accent`: `#FFF3B0` (크림 옐로우 스웨터, 솜털 구름, 붉은 달빛 `#FF4D6D` 포인트)
  - *Typography & Hierarchy*:
    - **Display / Brand**: `Outfit` (부드러운 기하학적 곡선과 현대적인 균형감을 지닌 산세리프)
    - **Body / UI Controls**: `Plus Jakarta Sans` (한글 본문 가독성과 영문 UI 레이블의 조화)
    - **Telemetry / Pace & Elevation Metrics**: `JetBrains Mono` (`tabular-nums`를 적용하여 실시간 거리 `04.82 km`, 페이스 `5'12"/km`, 고도 `48 m` 숫자가 흔들림 없이 정렬)
  - *Component Styling & Layout*:
    - **100% 전체 화면 3D 캔버스 (`w-screen h-screen overflow-hidden`)** 위에 시맨틱 DOM HUD가 얹히는 구조입니다.
    - **Top Bar Contract**: 좌측 브랜드 워드마크(`Somteol Run`), 중앙 현재 코스 요약 및 4개의 깔끔한 단일 행 네비게이션 링크(`코스 프리셋`, `테마 변경`, `구간 분석`, `시점 전환`), 우측 단일 주요 액션 버튼(`GPX 업로드`)으로 구성됩니다.
    - **Collapsible Bottom Control Dock**: 화면 중앙의 3D 러너와 파스텔 풍경을 가리지 않도록, 재생/일시정지, 배속(`1x`, `2x`, `5x`), 고도·페이스 인터랙티브 스크러버, 카메라 시점 프리셋을 하단 중앙 도크에 통합하고 `'▾ 컨트롤 숨기기 (Zen Mode)'` 토글을 제공합니다.

- **Interactive Feedback & Motion**:
  - 페이스(속도) 변화에 따라 카메라 FOV와 스프링 댐핑(`THREE.MathUtils.damp`)이 부드럽게 반응하며, 고페이스(질주) 구간에서는 발밑의 뭉게구름 파티클과 단풍잎이 더욱 풍성하게 생성됩니다.
  - 3D 도로 주변의 파스텔 빌딩이나 랜드마크 오브젝트 위에 마우스를 올리거나 미니맵 마커를 클릭하면 해당 지점의 구간 거리·고도·주변 환경 정보가 깔끔한 툴팁으로 표시됩니다.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: GPX 실좌표(위도·경도·고도)의 3D 스플라인 곡선 변환 및 실시간 Google Maps 동기화**
  - *Chosen Approach*: GPX의 위경도 좌표열을 미터(m) 단위의 로컬 3D 좌표계로 정규화한 뒤 `THREE.CatmullRomCurve3`로 부드러운 3D 러닝 트랙과 지형 고도를 생성하고, 현재 주행 진행률($t \in [0, 1]$)을 Google Maps 미니맵의 실제 위경도 좌표와 1:1 매핑합니다.
  - *Why*: GPS 오차로 인한 급격한 꺾임 없이 3인칭 백뷰 카메라가 실크처럼 부드럽게 주행하면서도, Google Maps 미니맵에서는 실제 도로·산책로 위 정확한 위치를 가리킬 수 있습니다.
  - *Alternatives Considered*: 순수 직선 세그먼트 연결 방식은 3인칭 추격 카메라 회전 시 화면이 끊어지는 현상이 발생하여 제외했습니다.

- **Decision 2: 주변 건물/환경을 반영한 파스텔 3D 월드 생성 방식**
  - *Chosen Approach*: 코스의 지리적 특성(수변/한강, 숲/공원, 도심 빌딩 숲, 산악 고도) 및 Google Maps Places API (New) 주변 검색 결과를 바탕으로, 트랙 양옆에 **절차적 복합 3D 모델(`THREE.Group` & `InstancedMesh`)**로 제작된 파스텔 둥근 빌딩, 핑크빛 털나무 군락, 빛나는 수변 식물, 구름 조형물, 구경하는 파스텔 캐릭터들을 배치합니다.
  - *Why*: 외부 무거운 `.glb` 파일 다운로드 실패(404) 없이 즉시 로드되며, 첨부된 이미지 특유의 '보송보송한 솜털 + 파스텔 꿈속 풍경' 미학을 100% 일관되게 유지할 수 있습니다.

- **Decision 3: 4가지 아트워크 테마 완벽 재현**
  - *Chosen Approach*: 업로드해주신 4장의 레퍼런스 이미지를 각각 반영한 4대 비주얼 모드를 제공합니다:
    1. **Pink Fluffy Meadow (이미지 4 모티브)**: 네온 민트빛 잔디 언덕, 거대한 핑크색 솜털 나무 군락, 짙은 밤하늘, 언덕 위에서 응원하는 파스텔 군중 캐릭터들.
    2. **Cloud Stride Autumn (이미지 2 모티브)**: 푸른 하늘빛 배경, 포근한 파스텔 니트를 입은 러너가 뭉게구름과 가을 단풍잎을 밟으며 달리는 공중 산책 연출.
    3. **Luminous Night Garden (이미지 3 모티브)**: 칠흑 같은 밤하늘에 붉게 빛나는 태양/달, 형광 핑크·옐로우·블루 그라데이션으로 빛나는 신비로운 다육 식물과 둥근 언덕.
    4. **Riverside Felt Stroll (이미지 1 모티브)**: 수변 코스(한강 등) 주행 시 크림색 모자와 초록 바지를 입은 펠트 캐릭터와 분홍 지느러미 물고기 오브제가 강변을 따라 함께 유영하는 동화적 연출.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        App State & GPX Engine (React)                      │
│  • GPX Parser & Normalizer (Lat/Lng/Ele/Time -> Distance, Pace, 3D Curve)  │
│  • Playback Controller (Progress t, Speed 1x-10x, Camera Preset, Theme)    │
│  • Environment Biome & Google Maps Places Landmark Synchronizer            │
└───────────────┬───────────────────────────────┬────────────────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────────┐
│   3D Pastel World Canvas (Three.js)   │ │  Google Maps HUD & UI Overlays   │
│  • 3rd-Person Chase Camera (Damped)   │ │  • Top Bar (Course, Theme, GPX)  │
│  • Needle-Felt Runner (Composite Rig) │ │  • Live Minimap (@vis.gl/react-  │
│  • CatmullRom 3D Track & Elevation    │ │    google-maps + AdvancedMarker) │
│  • Instanced Pastel Buildings &       │ │  • Collapsible Bottom Dock       │
│    Fluffy Pink Trees + Neon Grass     │ │    (Interactive Elevation/Pace   │
│  • Cloud Puff & Autumn Leaf Particles │ │     Scrubber + Speed + Zen Mode) │
└───────────────────────────────────────┘ └──────────────────────────────────┘
```

- **Data Model & State**:
  - `GpxTrackData`: 트랙 메타데이터(이름, 총 거리 km, 총 소요 시간, 평균 페이스, 최고/누적 고도), 정규화된 포인트 배열(`lat`, `lng`, `ele`, `distKm`, `paceMinPerKm`, `gradePercent`, `worldPos: [x, y, z]`), 구간별 1km 스플릿 요약.
  - `EnvironmentZone`: 코스 구간별 주변 환경 특성(`park`, `riverside`, `urban_pastel`, `mountain_night`) 및 Google Maps에서 조회된 주변 주요 랜드마크(공원, 다리, 타워, 문화시설) 이름과 좌표.
  - `PlaybackState`: 재생 여부(`isPlaying`), 현재 진행 거리(`currentDistKm`), 배속(`playbackSpeed`), 카메라 모드(`chase`, `side_felt`, `aerial`, `first_person`), 아트워크 테마(`meadow`, `cloud`, `night_garden`, `riverside`), HUD 접기 상태(`isZenMode`).

- **Interactive Component & State Mapping**:
  - **GPX File Dropzone & Preset Selector**: 사용자가 `.gpx` XML 파일을 업로드하면 브라우저에서 즉시 `<trkpt>`(위도, 경도, `<ele>`, `<time>`)를 파싱하고 하버사인(Haversine) 거리 및 구간 페이스를 계산해 3D 트랙과 Google Maps 폴리라인을 동시에 갱신합니다.
  - **Google Maps Live Minimap (`@vis.gl/react-google-maps`)**: `<Map mapId="DEMO_MAP_ID" internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}>` 내부에 전체 GPX 경로 폴리라인, 출발/도착 마커, 현재 러너 위치를 나타내는 커스텀 `AdvancedMarkerElement`, 그리고 주변 랜드마크 핀을 렌더링합니다. 미니맵 상의 임의 지점을 클릭하면 3D 러너가 해당 지점으로 즉시 워프합니다.
  - **Interactive Elevation & Pace Scrubber (Bottom Dock)**: 고도 곡선과 페이스 변화를 겹쳐 보여주는 SVG 인터랙티브 차트로, 마우스 드래그 시 `currentDistKm`가 실시간 업데이트되어 3D 카메라와 캐릭터, Google Maps 마커가 즉시 동기화됩니다.
  - **Splits & Course Report Modal**: 1km 단위 구간 페이스, 고도 편차, 칼로리/케이던스 추정치를 테이블(`tabular-nums`)로 보여주며, 특정 1km 구간을 클릭하면 해당 구간 시작점으로 3D 리플레이가 이동합니다.

- **Key Sequences & Integrations**:
  - **Google Maps Platform Integration**: AI Studio Google Maps 설정 플로우를 통해 API 키를 프로비저닝하고, `@vis.gl/react-google-maps` SDK와 `useMapsLibrary('places')` / `useMapsLibrary('maps')`를 사용하여 코스를 따라 실제 주변 랜드마크(공원, 빌딩, 수변 포인트)를 검색하고 이를 3D 월드 내 파스텔 건물과 랜드마크 표지판으로 투영합니다.
