/**
 * 계약길잡이(contract.sen.go.kr) 공식 계약분야(gb) 및 계약유형(gy) 체계
 * 학교 현장 다빈도 품목 카탈로그 및 단골 프리셋
 */

// 서울시교육청 계약길잡이(contract.sen.go.kr) 공식 계약분야(gb) 및 계약유형(gy)
export const OFFICIAL_SEN_TYPES = {
  // 1. 공사 (A3)
  construction: [
    { code: 'B15', name: '건설공사 (일반·전문)', desc: '실내건축, 도장, 방수, 창호, 시설보수 등 일반 전문건설공사 (소액수의 한도: 2억 원 이하, 하자보수: 3%)' },
    { code: 'B36_ELEC', name: '전기공사 (법정 분리발주)', desc: 'LED조명, 수배전반, 냉난방기 배선 (전기공사업법 제11조 의무 분리발주, 소액수의 한도: 1.6억 원, 하자보수: 2%)' },
    { code: 'B36_COMM', name: '정보통신공사 (법정 분리발주)', desc: '학내망(LAN), 방송설비, CCTV, 무선AP (정보통신공사업법 제25조 의무 분리발주, 소액수의 한도: 1.6억 원, 하자보수: 2%)' },
    { code: 'B36_FIRE', name: '소방시설공사 (법정 분리도급)', desc: '감지기, 스프링클러, 소화전, 유도등 (소방시설공사업법 제21조 의무 분리도급, 소액수의 한도: 1.6억 원, 하자보수: 2%)' },
    { code: 'B36_GAS', name: '가스시설공사 (전문면허 분리발주)', desc: '급식실 가스배관, GHP냉난방 인입 (도시가스사업법/건산법 분리발주, 가스시설시공업 제1종 면허, 한국가스안전공사 완성검사, 소액수의: 2억 원, 하자보수: 3%)' },
    { code: 'B36_LIFT', name: '승강기설치공사 (전문 분리발주)', desc: '장애인용 승강기 신설·교체, 급식용 덤웨이터 (승강기안전관리법/건산법 분리발주, 승강기설치공사업 면허, 한국승강기안전공단 완성검사, 소액수의: 2억 원, 하자보수: 3%)' },
    { code: 'B36_ASBESTOS', name: '석면해체·제거공사 (법정 의무 분리발주)', desc: '교실 석면텍스 철거 (산업안전보건법 제121조 의무 분리발주·통합발주 형사처벌, 고용노동부 등록업자, 노동청 신고필증 및 비산농도 측정, 소액수의: 2억 원, 하자보수: 면제)' }
  ],
  // 2. 용역 (A2) - 서울시교육청 계약길잡이 공식 10대 용역 + 학교 다빈도 대표 용역
  service: [
    { code: 'B07', name: '전세버스 임차용역', desc: '현장체험학습, 행사용 전세버스 대절 및 임차' },
    { code: 'B08', name: '청소용역', desc: '학교 시설관리, 교실/복도/화장실 일상 및 특별 청소' },
    { code: 'B09', name: '늘봄 프로그램', desc: '초등 늘봄학교 맞춤형 프로그램 및 돌봄 운영 위탁' },
    { code: 'B10', name: '민간참여 컴퓨터교실', desc: '방과후 컴퓨터교실 민간참여 운영 위탁' },
    { code: 'B11', name: '유인경비', desc: '학교 안전지킴이, 배움터지킴이, 야간/휴일 유인경비' },
    { code: 'B12', name: '소규모테마형교육여행', desc: '초·중·고 수학여행 버스, 숙박, 프로그램 통합 위탁' },
    { code: 'B13', name: '수련활동', desc: '학생 수련원, 야영장 시설 및 프로그램 위탁' },
    { code: 'B14', name: '일부위탁급식', desc: '급식실 조리 및 배식 일부위탁' },
    { code: 'B39', name: '배식도우미', desc: '학생 급식 배식 보조인력 운영 위탁' },
    { code: 'B40', name: '스쿨버스', desc: '특수학교 및 초등학교 등하교 통학차량 운영' },
    { code: 'B20', name: '방과후학교 프로그램 위탁운영', desc: '초·중·고 방과후학교 연간 위탁운영 (학교 대표 대규모 용역, 2단계 입찰/협상에 의한 계약)' }
  ],
  // 3. 물품 (A1) - 서울시교육청 계약길잡이 공식 8대 물품
  goods: [
    { code: 'B01', name: '우유급식', desc: '학생 무상/유상 급식 우유 공급 계약' },
    { code: 'B02', name: '교복구매', desc: '중·고등학교 신입생 무상 교복 학교주관구매 (필수 2단계 입찰)' },
    { code: 'B16', name: '물품구매', desc: '일반 교구, 사무용품, 실험기자재, 방역물품 등' },
    { code: 'B04', name: '물품제조', desc: '암막 블라인드(롤스크린), 간행물 인쇄, 현수막, 표지판 등' },
    { code: 'B05', name: '졸업앨범', desc: '졸업앨범 제작 및 인쇄 구매 (품평회 또는 전자견적)' },
    { code: 'B06', name: '도서구매', desc: '학교 도서관 신간 및 연속간행물 도서 구매' },
    { code: 'B03', name: '조달구매', desc: '나라장터 종합쇼핑몰 다수공급자계약(MAS) / 제3자단가' },
    { code: 'B18', name: '급식식재료', desc: '농수축산물, 공산품 등 학교급식 식재료 구매 (eaT/S2B)' }
  ]
};

export const QUICK_PRESETS = [
  {
    id: 'p1',
    title: '교실 친환경 도색공사',
    category: 'construction',
    typeCode: 'B15', // 건설공사
    price: 8500000,
    vatIncluded: true,
    desc: '추정가격 2천만원 이하 1인 수의계약 (착공계/준공계 생략 가능)'
  },
  {
    id: 'p2',
    title: '방송실 노후 음향설비 개선',
    category: 'construction',
    typeCode: 'B36_COMM', // 정보통신공사 (분리발주)
    price: 24200000,
    vatIncluded: true,
    desc: '추정가격 2,200만원 S2B 소액수의 2인이상 견적제출 (낙찰하한율 88%)'
  },
  {
    id: 'p3',
    title: '컴퓨터실 학생용 PC 30대 구매',
    category: 'goods',
    typeCode: 'B03', // 조달구매
    price: 27500000,
    vatIncluded: true,
    desc: '조달 종합쇼핑몰 구매 (중기간 1억 미만 2단계경쟁 생략·직접구매, 자체조달 시 2인 견적공고 필요)'
  },
  {
    id: 'p4',
    title: '소규모테마형교육여행(수학여행)',
    category: 'service',
    typeCode: 'B12', // 소규모테마형교육여행
    price: 38500000,
    vatIncluded: true,
    desc: '교육활동 특화용역 (S2B 전자견적 또는 2단계 입찰)'
  },
  {
    id: 'p5',
    title: '학교 시설관리 및 청소용역 (여성기업)',
    category: 'service',
    typeCode: 'B08', // 청소용역
    price: 49500000,
    vatIncluded: true,
    isFemaleCompany: true,
    desc: '추정가격 4,500만원 여성기업 확인서 보유 시 1인 견적 수의계약 특례'
  },
  {
    id: 'p6',
    title: '신입생 무상 교복 학교주관구매',
    category: 'goods',
    typeCode: 'B02', // 교복구매
    price: 132000000,
    vatIncluded: true,
    desc: '학교주관구매 필수 2단계(규격-가격 동시) 입찰'
  },
  {
    id: 'p7',
    title: '체육관 LED 조명 교체 전기공사',
    category: 'construction',
    typeCode: 'B36_ELEC', // 전기공사 (법정 분리발주)
    price: 55000000,
    vatIncluded: true,
    desc: '추정가격 5천만원 전기공사 S2B 2인 이상 견적제출 수의'
  },
  {
    id: 'p8',
    title: '졸업앨범 제작 및 구매',
    category: 'goods',
    typeCode: 'B05', // 졸업앨범
    price: 19800000,
    vatIncluded: true,
    desc: '추정가격 1,800만원 1인 수의 또는 품평회 2단계 입찰'
  }
];

export const FREQUENT_ITEMS = [
  // 공사 (B15, B36_ELEC, B36_COMM, B36_FIRE, B36_GAS, B36_LIFT, B36_ASBESTOS)
  { name: '교실 및 복도 도색공사', category: 'construction', typeCode: 'B15', keywords: ['도장', '페인트', '도색', '칠'] },
  { name: '옥상 우레탄 방수공사', category: 'construction', typeCode: 'B15', keywords: ['방수', '누수', '우레탄', '지붕'] },
  { name: '방송실 음향 및 앰프 개선공사', category: 'construction', typeCode: 'B36_COMM', keywords: ['방송', '스피커', '앰프', '마이크', '통신'] },
  { name: 'CCTV 교체 및 신설공사', category: 'construction', typeCode: 'B36_COMM', keywords: ['cctv', '카메라', '보안', '통신'] },
  { name: '화장실 LED 조명 개선 전기공사', category: 'construction', typeCode: 'B36_ELEC', keywords: ['전등', '조명', 'led', '전기', '형광등'] },
  { name: '소방 스프링클러 배관 수리공사', category: 'construction', typeCode: 'B36_FIRE', keywords: ['소방', '스프링클러', '소화전', '화재'] },
  { name: '교실 출입문 및 창호 교체공사', category: 'construction', typeCode: 'B15', keywords: ['문', '창문', '창호', '샤시', '유리'] },
  { name: '컴퓨터실 바닥 이중바닥재(OA타일)', category: 'construction', typeCode: 'B15', keywords: ['바닥', 'oa타일', '데코타일', '장판'] },
  
  // 용역 (B07 ~ B40)
  { name: '현장체험학습 전세버스 임차', category: 'service', typeCode: 'B07', keywords: ['전세버스', '버스대절', '임차', '체험학습'] },
  { name: '학교 시설관리 및 청소용역', category: 'service', typeCode: 'B08', keywords: ['청소', '미화', '위생', '시설관리'] },
  { name: '늘봄학교 맞춤형 프로그램 위탁', category: 'service', typeCode: 'B09', keywords: ['늘봄', '초등돌봄', '방과후', '돌봄'] },
  { name: '방과후 민간참여 컴퓨터교실 위탁', category: 'service', typeCode: 'B10', keywords: ['컴퓨터교실', '정보화교육'] },
  { name: '학교 안전지킴이 및 유인경비', category: 'service', typeCode: 'B11', keywords: ['경비', '유인경비', '지킴이', '보안'] },
  { name: '소규모테마형교육여행(수학여행)', category: 'service', typeCode: 'B12', keywords: ['수학여행', '교육여행', '테마여행', '제주도'] },
  { name: '학생 수련활동 위탁운영', category: 'service', typeCode: 'B13', keywords: ['수련', '야영', '수련회', '캠프'] },
  { name: '급식실 일부위탁급식 운영', category: 'service', typeCode: 'B14', keywords: ['위탁급식', '급식위탁'] },
  { name: '학생 급식 배식도우미 인력지원', category: 'service', typeCode: 'B39', keywords: ['배식', '배식도우미', '급식도우미'] },
  { name: '특수 및 통학 스쿨버스 임차', category: 'service', typeCode: 'B40', keywords: ['스쿨버스', '통학차량', '통학버스'] },

  // 물품 (B01 ~ B18)
  { name: '학생 급식용 우유 공급', category: 'goods', typeCode: 'B01', keywords: ['우유', '우유급식', '유제품'] },
  { name: '신입생 교복 학교주관구매', category: 'goods', typeCode: 'B02', keywords: ['교복', '체육복', '생활복', '무상교복'] },
  { name: '학생용 책걸상 및 사물함 구매', category: 'goods', typeCode: 'B16', keywords: ['책상', '의자', '책걸상', '가구', '사물함'] },
  { name: '교실 암막 블라인드(롤스크린) 제조구매', category: 'goods', typeCode: 'B04', keywords: ['블라인드', '롤스크린', '커튼', '암막'] },
  { name: '졸업앨범 인쇄 및 제작구매', category: 'goods', typeCode: 'B05', keywords: ['앨범', '졸업앨범', '인쇄'] },
  { name: '학교 도서관 신간 도서 구매', category: 'goods', typeCode: 'B06', keywords: ['도서', '책', '도서관', '문고'] },
  { name: '학생용 컴퓨터 및 노트북 조달구매', category: 'goods', typeCode: 'B03', keywords: ['컴퓨터', 'pc', '노트북', '크롬북', '조달'] },
  { name: '친환경 학교급식 식재료 구매', category: 'goods', typeCode: 'B18', keywords: ['식재료', '급식', '농산물', '축산물', 'eat'] }
];
