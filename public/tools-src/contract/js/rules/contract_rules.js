/**
 * 대한민국 지방계약법 및 2026 서울특별시교육청 계약업무 처리지침 룰 엔진
 * 15대 계약방법 전수 수용 및 실무 검증 로직
 */

import { OFFICIAL_SEN_TYPES } from './items_catalog.js';

// 중앙 요율 및 계약 한도 설정 상수 (Fallback 기본값 안전 보장)
export const CONTRACT_LIMITS = {
  soleSourceGeneral: 20000000,
  soleSourceAffirmative: 50000000,
  contractBondExemption: 50000000,
  smallQuoteGeneralConst: 200000000,
  smallQuoteOtherConst: 160000000,
  goodsSelectionCommittee: 20000000
};

export function updateContractLimitsFromCentral(limits) {
  if (!limits) return;
  if (limits.soleSourceGeneral) CONTRACT_LIMITS.soleSourceGeneral = limits.soleSourceGeneral;
  if (limits.soleSourceAffirmative) CONTRACT_LIMITS.soleSourceAffirmative = limits.soleSourceAffirmative;
  if (limits.contractBondExemption) CONTRACT_LIMITS.contractBondExemption = limits.contractBondExemption;
  if (limits.smallQuoteGeneralConst) CONTRACT_LIMITS.smallQuoteGeneralConst = limits.smallQuoteGeneralConst;
  if (limits.smallQuoteOtherConst) CONTRACT_LIMITS.smallQuoteOtherConst = limits.smallQuoteOtherConst;
  if (limits.goodsSelectionCommittee) CONTRACT_LIMITS.goodsSelectionCommittee = limits.goodsSelectionCommittee;
}

export const CONTRACT_METHODS = {
  // 1. 일반 소액 1인 견적 수의계약
  SOLE_SOURCE_GENERAL: {
    id: 'SOLE_SOURCE_GENERAL',
    title: '1인 견적 수의계약 (일반 소액)',
    platform: '직접제출 / 팩스 / S2B 1인수의',
    platformBadge: '오프라인 / S2B 수의',
    legalClause: '「지방계약법 시행령」 제25조 제1항 제5호 라목 및 제30조 제1항 제1호',
    legalDesc: '추정가격 2천만원 이하인 공사, 물품의 제조·구매, 용역 계약은 1인으로부터 견적서를 받아 수의계약을 체결할 수 있습니다.',
    noticeDays: '해당없음 (공고 생략)',
    lowerRate: '예정가격 이하 견적가 합의',
    guaranteeRate: '면제 가능 (지급확약서 징구 / 계약서 생략 시 승낙사항 대체)',
    signContractRequired: false,
    auditTip: '추정가격 2,000만원 이하에 정확히 부합하는지 확인하고, 동일 예산 비목의 연간 분할수의(쪼개기) 여부를 반드시 점검하십시오.'
  },

  // 2. 취약계층 특례 1인 견적 수의계약 (여성, 장애인, 사회적기업 5천만원 이하)
  SOLE_SOURCE_AFFIRMATIVE: {
    id: 'SOLE_SOURCE_AFFIRMATIVE',
    title: '1인 견적 수의계약 (취약계층기업 특례)',
    platform: '직접제출 / S2B 1인수의',
    platformBadge: '여성·장애인·사회적기업 특례',
    legalClause: '「지방계약법 시행령」 제25조 제1항 제5호 구목 및 「서울시교육청 지침」 제3절 제3호',
    legalDesc: '여성기업, 장애인기업, 또는 취약계층 고용비율(30%)을 충족하는 사회적기업·마을기업 등과는 추정가격 5천만원 이하까지 1인 견적 수의계약이 가능합니다.',
    noticeDays: '해당없음 (공고 생략)',
    lowerRate: '예정가격 이하 견적가 합의',
    guaranteeRate: '면제 가능 (지급확약서 징구 / 계약서 작성 시)',
    signContractRequired: false,
    auditTip: '계약체결일 기준 유효한 여성기업/장애인기업 확인서(중기부 발급) 또는 사회적경제기업 인증 서류를 필히 징구해야 합니다.'
  },

  // 2-2. 중증장애인생산품 생산시설 수의계약 (금액 한도 없음)
  SOLE_SOURCE_DISABLED_FACILITY: {
    id: 'SOLE_SOURCE_DISABLED_FACILITY',
    title: '수의계약 (중증장애인생산품 생산시설)',
    platform: '직접제출 / S2B 수의 / 나라장터 수의',
    platformBadge: '중증장애인생산품 (금액한도 없음)',
    legalClause: '「지방계약법 시행령」 제25조 제1항 제7호의2 나목 및 「중증장애인생산품 우선구매 특별법」 제7조 제5항',
    legalDesc: '보건복지부장관의 지정을 받은 중증장애인생산품 생산시설이 직접 생산하는 물품 또는 직접 수행하는 용역은 금액 한도 제한 없이 수의계약을 체결할 수 있습니다.',
    noticeDays: '해당없음 (공고 생략)',
    lowerRate: '예정가격 이하 견적가 협의',
    guaranteeRate: '5천만원 이하 면제(지급확약서) / 5천만원 초과 10% (보증보험증권)',
    signContractRequired: true,
    auditTip: '반드시 보건복지부장관이 발행한 "중증장애인생산품 생산시설 지정서" 및 해당 "직접생산 품목 증명서"를 필히 확인해야 하며, 단순 유통이나 하도급은 절대 불가합니다. (동일업체 연간 4회 제한 적용 제외)'
  },

  // 3. 법정 특정사유 1인 수의계약 (특허, 유찰, 비상재해 등)
  SOLE_SOURCE_STATUTORY: {
    id: 'SOLE_SOURCE_STATUTORY',
    title: '1인 견적 수의계약 (법정 특정사유)',
    platform: '직접제출 / G2B 수의',
    platformBadge: '법정 특정사유 수의',
    legalClause: '「지방계약법 시행령」 제25조 제1항 제1호 ~ 제4호',
    legalDesc: '특허공법·신기술을 보유한 유일업체, 경쟁입찰 2회 유찰, 비상재해 긴급복구 등 법령이 정한 특수사유에 의거하여 1인 견적 수의계약을 체결합니다.',
    noticeDays: '해당없음',
    lowerRate: '예정가격 이하 견적가 협의',
    guaranteeRate: '10% (5천만원 초과 시 이행보증증권)',
    signContractRequired: true,
    auditTip: '수의계약 사유서와 증빙자료(특허증, 형식승인서, 유찰공고문 등)를 기안문에 철저히 첨부해야 감사 지적을 피할 수 있습니다.'
  },

  // 4. 지정정보처리장치(G2B 나라장터 / S2B 학교장터) 2인 이상 견적제출 수의계약
  ELECTRONIC_QUOTATION: {
    id: 'ELECTRONIC_QUOTATION',
    title: '지정정보처리장치 2인 이상 견적제출 수의계약',
    platform: 'G2B 나라장터(기본·원칙) / S2B 학교장터(선택)',
    platformBadge: 'G2B 나라장터(기본) · S2B 학교장터',
    legalClause: '「지방계약법 시행령」 제30조 제2항 및 「행정안전부 예규」 제5장 수의계약 운영요령',
    legalDesc: '추정가격 2천만원 초과 소액계약은 법정 기본 시스템인 국가종합전자조달(G2B 나라장터) 또는 교육기관 전자조달시스템(S2B 학교장터)을 통해 2인 이상 견적서를 제출받아 법정 낙찰하한율(공사 89.745%, 용역·물품 88%, 도서 90%) 이상 최저가 제출자를 계약상대자로 결정합니다.',
    noticeDays: '최소 3일 이상 (토·공휴일 제외)',
    lowerRate: '공사 89.745% / 용역·물품 88% (결격사유 없는 최저가)',
    guaranteeRate: '5천만원 이하 면제(지급확약서) / 5천만원 초과 10%',
    signContractRequired: true,
    auditTip: '지정정보처리장치 이용 시 G2B(나라장터)가 법률상 기본 원칙이며, 각급 학교는 조달 편의에 따라 S2B(학교장터)를 선택하여 활용할 수 있습니다. (공고기간 최소 3일 이상 준수)'
  },

  // 5. G2B 고액 소액수의 견적공고 (전문공사 1억~2억 등)
  G2B_ELECTRONIC_QUOTATION: {
    id: 'G2B_ELECTRONIC_QUOTATION',
    title: 'G2B(나라장터) 2인 이상 견적제출 수의계약',
    platform: 'G2B 나라장터 (국가종합전자조달)',
    platformBadge: 'G2B 나라장터 전용',
    legalClause: '「지방계약법 시행령」 제30조 제2항 및 「행정안전부 예규」 제5장',
    legalDesc: '전문공사 1억원~2억원 이하 등 S2B 허용 범위를 초과하거나 기관 특성상 G2B 전용으로 추진하는 사업은 국가종합전자조달시스템(G2B)을 통해 2인 이상 전자견적 공고를 진행합니다.',
    noticeDays: '최소 3일 이상 (긴급 시) ~ 5일',
    lowerRate: '공사 89.745% / 용역·물품 88% (전문공사/용역/물품)',
    guaranteeRate: '10% (계약보증금 납부)',
    signContractRequired: true,
    auditTip: 'G2B 공고 등록 시 면허코드 및 업종제한을 신중히 선택하고, 시설공사의 경우 낙찰하한율이 89.745%(A값 감액 산식)임을 공고문에 명시하십시오.'
  },

  // 6. 조달청 제3자단가 / 다수공급자계약 (MAS)
  PROCUREMENT_MAS: {
    id: 'PROCUREMENT_MAS',
    title: '나라장터 종합쇼핑몰 구매 (제3자단가 / 쇼핑몰 직접구매)',
    platform: '나라장터 종합쇼핑몰',
    platformBadge: '쇼핑몰 즉시 납품요구',
    legalClause: '「조달사업에 관한 법률」 제12조 및 「지방계약법 시행령」 제25조 제1항 제5호 마목',
    legalDesc: '조달청 나라장터 종합쇼핑몰에 이미 단가계약 체결된 물품을 학교에서 바로 납품요구(구매)합니다. 제3자 단가계약 및 1억원 미만 중기간물품(PC, 가구 등)은 복잡한 2단계 경쟁 없이 물품선정위원회 심의 후 쇼핑몰에서 특정 규격을 직접 구매할 수 있습니다.',
    noticeDays: '쇼핑몰 즉시 납품요구 (학교 현장은 대부분 1억 미만으로 2단계경쟁 없음)',
    lowerRate: '조달청 등록단가 (쇼핑몰 고시가격)',
    guaranteeRate: '조달청 일괄 처리',
    signContractRequired: false,
    auditTip: '💡 일반 학교 실무 팁: 학교 단위에서는 1회 구매액이 1억원을 초과하는 경우가 거의 없어 MAS 2단계 경쟁을 할 일이 없습니다. 2,000만원 초과 물품은 교내 「물품선정위원회」 회의록만 갖추어 쇼핑몰에서 바로 주문(납품요구)하시면 감사 지적 없이 완벽합니다.'
  },

  // 7. 2단계 입찰 (규격-가격 분리/동시 입찰 - 교복, 앨범, 수련활동 등)
  TWO_STAGE_BIDDING: {
    id: 'TWO_STAGE_BIDDING',
    title: '2단계 입찰 (규격·가격 동시입찰)',
    platform: '나라장터 (G2B) / S2B',
    platformBadge: '교육청 필수 2단계 입찰',
    legalClause: '「지방계약법 시행령」 제18조 및 「서울시교육청 지침」 제4절',
    legalDesc: '교복 학교주관구매, 졸업앨범, 학생 수련활동 등 품질 확보가 필수적인 사업은 1단계 제안서(규격/품평회) 평가 적격자에 한하여 2단계 가격개찰을 실시합니다.',
    noticeDays: '최소 7일 ~ 14일 이상 (제안서 제출기간 고려)',
    lowerRate: '예정가격 이하 최저가 (규격평가 통과자 중)',
    guaranteeRate: '입찰보증금(5%) 및 계약보증금(10%)',
    signContractRequired: true,
    auditTip: '제안서 평가위원회(품평회) 구성 시 학부모 위원 참여 비율을 준수하고, 블라인드 평가 규정을 반드시 지켜야 합니다.'
  },

  // 8. 협상에 의한 계약 (정보화, 교육위탁, 용역 등)
  NEGOTIATED_CONTRACT: {
    id: 'NEGOTIATED_CONTRACT',
    title: '협상에 의한 계약',
    platform: '나라장터 (G2B)',
    platformBadge: '제안서 평가 (정량+정성)',
    legalClause: '「지방계약법 시행령」 제43조 및 「지방자치단체 입찰시 낙찰자 결정기준」 제7장',
    legalDesc: '기획력, 전문기술, 창의성이 요구되는 교육정보화 용역이나 프로그램 위탁사업 등에서 제안서 평가(기술 80% + 가격 20%)를 거쳐 우선협상대상자를 선정합니다.',
    noticeDays: '최소 20일 이상 (긴급 시 10일)',
    lowerRate: '기술평가 85% 이상자 중 종합평점 1순위와 가격협상',
    guaranteeRate: '10%',
    signContractRequired: true,
    auditTip: '제안서평가위원회를 외부 전문가 과반수로 구성하고, 평가위원 명단 및 평가점수는 교육청 지침에 따라 투명하게 공개해야 합니다.'
  },

  // 9. 제한경쟁입찰 (지역제한 / 실적제한 적격심사)
  LIMITED_COMPETITIVE_BID: {
    id: 'LIMITED_COMPETITIVE_BID',
    title: '제한경쟁입찰 (지역제한·적격심사)',
    platform: '나라장터 (G2B)',
    platformBadge: '경쟁입찰 (적격심사)',
    legalClause: '「지방계약법」 제9조 및 시행령 제20조, 제42조',
    legalDesc: '추정가격이 소액수의 범위를 초과하는 공사/용역/물품 사업으로, 서울특별시 관내 업체로 지역을 제한하고 적격심사를 거쳐 낙찰자를 결정합니다.',
    noticeDays: '7일 이상 (긴급 5일, 고시금액 이상 40일)',
    lowerRate: '적격심사 통과 최저가 (낙찰하한율 87.745% ~ 88%)',
    guaranteeRate: '10%',
    signContractRequired: true,
    auditTip: '지역제한 설정 시 본점 소재지 기준(서울특별시)을 공고일 전일부터 계약체결일까지 유지하는 조건으로 공고하십시오.'
  },

  // 10. 학교급식 전자조달 (eaT)
  MEAL_SERVICE_EAT: {
    id: 'MEAL_SERVICE_EAT',
    title: '학교급식 전자조달시스템(eaT) 계약',
    platform: '학교급식 전자조달시스템 (eaT)',
    platformBadge: 'eaT 식재료 조달',
    legalClause: '「학교급식법」 및 「지방계약법 시행령」 제30조',
    legalDesc: '학교 급식용 농·수·축산물 및 가공 식재료는 안전성과 위생 확보를 위해 aT 농수산식품유통공사 학교급식 전자조달시스템(eaT)을 통해 계약을 체결합니다.',
    noticeDays: 'eaT 운영 규정에 따름 (3일~5일)',
    lowerRate: '제출 견적 최저가',
    guaranteeRate: '10%',
    signContractRequired: true,
    auditTip: '납품업체의 HACCP 인증 및 냉동/냉장 배송차량 등록 여부를 반드시 사전에 점검하십시오.'
  }
};

/**
 * 계약방법 판별 룰 엔진 (Rule Engine)
 */
export function evaluateContractMethod(params) {
  const {
    category,         // 'construction' | 'service' | 'goods'
    typeCode,         // 계약길잡이 공식 20개 코드 (B15, B36, B07~B40, B01~B18)
    estimatedPrice,   // 추정가격 (VAT 제외, 원 단위)
    targetPlatform = 'G2B', // 'G2B' (기본·원칙) | 'S2B' (학교선택)
    isFemaleCompany = false,
    isHandicapped = false,
    isSocialEnterprise = false,
    isSevereDisabledFacility = false,
    hasSpecialReason = false,
    specialReasonType = '',
    isMasAvailable = false,
    annualAccumulatedPrice = 0,
    vendorCountThisYear = 0
  } = params;

  let selectedMethod = null;
  const auditWarnings = [];

  // 1. 감사 안전 경보 (Red Flags) 체크
  const totalCombinedPrice = estimatedPrice + annualAccumulatedPrice;
  if (annualAccumulatedPrice > 0 && totalCombinedPrice > 20000000 && estimatedPrice <= 20000000) {
    auditWarnings.push({
      type: 'SPLIT_CONTRACT',
      title: '분할 수의계약(쪼개기) 주의 경보!',
      message: `이번 건은 2천만원 이하이나, 동일 비목 연간 누적액(${totalCombinedPrice.toLocaleString()}원)이 2천만원을 초과합니다. 정당한 시기 분할 사유가 없다면 1인 수의 시 감사 지적 대상이 될 수 있으므로 2인 이상 견적제출 수의를 강력 권장합니다.`
    });
  }

  if (vendorCountThisYear >= 4 && !isSevereDisabledFacility) {
    auditWarnings.push({
      type: 'VENDOR_FREQUENCY',
      title: '동일업체 수의계약 연간 4회 제한 초과!',
      message: `서울시교육청 계약업무 처리지침에 따라 동일업체와의 수의계약(5백만원 이상)은 회계연도 중 4회로 제한됩니다. (현재 ${vendorCountThisYear}회 집행 완료). 다른 업체를 선정하거나 전자견적 공고를 진행하십시오.`
    });
  }

  // 2. 계약길잡이 공식 특화 유형 룰 우선 적용 (중증장애인생산시설 특례는 물품·용역 한정, 공사 제외)
  if (isSevereDisabledFacility && category !== 'construction') {
    // 중증장애인생산품 우선구매 특별법 제7조제5항 및 지방계약법 시행령 제25조제1항제7호의2: 금액 한도 없는 수의계약
    selectedMethod = CONTRACT_METHODS.SOLE_SOURCE_DISABLED_FACILITY;
  } else if (typeCode === 'B02') {
    // 교복구매 -> 필수 2단계 입찰
    selectedMethod = CONTRACT_METHODS.TWO_STAGE_BIDDING;
  } else if (typeCode === 'B03') {
    // 조달구매 -> 나라장터 쇼핑몰 MAS
    selectedMethod = CONTRACT_METHODS.PROCUREMENT_MAS;
  } else if (typeCode === 'B01' || typeCode === 'B18') {
    // 우유급식 및 식재료 -> 2천만원 초과 시 eaT 또는 S2B 전자견적
    if (estimatedPrice > 20000000) {
      selectedMethod = CONTRACT_METHODS.MEAL_SERVICE_EAT;
    } else {
      selectedMethod = CONTRACT_METHODS.SOLE_SOURCE_GENERAL;
    }
  } else if (typeCode === 'B05' && estimatedPrice > 20000000) {
    // 졸업앨범 2천만원 초과 시 2단계 입찰
    selectedMethod = CONTRACT_METHODS.TWO_STAGE_BIDDING;
  } else if ((typeCode === 'B09' || typeCode === 'B10') && estimatedPrice > 20000000) {
    // 늘봄 프로그램, 컴퓨터교실 2천만원 초과 시 협상에 의한 계약
    selectedMethod = CONTRACT_METHODS.NEGOTIATED_CONTRACT;
  } else if (hasSpecialReason && (specialReasonType === 'patent' || specialReasonType === 'failed_bids' || specialReasonType === 'disaster')) {
    selectedMethod = CONTRACT_METHODS.SOLE_SOURCE_STATUTORY;
  }

  // 3. 일반 금액 기준 룰 트리
  if (!selectedMethod) {
    const isAffirmative = isFemaleCompany || isHandicapped || isSocialEnterprise;

    if (estimatedPrice <= 20000000) {
      selectedMethod = CONTRACT_METHODS.SOLE_SOURCE_GENERAL;
    } else if (estimatedPrice <= 50000000) {
      if (isAffirmative) {
        selectedMethod = CONTRACT_METHODS.SOLE_SOURCE_AFFIRMATIVE;
      } else {
        selectedMethod = CONTRACT_METHODS.ELECTRONIC_QUOTATION;
      }
    } else if (estimatedPrice <= 100000000) {
      selectedMethod = CONTRACT_METHODS.ELECTRONIC_QUOTATION;
    } else if (category === 'construction') {
      const isOtherConst = ['B36_ELEC', 'B36_COMM', 'B36_FIRE'].includes(typeCode); // 전기·통신·소방 (기타공사: 법정 한도 1.6억원)
      // 전문건설(B15), 가스시설(B36_GAS), 승강기(B36_LIFT), 석면해체(B36_ASBESTOS)는 건산법상 전문공사 한도 2억원 적용
      const smallLimit = isOtherConst ? 160000000 : 200000000;
      if (estimatedPrice <= smallLimit) {
        selectedMethod = CONTRACT_METHODS.G2B_ELECTRONIC_QUOTATION;
      } else {
        selectedMethod = CONTRACT_METHODS.LIMITED_COMPETITIVE_BID;
      }
    } else {
      selectedMethod = CONTRACT_METHODS.LIMITED_COMPETITIVE_BID;
    }
  }

  // 플랫폼 선택에 따른 표시 세부 튜닝
  let displayMethod = { ...selectedMethod };
  if (selectedMethod.id === 'ELECTRONIC_QUOTATION') {
    if (targetPlatform === 'G2B') {
      displayMethod.platform = 'G2B 나라장터 (국가종합전자조달 - 법정 기본·원칙)';
      displayMethod.platformBadge = 'G2B 나라장터 (법정 기본·원칙)';
    } else {
      displayMethod.platform = 'S2B 학교장터 (교육기관 전자조달시스템 - 학교 조달 편의)';
      displayMethod.platformBadge = 'S2B 학교장터 (선택)';
    }
  }

  // 4. 구비서류 목록 및 사유서 텍스트 생성
  const typeObj = getTypeNameByCode(typeCode);
  const typeName = typeObj ? typeObj.name : '일반';

  const requiredDocs = generateRequiredDocsList(category, selectedMethod.id, estimatedPrice, typeCode);
  const memoText = generateDraftMemoText({
    category,
    typeName,
    typeCode,
    estimatedPrice,
    selectedMethod: displayMethod,
    targetPlatform,
    isFemaleCompany,
    auditWarnings,
    requiredDocs
  });

  return {
    method: displayMethod,
    auditWarnings,
    requiredDocs,
    memoText,
    typeCode,
    typeName,
    targetPlatform,
    estimatedPrice,
    vatPrice: Math.round(estimatedPrice * 0.1),
    totalPrice: Math.round(estimatedPrice * 1.1)
  };
}

export function getTypeNameByCode(code) {
  for (const cat of ['construction', 'service', 'goods']) {
    const found = OFFICIAL_SEN_TYPES[cat].find(t => t.code === code);
    if (found) return found;
  }
  return null;
}

function generateRequiredDocsList(category, methodId, price, typeCode) {
  const docs = [];
  const isSoleSource = methodId.startsWith('SOLE_SOURCE');
  const isElectronicQuote = methodId.includes('ELECTRONIC_QUOTATION');
  const isCompetitive = methodId.includes('COMPETITIVE') || methodId.includes('TWO_STAGE') || methodId === 'NEGOTIATED_CONTRACT';
  const isMAS = methodId === 'PROCUREMENT_MAS';

  // ==========================================
  // [1단계: 계약 체결 단계 서류]
  // ==========================================
  const stage1 = '1. 계약 체결 단계';

  // 1-1. 계약서 / 승낙사항
  if (isSoleSource && price <= 50000000) {
    docs.push({
      stage: stage1,
      name: '계약서 (또는 승낙사항 대체)',
      basis: '지방계약법 시행령 제50조 / 서울특별시 학교회계규칙 제32조의2',
      required: true,
      exemptible: true,
      exemptReason: price <= 1000000
        ? '5천만 원 이하 승낙사항 대체 가능하며, 특히 100만 원 이하는 승낙사항 공급자 날인도 생략 가능 (서울시교육청 서류간소화, 학교회계규칙 제32조의2)'
        : '5천만 원 이하 정식 계약서 대신 승낙사항(주문서) 대체 가능 (학교회계규칙 제32조의2)',
      note: price <= 1000000 ? '100만 원 이하 공급자 날인 생략' : '승낙사항 또는 주문서 대체'
    });
  } else if (isElectronicQuote) {
    docs.push({
      stage: stage1,
      name: '표준계약서 (G2B/S2B 전자계약서)',
      basis: '지방자치단체 입찰 및 계약 집행기준 제5장',
      required: true,
      exemptible: false,
      note: '전자조달시스템 전자서명 체결'
    });
  } else if (isMAS) {
    docs.push({
      stage: stage1,
      name: '나라장터 종합쇼핑몰 납품요구서 (계약서)',
      basis: '조달사업에 관한 법률 제12조 및 동법 시행령',
      required: true,
      exemptible: false,
      note: '조달청 MAS 계약 체결서류'
    });
  } else {
    docs.push({
      stage: stage1,
      name: '표준계약서 (지방계약법 시행령 제50조)',
      basis: '지방계약법 시행령 제50조 (계약서의 작성 및 구비서류)',
      required: true,
      exemptible: false,
      note: '정식 계약서 작성 필수'
    });
  }

  // 1-2. 견적서 / 낙찰자 결정 서류 / 적격심사
  if (isSoleSource) {
    docs.push({
      stage: stage1,
      name: '견적서 및 산출내역서',
      basis: '지방계약법 시행령 제30조 / 시행규칙 제33조',
      required: price >= 1000000,
      exemptible: price < 1000000,
      exemptReason: price < 1000000 ? '추정가격 100만 원 이하 견적서 징구 생략 가능 (지방계약법 시행규칙 제33조 제2항, 서울시교육청 서류간소화)' : '',
      note: '공급자 날인 견적서 (100만 원 이하 생략 가능)'
    });
  } else if (isElectronicQuote) {
    docs.push({
      stage: stage1,
      name: '최종 견적서 (또는 개찰결과서/낙찰통보서)',
      basis: '지방자치단체 입찰 및 계약 집행기준 제5장 (수의계약 운영요령)',
      required: true,
      exemptible: false,
      note: '88% 이상 최저가 제출자'
    });
    if (category === 'service' || category === 'goods') {
      docs.push({
        stage: stage1,
        name: '소기업·소상공인 확인서 / 중기업 확인서',
        basis: '중소기업제품 구매촉진 및 판로지원에 관한 법률 시행령 제2조의2',
        required: true,
        exemptible: true,
        exemptReason: price <= 20000000 ? '추정가격 2천만원 이하 생략 가능 (SMPP 확인 시 징구 생략)' : '공공구매종합정보(SMPP) 전산 확인 시 생략 가능',
        note: '판로지원법 시행령 제2조의2'
      });
    }
  } else if (isCompetitive) {
    docs.push({
      stage: stage1,
      name: '낙찰통보서 및 산출내역서',
      basis: '지방계약법 시행령 제40조',
      required: true,
      exemptible: false
    });
    docs.push({
      stage: stage1,
      name: '적격심사 신청서 및 심사서류 (실적증명, 신용평가)',
      basis: '행정안전부 예규 「지방자치단체 입찰시 낙찰자 결정기준」',
      required: true,
      exemptible: false,
      note: '지자체 입찰시 낙찰자 결정기준'
    });
  }

  // 1-3. 서약서 (2026 서울시교육청 「수의계약 통합서약서」 표준서식 전면 적용)
  if (isSoleSource || isElectronicQuote) {
    docs.push({
      stage: stage1,
      name: '수의계약 통합서약서 (청렴·체결제한·결격사유 통합 1종)',
      downloadUrl: '/forms/contract/수의계약_통합서약서.hwpx',
      downloadFileName: '2026_수의계약_통합서약서.hwpx',
      basis: '2026 서울특별시교육청 계약업무 경감 및 청렴도 향상 안내(교육재정과-26194)',
      required: true,
      exemptible: false,
      note: '2026 서울시교육청 표준서식 (기존 청렴서약서, 수의계약체결제한확인서, 조세포탈서약서, 수의계약각서 등 10종 서류를 1종으로 통합 일원화, S2B/G2B 연동)'
    });
  } else {
    docs.push({
      stage: stage1,
      name: '청렴서약서 (일반입찰용)',
      basis: '지방계약법 제6조의2 (청렴서약제)',
      required: true,
      exemptible: false,
      note: '지방계약법 제6조의2'
    });
    docs.push({
      stage: stage1,
      name: '조세포탈 등 결격사유 확인 서약서',
      basis: '지방계약법 제31조의5 및 동법 시행령 제93조',
      required: true,
      exemptible: false,
      note: '지방계약법 제31조의5 및 시행령 제93조'
    });
    docs.push({
      stage: stage1,
      name: '입찰보증금 지급확약서 (또는 입찰보증보험증권)',
      basis: '지방계약법 시행령 제37조 (입찰보증금)',
      required: true,
      exemptible: false,
      note: '입찰금액의 5% 이상'
    });
  }

  // 1-4. 사업자 기본 서류
  docs.push({
    stage: stage1,
    name: '사업자등록증 사본',
    basis: '부가가치세법 제8조 / 전자정부법 제36조 (행정정보공동이용)',
    required: true,
    exemptible: true,
    exemptReason: '행정정보공동이용 또는 G2B 등록정보 확인 시 생략 가능'
  });
  docs.push({
    stage: stage1,
    name: '통장 사본 (대금 수령용 실명계좌)',
    basis: '서울특별시교육비특별회계 재무회계규칙 제73조',
    required: true,
    exemptible: true,
    exemptReason: '사업자등록증명 또는 나라장터 등록계좌 확인 시 생략 가능'
  });

  // 1-5. 계약보증금 (지방계약법 시행령 제53조, 서울시교육청 지침 [붙임4])
  if ((isSoleSource || isElectronicQuote) && price <= 50000000) {
    docs.push({
      stage: stage1,
      name: '계약보증금 지급확약서 (또는 면제)',
      basis: '지방계약법 시행령 제53조 제1항 제2호 (5천만 원 이하 보증금 면제)',
      required: true,
      exemptible: true,
      exemptReason: '계약금액 5천만원 이하 면제 가능하며, 계약서 미작성(승낙사항/주문서 대체) 시에는 지급확약서 징구도 생략 가능 (지침 [붙임4])',
      note: '정식 계약서 작성 시에만 지급확약서 징구'
    });
  } else {
    docs.push({
      stage: stage1,
      name: '계약보증금 납부서 (보증보험증권)',
      basis: '지방계약법 시행령 제51조 (계약보증금)',
      required: true,
      exemptible: false,
      note: '계약금액의 10% 증권 징구 필수 (한시적 특례 시 5%)'
    });
  }

  // 1-6. 인지세 (인지세법 제3조)
  // 도급문서(공사, 용역) 및 물품 제조(B02 교복, B04 제조, B05 앨범 등) 과세, 단순 완제품 규격물품(B01 우유, B03 조달, B06 도서, B16 기성품, B18 식재료) 비과세
  const isManufactureOrWork = category === 'construction' || category === 'service' || (category === 'goods' && ['B02', 'B04', 'B05'].includes(typeCode));

  if (!isManufactureOrWork) {
    docs.push({
      stage: stage1,
      name: '인지세 비과세',
      basis: '인지세법 제3조 제1항 (기성 완제품 매매계약 비과세)',
      required: false,
      exemptible: true,
      exemptReason: '기성 완제품 규격물품 구매는 인지세법상 비과세 (인지세법 제3조)'
    });
  } else if (price <= 10000000) {
    docs.push({
      stage: stage1,
      name: '인지세 비과세',
      basis: '인지세법 제3조 제1항 제3호 (1천만 원 이하 비과세)',
      required: false,
      exemptible: true,
      exemptReason: '계약금액 1천만원 이하 비과세 (인지세법 제3조)'
    });
  } else {
    let taxAmount = '20,000원';
    if (price > 100000000) taxAmount = '150,000원';
    else if (price > 50000000) taxAmount = '70,000원';
    else if (price > 30000000) taxAmount = '40,000원';

    docs.push({
      stage: stage1,
      name: `인지세 납부영수증 (${taxAmount})`,
      basis: '인지세법 제3조 및 동법 시행령 제2조의3',
      required: true,
      exemptible: false,
      note: '국세청 홈택스 전자납부 후 영수증 첨부'
    });
  }

  // 1-7. 특례/품목별 계약체결 추가서류
  if (methodId === 'SOLE_SOURCE_AFFIRMATIVE') {
    docs.push({
      stage: stage1,
      name: '여성기업 / 장애인기업 확인서 또는 사회적경제기업 인증서',
      basis: '여성기업지원법 제2조 / 장애인기업활동촉진법 제2조 / 사회적기업육성법 제2조',
      required: true,
      exemptible: false,
      note: '중기부 발행 (계약체결일 기준 유효기간 확인 필수)'
    });
  } else if (methodId === 'SOLE_SOURCE_DISABLED_FACILITY') {
    docs.push({
      stage: stage1,
      name: '중증장애인생산품 생산시설 지정서 및 직접생산 확인서',
      basis: '중증장애인생산품 우선구매 특별법 제7조 제5항 (금액 무제한 수의계약)',
      required: true,
      exemptible: false,
      note: '보건복지부 지정 (지정품목 직접생산 확인 필수, 금액 무제한 수의계약 근거)'
    });
  }

  if (category === 'goods' && price > 20000000 && typeCode !== 'B02') {
    // 2026.9 서울시교육청 물품선정위원회 규정 제3조(개최대상 및 생략사유):
    // 1회 구매총액 추정가격 2천만 원 초과 시 필수. 단, 식자재(B18, B01), 소모품, 관급자재, 별도 위원회 선정품목은 생략 가능
    const isExemptGoods = ['B18', 'B01'].includes(typeCode);
    docs.push({
      stage: stage1,
      name: '물품선정위원회 심의결과서 (회의록, 평가표, 청렴·보안서약서)',
      basis: '서울특별시교육청 물품선정위원회 운영 규정(2026.9 개정) 제3조 및 제8조',
      required: !isExemptGoods,
      exemptible: isExemptGoods,
      exemptReason: isExemptGoods
        ? '식자재·소모품·정형화된 규격 또는 별도 위원회(급식소위 등)를 통해 선정된 물품은 물품선정위원회 심의 생략 가능 (2026.9 규정 제3조)'
        : '추정가격 2,000만 원 초과 물품 구매 시 물품선정위원회 심의 필수 (위원 5~10인, 외부위원 1/2 이상, 청렴·보안 통합서약서 징구 필수)',
      note: '2026.9 서울시교육청 물품선정위원회 운영 규정'
    });
  }

  if (typeCode === 'B02') { // 교복구매 (정확한 매칭)
    docs.push({
      stage: stage1,
      name: '교복선정위원회 심의결과서 및 제안서 평가표',
      basis: '초·중등교육법 제32조 및 서울시교육청 학교주관구매 요령',
      required: true,
      exemptible: false,
      note: '2단계 입찰 규격평가(품평회) 결과서'
    });
    docs.push({
      stage: stage1,
      name: '공인시험기관 원단 검사성적서 (Q마크 등)',
      basis: '국가기술표준원 안전기준 준수 확인',
      required: true,
      exemptible: false,
      note: '한국의류시험연구원 등 품질기준 충족 확인'
    });
  } else if (typeCode === 'B01') { // 우유급식 (정확한 매칭)
    docs.push({
      stage: stage1,
      name: '축산물판매업(우유류판매업) 신고필증 및 HACCP 인증서',
      basis: '축산물 위생관리법 제24조 및 제9조',
      required: true,
      exemptible: false,
      note: '축산물 위생관리법 기준 준수'
    });
    docs.push({
      stage: stage1,
      name: '배송차량 소독필증 및 냉장차량 운행일지',
      basis: '학교급식 위생관리지침서 (콜드체인)',
      required: true,
      exemptible: false,
      note: '콜드체인 위생 점검 서류'
    });
  } else if (typeCode === 'B05') { // 졸업앨범
    docs.push({
      stage: stage1,
      name: '개인정보보호 보안각서 및 저작권·초상권 서약서',
      basis: '개인정보 보호법 제15조 및 저작권법',
      required: true,
      exemptible: false,
      note: '학생 개인정보 및 사진 초상권 보호'
    });
    docs.push({
      stage: stage1,
      name: '졸업앨범 선정위원회(품평회) 평가표',
      basis: '초·중등교육법 제32조 (학교운영위원회 자문)',
      required: true,
      exemptible: false,
      note: '사양 및 인쇄 품질 평가'
    });
  } else if (typeCode === 'B18') { // 🥩 학교급식 식재료
    docs.push({
      stage: stage1,
      name: '집단급식소 식품판매업 영업신고증 및 영업(생산물)배상책임보험',
      basis: '식품위생법 제37조 및 학교급식법 제10조',
      required: true,
      exemptible: false,
      note: '식품위생법 제37조에 따른 영업신고 및 사고 대비 보험 가입 확인'
    });
    docs.push({
      stage: stage1,
      name: '식재료 원산지증명서 및 축산물 등급판정확인서',
      basis: '농수산물의 원산지 표시 등에 관한 법률 제5조, 축산물 위생관리법',
      required: true,
      exemptible: false,
      note: '친환경 및 우수식재료 검증'
    });
    docs.push({
      stage: stage1,
      name: '냉장·냉동 배송차량 등록증 및 소독필증 사본',
      basis: '학교급식법 시행규칙 [별표 4] (식재료 품질관리기준)',
      required: true,
      exemptible: false,
      note: '콜드체인 적정온도 유지 및 위생 소독 점검'
    });
  } else if (typeCode === 'B20' || typeCode === 'B09' || typeCode === 'B10') { // 🏫 방과후학교 / 늘봄 / 컴퓨터교실
    docs.push({
      stage: stage1,
      name: '학교운영위원회(방과후 소위) 심의결과서',
      basis: '초·중등교육법 제32조, 서울시교육청 방과후학교 운영 가이드라인',
      required: true,
      exemptible: false,
      note: '프로그램 개설, 수강료, 업체선정 심의 결과 (방과후학교 가이드라인)'
    });
    docs.push({
      stage: stage1,
      name: '강사 채용 증빙서류 (이력서, 최종학력증명서, 자격증 사본)',
      basis: '서울특별시교육청 방과후학교 및 늘봄학교 운영지침',
      required: true,
      exemptible: false,
      note: '프로그램 지도 강사 자격 검증'
    });
    docs.push({
      stage: stage1,
      name: '강사 성범죄 경력조회 및 아동학대 관련 범죄전력조회 동의서',
      basis: '아동·청소년의 성보호에 관한 법률 제56조, 아동복지법 제54조',
      required: true,
      exemptible: false,
      note: '아동·청소년의 성보호에 관한 법률 제56조 (학생 대면 필수 법정 의무)'
    });
    docs.push({
      stage: stage1,
      name: '강사 채용신체검사서 (또는 보건증)',
      basis: '학교보건법 및 감염병의 예방 및 관리에 관한 법률',
      required: true,
      exemptible: false,
      note: '결핵 및 전염성 질환 검진 확인 (유효기간 내)'
    });
    docs.push({
      stage: stage1,
      name: '개인정보보호 보안서약서 (대표자 및 강사 전원)',
      basis: '개인정보 보호법 제59조 (금지행위) 준수',
      required: true,
      exemptible: false,
      note: '학생 명단, 출결, 학부모 연락처 유출 방지 서약'
    });
    docs.push({
      stage: stage1,
      name: '강사료 및 위탁수수료율 산출내역서',
      basis: '서울특별시교육청 방과후학교 길라잡이 (위탁수수료율 투명성)',
      required: true,
      exemptible: false,
      note: '수수료율 상한 준수 및 강사료 적정 지급 확인'
    });
  } else if (typeCode === 'B07') { // 🚌 전세버스 임차용역 (현장체험학습)
    docs.push({
      stage: stage1,
      name: '여객자동차운송사업등록증 사본',
      basis: '여객자동차 운수사업법 제4조',
      required: true,
      exemptible: false,
      note: '전세버스운송사업 면허 확인'
    });
    docs.push({
      stage: stage1,
      name: '자동차등록원부 및 차량종합보험(공제) 가입증명서',
      basis: '여객자동차 운수사업법 시행규칙 제14조',
      required: true,
      exemptible: false,
      note: '대인배상 무한 가입 및 정기검사 유효기간 확인 필수'
    });
    docs.push({
      stage: stage1,
      name: '직영차량 운행 각서',
      basis: '★2026학년도 현장체험학습 길라잡이 (지입차량 운행 금지)',
      required: true,
      exemptible: false,
      note: '지입차량 운행 금지 확약 (적발 시 계약 즉시 해지)'
    });
    docs.push({
      stage: stage1,
      name: '전세버스 교통안전정보 조회결과 통보서',
      basis: '여객자동차 운수사업법 제26조, ★2026학년도 현장체험학습 길라잡이',
      required: true,
      exemptible: false,
      note: 'TS한국교통안전공단 발행 (문서확인번호 전산 진위검증 필수, 차령·사고이력 조회)'
    });
    docs.push({
      stage: stage1,
      name: '운전자 성범죄 및 아동학대 관련 범죄전력조회 동의서 (또는 업체 확인서)',
      basis: '아동·청소년의 성보호에 관한 법률 제56조, ★2026학년도 현장체험학습 길라잡이',
      required: false,
      exemptible: true,
      exemptReason: '「아동청소년성보호법」상 학교 취업자가 아닌 1회성 전세버스 기사는 법정 의무조회 대상에 명시되지 않아 학교별 자체 규정이나 운송업체 성범죄 결격사유 부존재 확인서로 갈음 가능 (단, 정기 스쿨버스·통학버스는 의무 징구)',
      note: '학교 선택사항 (스쿨버스는 필수, 일일 전세버스는 확인서 갈음 가능)'
    });
    docs.push({
      stage: stage1,
      name: '운전자 무사고 증명서 및 운전면허증 사본',
      basis: '★2026학년도 현장체험학습 길라잡이 [STEP 6]',
      required: true,
      exemptible: false,
      note: '대형면허 적격 운전자 확인'
    });
    if (price >= 10000000) {
      docs.push({
        stage: stage1,
        name: '직접생산확인증명서 (기타도로여객운송서비스)',
        basis: '중소기업제품 구매촉진 및 판로지원에 관한 법률 제9조',
        required: true,
        exemptible: false,
        note: '중소기업자간 경쟁제품 추정가격 1천만원 이상 시 징구 (세부품명번호: 7811189904)'
      });
    }
  } else if (typeCode === 'B40') { // 🚸 스쿨버스 운행용역 (통학버스)
    docs.push({
      stage: stage1,
      name: '어린이통학버스 신고필증 사본',
      basis: '도로교통법 제52조 (어린이통학버스의 신고)',
      required: true,
      exemptible: false,
      note: '관할 경찰서장 발행 (도로교통법 제52조 준수)'
    });
    docs.push({
      stage: stage1,
      name: '여객자동차운송사업등록증 (또는 자가용 유상운송허가증)',
      basis: '여객자동차 운수사업법 제4조 및 제81조',
      required: true,
      exemptible: false,
      note: '합법적 유상운송 면허 확인'
    });
    docs.push({
      stage: stage1,
      name: '자동차등록원부 및 차량종합보험(공제) 증명서',
      basis: '여객자동차 운수사업법 시행규칙 제14조',
      required: true,
      exemptible: false,
      note: '대인배상 무한 가입 필수'
    });
    docs.push({
      stage: stage1,
      name: '직영차량 운행 각서 및 차량 일일안전점검표',
      basis: '도로교통법 제53조의3, 서울시교육청 학생안전 매뉴얼',
      required: true,
      exemptible: false,
      note: '정기 점검 및 안전운행 확약'
    });
    docs.push({
      stage: stage1,
      name: '운전자 및 동승보호자(안전지도원) 성범죄·아동학대 범죄전력조회 동의서',
      basis: '아동복지법 제54조, 아동·청소년의 성보호에 관한 법률 제56조',
      required: true,
      exemptible: false,
      note: '학생 대면 필수 법정 서류'
    });
    docs.push({
      stage: stage1,
      name: '어린이통학버스 안전교육 이수증 (운전자 및 동승보호자)',
      basis: '도로교통법 제53조의3 (2년 주기 법정 의무교육)',
      required: true,
      exemptible: false,
      note: '도로교통공단 안전교육 이수 확인 (2년 주기)'
    });
  } else if (typeCode === 'B12' || typeCode === 'B13') { // 🏕️ 소규모테마형교육여행(수학여행) / 수련활동
    docs.push({
      stage: stage1,
      name: '여행업 등록증 사본 (종합여행업 또는 국내외여행업)',
      basis: '관광진흥법 제4조',
      required: true,
      exemptible: false,
      note: '관광진흥법에 따른 정식 등록업체'
    });
    docs.push({
      stage: stage1,
      name: '영업배상책임보험 증권 사본 (1인당 1억 원 이상)',
      basis: '관광진흥법 시행규칙 제18조, ★2026학년도 현장체험학습 길라잡이',
      required: true,
      exemptible: false,
      note: '1인당 1억원 이상 보상 한도 가입 증명'
    });
    docs.push({
      stage: stage1,
      name: '숙박시설 안전 점검 서류 일체 (6종)',
      basis: '공중위생관리법, 소방시설법, ★2026학년도 현장체험학습 길라잡이',
      required: true,
      exemptible: false,
      note: '숙박업 영업신고증, 화재배상보험, 소방안전점검필증, 전기·가스점검확인서, 먹는물수질검사서, 위생소독필증'
    });
    if (typeCode === 'B13') {
      docs.push({
        stage: stage1,
        name: '여성가족부(청소년활동진흥원) 수련시설 종합평가 결과 통보서 (평가등급 "적정" 이상)',
        basis: '청소년활동진흥법 제19조의2, ★2026학년도 현장체험학습 길라잡이',
        required: true,
        exemptible: false,
        note: '청소년수련시설 종합평가 "적정" 이상 시설만 계약 가능 (미흡·매우미흡 시설 계약 금지)'
      });
      docs.push({
        stage: stage1,
        name: '청소년수련시설 등록증 및 청소년수련활동 인증서',
        basis: '청소년활동진흥법 제10조 및 제35조',
        required: true,
        exemptible: false,
        note: '여성가족부 청소년활동진흥법 인증 프로그램 확인'
      });
    }
    docs.push({
      stage: stage1,
      name: '안전요원 성범죄 및 아동학대 관련 범죄전력조회 동의서 (법정 필수)',
      basis: '아동·청소년의 성보호에 관한 법률 제56조, 아동복지법 제54조',
      required: true,
      exemptible: false,
      note: '교육여행 동행 인솔 보조 안전요원은 계약 후 10일 이내 필수 제출 (청소년보호법)'
    });
    docs.push({
      stage: stage1,
      name: '안전요원 연수이수증 (현장체험학습 안전과정 14시간 이상) 및 자격증 사본',
      basis: '학교안전사고 예방 및 보상에 관한 법률 시행령 제10조의3, ★2026학년도 현장체험학습 길라잡이',
      required: true,
      exemptible: false,
      note: '대한적십자사·소방청 등 공인기관 안전교육(14시간 이상) 이수자'
    });
    docs.push({
      stage: stage1,
      name: '안전요원 배치계획서 (주간 인솔 보조 및 야간 생활지도)',
      basis: '★2026학년도 현장체험학습 길라잡이 [STEP 6]',
      required: true,
      exemptible: false,
      note: '주·야간 학생 동선 및 취침 시간 안전지도원 투입 계획서'
    });
    docs.push({
      stage: stage1,
      name: '학생 비상연락망 및 환자 후송대책 (현지 지정 협력병원 현황)',
      basis: '★2026학년도 현장체험학습 길라잡이 [STEP 6]',
      required: true,
      exemptible: false,
      note: '체험 장소 인근 응급의료기관 지정 및 긴급 후송 연락체계'
    });
    docs.push({
      stage: stage1,
      name: '식당·음식점 행정처분 이력 조회서 (식품안전나라)',
      basis: '식품위생법, ★2026학년도 현장체험학습 길라잡이 [부록 Ⅱ]',
      required: false,
      exemptible: true,
      exemptReason: '개별 식당 계약 시 식품안전나라(foodsafetykorea.go.kr) 최근 1년 행정처분 이력 조회 첨부 권장',
      note: '식중독 및 위생사고 예방 사전 점검'
    });
    docs.push({
      stage: stage1,
      name: '운전기사 성범죄·아동학대 결격 확인서 (선택/권장)',
      basis: '아동·청소년의 성보호에 관한 법률 제56조, ★2026학년도 현장체험학습 길라잡이',
      required: false,
      exemptible: true,
      exemptReason: '현지 운전기사는 학교 취업자가 아니므로 동의서 직접 징구 대신 운송업체의 성범죄 결격사유 확인서 또는 교통안전정보 통보서로 갈음 가능',
      note: '운송사 확인서 또는 자격조회로 갈음 가능'
    });
  } else if (typeCode === 'B08') { // 🧹 교실 청소용역
    docs.push({
      stage: stage1,
      name: '위생관리용역업 신고필증 사본',
      basis: '공중위생관리법 제3조',
      required: true,
      exemptible: false,
      note: '공중위생관리법에 따른 신고업체'
    });
    docs.push({
      stage: stage1,
      name: '근로조건 이행확약서 및 용역종사자 노무비 지급확약서',
      basis: '외주근로자 근로조건 보호지침, 행안부 예규 제14장',
      required: true,
      exemptible: false,
      note: '외주근로자 근로조건 보호지침 준수 (예정가격 산정 노임단가 지급 확약)'
    });
    docs.push({
      stage: stage1,
      name: '개인정보보호 보안서약서',
      basis: '개인정보 보호법 제59조',
      required: true,
      exemptible: false,
      note: '교내 시설 출입 및 보안 준수'
    });
  } else if (typeCode === 'B11') { // 👮 유인경비 (당직경비/특수운영직군)
    docs.push({
      stage: stage1,
      name: '경비업 허가증 사본',
      basis: '경비업법 제4조 (경비업의 허가)',
      required: true,
      exemptible: false,
      note: '경비업법 제4조에 따른 경찰청(지방경찰청) 허가'
    });
    docs.push({
      stage: stage1,
      name: '경비원 배치신고서 사본',
      basis: '경비업법 제18조 (경비원의 배치 및 폐지신고)',
      required: true,
      exemptible: false,
      note: '관할 경찰서장 배치신고필'
    });
    docs.push({
      stage: stage1,
      name: '근로조건 이행확약서 및 용역종사자 노무비 지급확약서',
      basis: '외주근로자 근로조건 보호지침 준수',
      required: true,
      exemptible: false,
      note: '최저임금 및 외주근로자 보호지침 준수'
    });
    docs.push({
      stage: stage1,
      name: '감시단속적 근로자 적용제외 승인서 사본',
      basis: '근로기준법 제63조 제3호',
      required: true,
      exemptible: false,
      note: '야간 당직경비 시 고용노동부장관 승인 확인'
    });
    docs.push({
      stage: stage1,
      name: '경비원 신임교육 이수증 사본',
      basis: '경비업법 제13조 (경비원의 교육)',
      required: true,
      exemptible: false,
      note: '경비업법에 따른 법정 교육 이수 확인'
    });
    docs.push({
      stage: stage1,
      name: '경비인력 성범죄 및 아동학대 관련 범죄전력조회 동의서',
      basis: '아동·청소년의 성보호에 관한 법률 제56조, 아동복지법 제54조',
      required: true,
      exemptible: false,
      note: '교내 상주인력 필수 법정 서류'
    });
    docs.push({
      stage: stage1,
      name: '개인정보보호 보안서약서',
      basis: '개인정보 보호법 제59조',
      required: true,
      exemptible: false,
      note: '학교 출입관리 및 정보보호'
    });
  } else if (typeCode === 'B14' || typeCode === 'B39') { // 🍲 학교급식 일부위탁 / 배식도우미
    if (typeCode === 'B14') {
      docs.push({
        stage: stage1,
        name: '위탁급식영업신고증 사본',
        basis: '식품위생법 제37조',
        required: true,
        exemptible: false,
        note: '식품위생법 제37조에 따른 영업신고'
      });
    }
    docs.push({
      stage: stage1,
      name: '근로조건 이행확약서 및 노무비 지급확약서',
      basis: '외주근로자 근로조건 보호지침',
      required: true,
      exemptible: false,
      note: '조리·배식 보조인력 보호지침 준수'
    });
    docs.push({
      stage: stage1,
      name: '조리·배식 종사자 건강진단결과서 (보건증)',
      basis: '식품위생법 제40조 및 학교급식법 시행규칙 제6조',
      required: true,
      exemptible: false,
      note: '유효기간 1년 이내 필수 (장티푸스, 폐결핵, 전염성 피부질환 검진)'
    });
    docs.push({
      stage: stage1,
      name: '종사자 성범죄 및 아동학대 관련 범죄전력조회 동의서',
      basis: '아동·청소년의 성보호에 관한 법률 제56조, 아동복지법 제54조',
      required: true,
      exemptible: false,
      note: '학생 대면 필수 법정 서류'
    });
    docs.push({
      stage: stage1,
      name: '위생관리계획서 및 개인정보보호 보안서약서',
      basis: '학교급식 위생관리지침서',
      required: true,
      exemptible: false,
      note: '학교급식 위생지침 준수 확약'
    });
  } else if (category === 'construction') {
    if (typeCode === 'B36_ELEC') {
      docs.push({
        stage: stage1,
        name: '전기공사업 등록증 및 등록수첩 사본',
        basis: '전기공사업법 제4조 및 제11조 (의무 분리발주)',
        required: true,
        exemptible: false,
        note: '전기공사업법 제4조에 따른 등록업체 (분리발주 필수)'
      });
    } else if (typeCode === 'B36_COMM') {
      docs.push({
        stage: stage1,
        name: '정보통신공사업 등록증 및 등록수첩 사본',
        basis: '정보통신공사업법 제14조 및 제25조 (의무 분리발주)',
        required: true,
        exemptible: false,
        note: '정보통신공사업법 제14조에 따른 등록업체 (분리발주 필수)'
      });
    } else if (typeCode === 'B36_FIRE') {
      docs.push({
        stage: stage1,
        name: '소방시설공사업(전문/일반) 등록증 및 등록수첩 사본',
        basis: '소방시설공사업법 제4조 및 제21조 (의무 분리도급)',
        required: true,
        exemptible: false,
        note: '소방시설공사업법 제4조에 따른 등록업체 (분리도급 필수)'
      });
    } else if (typeCode === 'B36_GAS') {
      docs.push({
        stage: stage1,
        name: '가스시설시공업(제1종) 등록증 및 등록수첩 사본',
        basis: '도시가스사업법 제12조 및 건설산업기본법 제9조 (분리발주)',
        required: true,
        exemptible: false,
        note: '건설산업기본법 및 도시가스사업법에 따른 면허 등록업체 (분리발주 필수)'
      });
      docs.push({
        stage: stage1,
        name: '가스시공관리자 자격수첩 사본',
        basis: '도시가스사업법 제14조 및 건설산업기본법 시행령 제40조',
        required: true,
        exemptible: false,
        note: '한국가스안전공사 양성교육 이수자 또는 국가기술자격 가스기능사 이상'
      });
    } else if (typeCode === 'B36_LIFT') {
      docs.push({
        stage: stage1,
        name: '승강기설치공사업 등록증 및 등록수첩 사본',
        basis: '건설산업기본법 제9조 및 승강기안전관리법 제39조 (분리발주)',
        required: true,
        exemptible: false,
        note: '건설산업기본법 및 승강기안전관리법에 따른 면허 등록업체 (분리발주 필수)'
      });
      docs.push({
        stage: stage1,
        name: '승강기 제조업·설치업 등록증 (또는 조달등록확인서)',
        basis: '승강기안전관리법 제39조',
        required: true,
        exemptible: false,
        note: '승강기안전관리법 제39조에 따른 안전인증 및 설치 자격 확인'
      });
    } else if (typeCode === 'B36_ASBESTOS') {
      docs.push({
        stage: stage1,
        name: '석면해체·제거업 등록증 사본',
        basis: '산업안전보건법 제121조 (의무 분리발주, 위반 시 형사처벌)',
        required: true,
        exemptible: false,
        note: '산업안전보건법 제121조에 따라 고용노동부장관에게 등록된 전문업체 (법정 의무 분리발주 필수, 통합발주 시 형사처벌)'
      });
      docs.push({
        stage: stage1,
        name: '학교 석면지도 (석면사전조사결과서 사본)',
        basis: '산업안전보건법 제119조 (석면조사)',
        required: true,
        exemptible: false,
        note: '산업안전보건법 제119조에 따른 기관 석면조사 결과서'
      });
    } else {
      docs.push({
        stage: stage1,
        name: '건설업 등록증 및 등록수첩 사본',
        basis: '건설산업기본법 제9조 (건설업의 등록)',
        required: true,
        exemptible: false,
        note: '해당 전문건설업종 면허 보유 확인 (건설산업기본법 제9조)'
      });
    }
  }

  // ==========================================
  // [2단계: 착수 / 시공 단계 서류]
  // ==========================================
  const stage2 = '2. 착수 및 시공 단계';
  if (category === 'construction') {
    if (price < 10000000) {
      docs.push({
        stage: stage2,
        name: '착공신고서(착공계)·현장대리인계·공정표 (생략 가능)',
        basis: '서울특별시교육청 계약서류간소화 방안 (교육재정과-18968)',
        required: false,
        exemptible: true,
        exemptReason: '계약금액 1천만원 미만 작성 생략 가능 (서울시교육청 서류간소화, 준공사진으로 갈음)'
      });
    } else {
      docs.push({
        stage: stage2,
        name: '착공신고서(착공계) 및 공사공정예정표',
        basis: '지방자치단체 입찰 및 계약 집행기준 제13장 (공사계약 일반조건)',
        required: true,
        exemptible: false
      });
      if (typeCode === 'B36_ELEC') {
        docs.push({
          stage: stage2,
          name: '전기공사기술자 배치신고서 (경력수첩 사본, 재직증명서)',
          basis: '전기공사업법 제17조 (시공관리책임자의 지정 및 배치)',
          required: true,
          exemptible: false,
          note: '한국전기공사협회 경력수첩 사본 (전기공사업법 제17조 준수)'
        });
      } else if (typeCode === 'B36_COMM') {
        docs.push({
          stage: stage2,
          name: '정보통신기술자 배치계 (경력수첩 사본, 재직증명서)',
          basis: '정보통신공사업법 제33조 (정보통신기술자의 배치 기준)',
          required: true,
          exemptible: false,
          note: '한국정보통신공사협회 경력수첩 사본 (정보통신공사업법 제33조 준수)'
        });
      } else if (typeCode === 'B36_FIRE') {
        docs.push({
          stage: stage2,
          name: '소방기술자 배치신고서 (경력수첩 사본, 재직증명서)',
          basis: '소방시설공사업법 제12조 (소방기술자의 배치 및 시공관리)',
          required: true,
          exemptible: false,
          note: '한국소방시설협회 경력수첩 사본 (소방시설공사업법 제12조 준수)'
        });
      } else if (typeCode === 'B36_GAS') {
        docs.push({
          stage: stage2,
          name: '가스시공관리자 지정신고서 (자격수첩, 재직증명서)',
          basis: '도시가스사업법 제14조 및 건설산업기본법 시행령 제40조',
          required: true,
          exemptible: false,
          note: '도시가스사업법 제14조 및 건산법 시행령 제40조에 따른 시공관리자'
        });
        docs.push({
          stage: stage2,
          name: '가스안전관리계획서 및 도시가스 공급자 공사협의서',
          basis: '도시가스사업법 제15조 및 제26조',
          required: true,
          exemptible: false,
          note: '가스 배관 인입 경로, 밸브 차단 및 비상조치 계획'
        });
      } else if (typeCode === 'B36_LIFT') {
        docs.push({
          stage: stage2,
          name: '승강기 설치기술자 배치신고서 (기술인 경력증명, 재직증명서)',
          basis: '승강기안전관리법 제39조 및 건설산업기본법 제40조',
          required: true,
          exemptible: false,
          note: '승강기안전관리법 및 건산법에 따른 전문기술자 배치'
        });
        docs.push({
          stage: stage2,
          name: '승강기 제작승인도면 (승강로, 피트, 카 규격 및 배치도)',
          basis: '승강기안전관리법 제28조 (설치검사 기준)',
          required: true,
          exemptible: false,
          note: '건축 구조체 및 안전 기준 부합 여부 승인도면'
        });
      } else if (typeCode === 'B36_ASBESTOS') {
        docs.push({
          stage: stage2,
          name: '석면해체·제거작업 신고증명서(필증)',
          basis: '산업안전보건법 제122조 (착공 전 관할 노동청 교부 필수)',
          required: true,
          exemptible: false,
          note: '관할 지방고용노동관서장 발행 (산업안전보건법 제122조, 착공 전 필증 교부 필수)'
        });
        docs.push({
          stage: stage2,
          name: '석면작업장 밀폐 및 음압기 가동계획서 (안전보건계획서)',
          basis: '산업안전보건기준에 관한 규칙 제489조',
          required: true,
          exemptible: false,
          note: '작업장 완전 밀폐, 음압기 적정 용량 및 개인보호구(특급마스크) 지급계획'
        });
      } else {
        docs.push({
          stage: stage2,
          name: '현장기술인(현장대리인) 지정신고서 (기술자격증/경력증명서, 재직증명서)',
          basis: '건설산업기본법 제40조 (건설기술인의 배치 기준)',
          required: true,
          exemptible: false,
          note: '한국건설기술인협회 경력증명서 (건설산업기본법 제40조)'
        });
      }
      docs.push({
        stage: stage2,
        name: '착공 전 현장 사진대지',
        basis: '지방자치단체 입찰 및 계약 집행기준 제13장',
        required: true,
        exemptible: false
      });
    }

    if (price >= 40000000) {
      docs.push({
        stage: stage2,
        name: '직접시공계획서',
        basis: '건설산업기본법 제28조의2 및 동법 시행령 제30조의2',
        required: true,
        exemptible: true,
        exemptReason: '공기 30일 이내 또는 전문업체 전문공사 시 통보 제외 (건설산업기본법 시행령 제30조의2)'
      });
    }

    docs.push({
      stage: stage2,
      name: '전기·수도료 납부 합의서 (또는 미사용 각서)',
      basis: '서울특별시교육청 계약서류간소화 방안 (교육재정과-24993)',
      required: price > 10000000,
      exemptible: price <= 10000000,
      exemptReason: price <= 10000000 ? '계약금액 1천만원 이하 전기·수도료 미징수' : '',
      note: '교육재정과-24993 지침'
    });

    docs.push({
      stage: stage2,
      name: '공사 안전·보건 체크리스트',
      basis: '2026 서울특별시교육청 계약업무 처리지침 [붙임 11]',
      required: true,
      exemptible: false,
      note: '2026 서울시교육청 지침 [붙임 11] (필수 징구)'
    });

    docs.push({
      stage: stage2,
      name: '추락재해 예방 체크리스트',
      basis: '2026 서울특별시교육청 계약업무 처리지침 [붙임 12]',
      required: true,
      exemptible: true,
      exemptReason: '비계, 사다리, 지붕 등 2m 이상 고소작업 수반 공사 시 필수 징구',
      note: '2026 서울시교육청 지침 [붙임 12]'
    });

    docs.push({
      stage: stage2,
      name: '노무비 구분관리 및 지급확인제 합의서',
      basis: '행정안전부 예규 제13장 및 2026 서울시교육청 지침 [붙임 10-1~3]',
      required: true,
      exemptible: true,
      exemptReason: '공사기간 1개월 미만 또는 상용근로자만 투입 시 「적용 제외 확인서」로 대체 가능',
      note: '2026 서울시교육청 지침 [붙임 10-1~3]'
    });
  } else if (category === 'service') {
    if (price < 5000000) {
      docs.push({
        stage: stage2,
        name: '착수신고서(착수계)',
        basis: '서울특별시교육청 계약서류간소화 방안 (교육재정과-18968)',
        required: false,
        exemptible: true,
        exemptReason: '계약금액 5백만원 미만 작성 생략 가능'
      });
    } else {
      docs.push({
        stage: stage2,
        name: '착수계 및 과업수행계획서 (투입인력 명부 포함)',
        basis: '지방자치단체 입찰 및 계약 집행기준 제14장 (용역계약 일반조건)',
        required: true,
        exemptible: false
      });
    }

    docs.push({
      stage: stage2,
      name: '용역 안전·보건 체크리스트',
      basis: '2026 서울특별시교육청 계약업무 처리지침 [붙임 11]',
      required: true,
      exemptible: false,
      note: '2026 서울시교육청 지침 [붙임 11] (필수 징구)'
    });
  }

  // ==========================================
  // [3단계: 준공 / 완료 / 검사 단계 서류]
  // ==========================================
  const stage3 = '3. 준공 및 검사 단계';
  if (category === 'construction') {
    if (price < 10000000) {
      docs.push({
        stage: stage3,
        name: '준공계 (생략 가능)',
        basis: '지방계약법 시행령 제64조, 서울특별시교육청 서류간소화 방안',
        required: false,
        exemptible: true,
        exemptReason: '계약금액 1천만원 미만 작성 생략 가능 (준공사진으로 갈음)'
      });
    } else {
      docs.push({
        stage: stage3,
        name: '준공계 및 준공검사원',
        basis: '지방자치단체 입찰 및 계약 집행기준 제13장',
        required: true,
        exemptible: false
      });
      docs.push({
        stage: stage3,
        name: '공사 전·중·후 사진대지',
        basis: '지방자치단체 입찰 및 계약 집행기준 제13장',
        required: true,
        exemptible: false
      });
    }

    if (price <= 30000000) {
      docs.push({
        stage: stage3,
        name: '준공검사조서 (생략 가능)',
        basis: '지방계약법 시행령 제65조 (3천만 원 이하 검사조서 생략 특례)',
        required: false,
        exemptible: true,
        exemptReason: '계약금액 3천만원 이하 생략 가능 (지출결의서 검사인 날인으로 갈음, 지방계약법 시행령 제65조)'
      });
    } else {
      docs.push({
        stage: stage3,
        name: '준공검사조서 (2인 이상 입회)',
        basis: '지방계약법 시행령 제65조 (검사조서의 작성)',
        required: true,
        exemptible: false,
        note: '지방계약법 시행령 제65조 (3천만원 초과 필수 작성)'
      });
    }

    if (price >= 20000000) {
      docs.push({
        stage: stage3,
        name: '산업안전보건관리비 집행내역서 (세금계산서, 사진 등)',
        basis: '산업안전보건법 제72조 및 고용노동부 고시 (건설업 산업안전보건관리비 계상 및 사용기준)',
        required: true,
        exemptible: false,
        note: '총공사금액 2천만원 이상 건설공사 의무정산 (고용노동부 고시)'
      });
    }

    if (price >= 100000000) {
      docs.push({
        stage: stage3,
        name: '건설근로자 퇴직공제부금 납부확인서',
        basis: '건설산업기본법 제87조 및 동법 시행령 제83조',
        required: true,
        exemptible: false,
        note: '공사예정금액 1억원 이상 건설공사 (건설산업기본법 시행령 제83조)'
      });
    }

    if (price >= 30000000) {
      docs.push({
        stage: stage3,
        name: '전자대금시스템(하도급지킴이) 이용확인',
        basis: '건설산업기본법 제34조 제9항',
        required: true,
        exemptible: true,
        exemptReason: '도급금액 3천만원 이상이고 공기 30일 초과 시 필수 이용 (건설산업기본법 제34조)',
        note: '전자대금시스템 이체'
      });
    }

    // 공종별 준공 특화 검사 및 시험성적 서류
    if (typeCode === 'B36_ELEC') {
      docs.push({
        stage: stage3,
        name: '전기설비 절연저항 측정기록표 및 기기 시험성적서',
        basis: '전기안전관리법 및 전기설비기술기준',
        required: true,
        exemptible: false,
        note: '전기설비 기술기준 적합성 검증 (누전 및 절연 확인)'
      });
      if (price >= 30000000) {
        docs.push({
          stage: stage3,
          name: '한국전기안전공사 사용전점검(검사) 확인증',
          basis: '전기안전관리법 제12조',
          required: true,
          exemptible: true,
          exemptReason: '수배전반·인입선 등 자가용 전기설비 증설 또는 개보수 시 필수 제출',
          note: '전기안전관리법 제12조'
        });
      }
    } else if (typeCode === 'B36_COMM') {
      docs.push({
        stage: stage3,
        name: '구내통신선로(LAN/광케이블) 측정성적서 (Cat.6/광파워 시험표)',
        basis: '정보통신공사업법 제36조 (사용전검사 기준)',
        required: true,
        exemptible: false,
        note: '학내망 배선 규격 통신 성능 시험성적표'
      });
    } else if (typeCode === 'B36_FIRE') {
      docs.push({
        stage: stage3,
        name: '소방시설 완공검사증명서 (또는 감리결과보고서, 화재수신기 연동 시험표)',
        basis: '소방시설공사업법 제14조 (완공검사)',
        required: true,
        exemptible: false,
        note: '관할 소방서 완공 승인 확인 또는 수신기 연동 확인 (소방시설법)'
      });
    } else if (typeCode === 'B36_GAS') {
      docs.push({
        stage: stage3,
        name: '한국가스안전공사(또는 도시가스사) 완성검사증명서',
        basis: '도시가스사업법 제15조 (완성검사)',
        required: true,
        exemptible: false,
        note: '도시가스사업법 제15조에 따른 완성검사 합격필증 (가스 공급 필수 서류)'
      });
      docs.push({
        stage: stage3,
        name: '가스배관 기밀시험표 및 가스누출차단장치 작동시험성적표',
        basis: '도시가스사업법 시행규칙 [별표 6]',
        required: true,
        exemptible: false,
        note: '배관 압력유지 및 긴급차단밸브 연동 차단 확인'
      });
    } else if (typeCode === 'B36_LIFT') {
      docs.push({
        stage: stage3,
        name: '한국승강기안전공단(KoELSA) 승강기 설치(완성)검사 합격증명서',
        basis: '승강기안전관리법 제28조 (설치검사 합격증명)',
        required: true,
        exemptible: false,
        note: '승강기안전관리법 제28조에 따른 설치검사 합격필증 (합격증 미교부 시 운행 불가)'
      });
      docs.push({
        stage: stage3,
        name: '승강기 고유번호판 부착 사진 및 비상통화장치 개통확인서',
        basis: '승강기안전관리법 시행규칙 제51조',
        required: true,
        exemptible: false,
        note: '24시간 유지관리업체 및 행정실 직통 비상통화 통신 개통 확인'
      });
    } else if (typeCode === 'B36_ASBESTOS') {
      docs.push({
        stage: stage3,
        name: '실내 공기 중 석면농도 측정결과보고서 (0.01개/㎤ 이하)',
        basis: '산업안전보건법 제124조 (석면농도기준의 준수)',
        required: true,
        exemptible: false,
        note: '산업안전보건법 제124조에 따른 고용노동부 지정 측정기관 결과표 (기준 초과 시 재청소 의무)'
      });
      docs.push({
        stage: stage3,
        name: '지정폐기물(폐석면) 배출자 신고필증 및 올바로(Allbaro) 인계확인서',
        basis: '폐기물관리법 제17조 및 제18조',
        required: true,
        exemptible: false,
        note: '폐기물관리법 제17조 및 제18조에 따른 최종 적법 처리 인계내역서'
      });
      docs.push({
        stage: stage3,
        name: '학교 석면모니터단 점검확인서',
        basis: '교육부·서울특별시교육청 학교 석면관리 매뉴얼',
        required: true,
        exemptible: false,
        note: '학부모·전문가·교원 합동 잔재물 조사 완료 확인'
      });
    } else {
      docs.push({
        stage: stage3,
        name: '건설폐기물 처리 증빙서류 (인계서, 올바로시스템 실적보고서)',
        basis: '건설폐기물의 재활용촉진에 관한 법률 제18조',
        required: true,
        exemptible: true,
        exemptReason: '폐기물 배출량 5톤 이상 시 올바로시스템 필수, 5톤 미만은 간이 영수증 대체',
        note: '건설폐기물의 재활용촉진에 관한 법률'
      });
    }
  } else {
    // 용역 및 물품
    if (price < 30000000) {
      docs.push({
        stage: stage3,
        name: '완료(납품) 검사·검수조서 (생략 가능)',
        basis: '지방계약법 시행령 제65조 (3천만 원 미만 검사조서 생략 특례)',
        required: false,
        exemptible: true,
        exemptReason: '계약금액 3천만원 미만 생략 가능 (납품서 및 지출결의서 검사인으로 갈음, 지방계약법 시행령 제65조)'
      });
    } else {
      docs.push({
        stage: stage3,
        name: '완료(납품) 검사·검수조서',
        basis: '지방계약법 시행령 제64조 및 제65조',
        required: true,
        exemptible: false,
        note: '계약금액 3천만원 이상 필수 작성'
      });
    }

    if (typeCode === 'B08' || typeCode === 'B11') {
      docs.push({
        stage: stage3,
        name: '국민연금·건강·노인장기요양보험료 납입영수증 및 사후정산내역서',
        basis: '지방자치단체 입찰 및 계약 집행기준 제14장 (보험료 사후정산 요령)',
        required: true,
        exemptible: false,
        note: '행안부 예규상 사후정산 항목 실비 정산'
      });
      docs.push({
        stage: stage3,
        name: '근로자 급여지급내역서 (이체확인증)',
        basis: '외주근로자 근로조건 보호지침',
        required: true,
        exemptible: false,
        note: '상주 인력 노무비 지급 확인'
      });
    } else if (typeCode === 'B20' || typeCode === 'B09' || typeCode === 'B10') {
      docs.push({
        stage: stage3,
        name: '강사료 지급확인서 (급여이체내역서)',
        basis: '서울특별시교육청 방과후학교 길라잡이 (강사료 지급확인)',
        required: true,
        exemptible: false,
        note: '위탁업체의 강사료 적정 지급 확인 (수수료율 과다 착취 방지)'
      });
      docs.push({
        stage: stage3,
        name: '프로그램 운영결과보고서 및 출석부 사본',
        basis: '초·중등교육법 제32조 (방과후학교 운영)',
        required: true,
        exemptible: false,
        note: '기별/월별 과업 완료 및 출결 확인'
      });
    } else if (typeCode === 'B07' || typeCode === 'B40') {
      docs.push({
        stage: stage3,
        name: '차량 운행확인서 (인솔교사 서명필)',
        basis: '★2026학년도 현장체험학습 길라잡이 [서식 Ⅱ-3]',
        required: true,
        exemptible: false,
        note: '배차 대수, 운행구간, 대기시간 준수 확인'
      });
    } else if (typeCode === 'B12' || typeCode === 'B13') {
      docs.push({
        stage: stage3,
        name: '현장체험학습 정산서 및 이행확인서 (인솔책임자 확인필)',
        basis: '★2026학년도 현장체험학습 길라잡이 [STEP 8]',
        required: true,
        exemptible: false,
        note: '실제 참가 학생·인솔인원 기준 숙식비·입장료 등 정산 및 과업 이행 확인'
      });
      docs.push({
        stage: stage3,
        name: '차량 운행확인서 및 안전요원 근무확인서',
        basis: '★2026학년도 현장체험학습 길라잡이 [서식 Ⅱ-3, Ⅱ-4]',
        required: true,
        exemptible: false,
        note: '배차구간 운행 완료 및 안전요원 일일 근무일지 확인'
      });
    } else if (typeCode === 'B14' || typeCode === 'B39') {
      docs.push({
        stage: stage3,
        name: '급식 배식일지 및 종사자 노무비 지급내역서',
        basis: '학교급식법 시행규칙 제6조',
        required: true,
        exemptible: false,
        note: '실제 투입 인력 및 노무비 지급 확인'
      });
    }
  }

  // ==========================================
  // [4단계: 대가 지급 단계 서류]
  // ==========================================
  const stage4 = '4. 대가 지급 단계';
  const isTaxExemptItem = ['B18', 'B06', 'B13'].includes(typeCode); // B18 급식 식재료(농수축산물·김치), B06 도서구매, B13 청소년수련시설 용역
  docs.push({
    stage: stage4,
    name: isTaxExemptItem ? '대가청구서 및 전자계산서 (면세)' : '대가청구서 및 전자세금계산서',
    basis: isTaxExemptItem
      ? '부가가치세법 제26조 및 동법 시행령 제36조 (면세 용역)'
      : '부가가치세법 제32조 (세금계산서의 발급)',
    required: true,
    exemptible: false,
    note: isTaxExemptItem
      ? (typeCode === 'B13' ? '청소년수련시설 용역은 부가가치세법 시행령 제36조에 따른 면세 용역으로 전자계산서(면세) 징구' : '농·수·축산물 식재료 및 도서 등 면세 품목은 전자계산서(면세) 징구 (신용카드 결제 시 카드매출전표 대체)')
      : '전자세금계산서 및 대금청구서 (신용카드 결제 시 카드매출전표 대체 가능)'
  });

  docs.push({
    stage: stage4,
    name: '4대 사회보험료 완납증명서',
    basis: '서울특별시교육청 계약서류간소화 방안 (교육재정과-18968), 재무회계규칙 제73조',
    required: price >= 5000000,
    exemptible: price < 5000000,
    exemptReason: price < 5000000
      ? '추정가격(계약금액) 5백만 원 미만 생략 가능 (「서울특별시교육청 각급 학교 및 교육행정기관 계약서류간소화 방안」(교육재정과-18968), 서울특별시교육비특별회계 재무회계규칙 제73조)'
      : '5백만 원 이상 필수 확인 (G2B 나라장터 또는 행정정보공동이용 연계 확인 시 제출 생략 가능)',
    note: price < 5000000 ? '5백만 원 미만 서류간소화 생략 가능' : '5백만 원 이상 필수 징구 (전산 확인 시 서류 생략)'
  });

  // 4-2-1. 시설공사 대가지급 단계 특화: 노무비 지급내역서 및 하도급지킴이 이용 증빙 (지침 [붙임 4] p.23)
  if (category === 'construction') {
    docs.push({
      stage: stage4,
      name: '노무비 지급내역서 (근로자 계좌이체 확인증)',
      basis: '서울특별시교육청 계약서류간소화 방안 (교육재정과-18968), 행안부 예규 제13장',
      required: price > 5000000,
      exemptible: price <= 5000000,
      exemptReason: price <= 5000000
        ? '추정가격 5백만 원 이하 생략 가능 (「서울특별시교육청 계약서류간소화 방안」(교육재정과-18968))'
        : '직접노무비 지급대상이 계약상대자의 상용근로자만으로 구성된 경우 제외확인서로 대체 가능 (행안부 예규 제13장)',
      note: price <= 5000000 ? '5백만 원 이하 생략 가능' : '근로자 계좌이체 확인 (상용근로자는 제외확인서 대체)'
    });

    if (price >= 30000000) {
      docs.push({
        stage: stage4,
        name: '전자대금시스템(하도급지킴이) 이용 증빙',
        basis: '건설산업기본법 제34조 제9항',
        required: true,
        exemptible: false,
        note: '도급금액 3천만 원 이상 & 공사기간 30일 초과 시 필수 (하도급지킴이를 통한 노무비·자재대금 청구/지급 승인 확인, 건산법 제34조)'
      });
    }
  }

  if (isSoleSource || isElectronicQuote) {
    docs.push({
      stage: stage4,
      name: '국세 및 지방세 완납증명서 (생략 가능)',
      basis: '국세징수법 시행령 제91조, 지방세징수법 시행령 제5조',
      required: false,
      exemptible: true,
      exemptReason: '수의계약 시 제출 생략 가능 (국세징수법 시행령 제91조, 지방세징수법 시행령 제5조, 나라장터 확인)'
    });
  } else {
    docs.push({
      stage: stage4,
      name: '국세 및 지방세 완납증명서',
      basis: '지방계약법 시행령 제90조 및 국세징수법 제107조',
      required: true,
      exemptible: false,
      note: '경쟁입찰 시 필수 제출 (체납 여부 확인)'
    });
  }

  // 4-3. 하자보수보증금 (지방계약법 시행령 제71조, 교육청 지침 [붙임4])
  if (category === 'construction') {
    if (typeCode === 'B36_ASBESTOS') {
      docs.push({
        stage: stage4,
        name: '하자보수보증금 납부 면제 (철거·해체공사)',
        basis: '지방계약법 시행령 제71조 제1항 단서',
        required: false,
        exemptible: true,
        exemptReason: '석면 해체·제거 등 성질상 목적물 하자가 발생하지 않는 공사는 하자보수보증금 납부 면제 (지방계약법 시행령 제71조 제1항 단서)'
      });
    } else if (price <= 30000000) {
      docs.push({
        stage: stage4,
        name: '하자보수보증금 납부 면제 (지급확약서 대체)',
        basis: '지방계약법 시행령 제71조 제3항 (3천만 원 이하 면제)',
        required: false,
        exemptible: true,
        exemptReason: '공사 계약금액 3천만원 이하 납부 면제 가능 (단, 조경공사 제외, 하자보수보증금 지급확약서 징구)'
      });
    } else {
      const isEtcConst = ['B36_ELEC', 'B36_COMM', 'B36_FIRE'].includes(typeCode);
      const warrantyRate = isEtcConst ? '2%' : '3%';
      const periodDesc = isEtcConst ? '1~2년' : (typeCode === 'B36_LIFT' ? '3년' : (typeCode === 'B36_GAS' ? '2년' : '1~3년'));
      const constLabel = isEtcConst
        ? '전기·통신·소방공사'
        : (typeCode === 'B36_GAS' ? '가스시설공사' : (typeCode === 'B36_LIFT' ? '승강기설치공사' : '전문건설공사'));
      docs.push({
        stage: stage4,
        name: `하자보수보증서 (${constLabel} ${warrantyRate})`,
        basis: '지방계약법 시행령 제71조 및 동법 시행규칙 제70조',
        required: true,
        exemptible: false,
        note: `공사 목적물 준공검사 완료일 기준 하자담보책임기간(${periodDesc}) 보증 (지방계약법 시행규칙 제70조)`
      });
    }
  } else if (category === 'service' && ['B15', 'B16', 'B17'].includes(typeCode)) {
    if (price >= 30000000) {
      docs.push({
        stage: stage4,
        name: '하자보수보증서 (건축 설계·감리 용역 2%)',
        basis: '서울특별시교육청 교육시설과-1036 지침',
        required: true,
        exemptible: false,
        note: '교육시설과-1036 지침 (3천만원 이상 설계용역)'
      });
    }
  } else if (category === 'goods' && ['B04'].includes(typeCode) && price >= 30000000) {
    docs.push({
      stage: stage4,
      name: '하자보수보증서 (물품제조설비 2%~5%)',
      basis: '지방계약법 시행령 제71조 (제조 물품의 하자)',
      required: true,
      exemptible: false,
      note: '시행령 제71조 (성질상 하자보수가 필요한 특수 설비에 한함)'
    });
  } else {
    // 단순 일반용역 및 소모성 완제품 구매는 하자보수보증금 비대상
    docs.push({
      stage: stage4,
      name: '하자보수보증금 해당 없음 (미징구 대상)',
      basis: '지방계약법 시행령 제71조 단서',
      required: false,
      exemptible: true,
      exemptReason: '단순 일반용역 및 완제품 소모품 구매는 성질상 하자담보 대상이 아님 (지방계약법 시행령 제71조 단서)'
    });
  }

  // 4-4. 채권(국민주택채권) 매입 의무 (서울시교육청 계약서류 간소화 방안 및 주택도시기금법 시행령 제8조)
  if (category === 'construction') {
    if (price >= 500000000) {
      docs.push({
        stage: stage4,
        name: '제1종 국민주택채권 매입필증',
        basis: '주택도시기금법 시행령 제8조 [별표 12] (5억 원 이상)',
        required: true,
        exemptible: false,
        note: '계약금액 5억원 이상 건설공사 대금 청구 시 매입 (주택도시기금법 시행령 제8조 [별표 12])'
      });
    } else {
      docs.push({
        stage: stage4,
        name: '국민주택채권 매입 면제',
        basis: '주택도시기금법 시행령 제8조, 서울특별시교육청 서류간소화 방안',
        required: false,
        exemptible: true,
        exemptReason: '계약금액 5억원 미만 공사 해당 없음 (서울시교육청 계약서류 간소화 방안)'
      });
    }
  } else {
    // 물품 및 일반용역은 서울시교육청 소속 학교 및 직속기관에서 공채 매입 비대상
    docs.push({
      stage: stage4,
      name: '채권(공채) 매입 해당 없음',
      basis: '서울특별시교육청 계약서류간소화 방안 (물품·용역 공채 비대상)',
      required: false,
      exemptible: true,
      exemptReason: '서울시교육청 소속 학교 및 기관은 물품·용역 계약 시 채권 매입 비대상 (공채 징구 생략)'
    });
  }

  return docs;
}

function generateDraftMemoText({ category, typeName, typeCode, projectTitle = '', estimatedPrice, selectedMethod, targetPlatform = 'G2B', isFemaleCompany, auditWarnings, requiredDocs = [] }) {
  const catKorean = category === 'construction' ? '공사' : (category === 'service' ? '용역' : '물품');
  const priceFormatted = estimatedPrice.toLocaleString();
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const platformRationale = targetPlatform === 'G2B'
    ? '지정정보처리장치는 지방계약법령상 공공계약의 기본(원칙) 시스템인 국가종합전자조달시스템(G2B 나라장터)을 이용하여 공정하고 투명하게 추진하고자 합니다.'
    : '지정정보처리장치는 지방계약법령 및 교육기관 조달 편의 지침에 따라 행정안전부 고시 지정정보처리장치인 학교장터(S2B)를 활용하여 추진하고자 합니다.';

  const projectDisplay = projectTitle ? `「${projectTitle}」` : `「${typeName}」`;

  // 구비서류 목록 텍스트 생성 (기안문 가독성을 위해 불필요하게 길어지는 법적 근거 표시는 제외)
  const stageGroups = {};
  requiredDocs.forEach(d => {
    const st = d.stage || '기타';
    if (!stageGroups[st]) stageGroups[st] = [];
    stageGroups[st].push(`    - ${d.name}${d.exemptible ? ' [생략 가능]' : ' [필수 징구]'}${d.note ? ` (${d.note})` : ''}`);
  });
  const docsText = Object.entries(stageGroups)
    .map(([st, items]) => `  가. ${st}\n${items.join('\n')}`)
    .join('\n\n');

  let splitLawClause = '';
  if (category === 'construction') {
    if (typeCode === 'B36_ELEC') splitLawClause = '\n  라. 「전기공사업법」 제11조 (전기공사의 분리발주)';
    else if (typeCode === 'B36_COMM') splitLawClause = '\n  라. 「정보통신공사업법」 제25조 (정보통신공사의 분리발주)';
    else if (typeCode === 'B36_FIRE') splitLawClause = '\n  라. 「소방시설공사업법」 제21조 (소방시설공사의 분리도급)';
    else if (typeCode === 'B36_GAS') splitLawClause = '\n  라. 「도시가스사업법」 제12조 및 「건설산업기본법」 (가스시설시공업 분리발주)';
    else if (typeCode === 'B36_LIFT') splitLawClause = '\n  라. 「승강기안전관리법」 제39조 및 「건설산업기본법」 (승강기설치공사업 분리발주)';
    else if (typeCode === 'B36_ASBESTOS') splitLawClause = '\n  라. 「산업안전보건법」 제121조 (석면해체·제거업자를 통한 의무 분리발주)';
  } else if (['B07', 'B12', 'B13'].includes(typeCode)) {
    if (typeCode === 'B07') splitLawClause = '\n  라. 「여객자동차 운수사업법」 및 ★2026학년도 서울특별시교육청 현장체험학습 길라잡이';
    else if (typeCode === 'B12') splitLawClause = '\n  라. 「관광진흥법」 및 ★2026학년도 서울특별시교육청 현장체험학습 길라잡이';
    else if (typeCode === 'B13') splitLawClause = '\n  라. 「청소년활동진흥법」 및 ★2026학년도 서울특별시교육청 현장체험학습 길라잡이';
  }

  return `[계약방법 결정 사유서 (내부결재용)]

1. 관련
  가. 「지방자치단체를 당사자로 하는 계약에 관한 법률」 및 동법 시행령 제30조
  나. 「지방자치단체 입찰 및 계약 집행기준」(행정안전부 예규)
  다. 2026학년도 서울특별시교육청 계약업무 처리지침${splitLawClause}

2. 사업 개요
  가. 건    명: ${projectDisplay} 계약 집행의 건
  나. 계약분야: ${catKorean} (계약길잡이 분류: ${typeName} [${typeCode || '일반'}])
  다. 추정가격: 금${priceFormatted}원 (부가가치세 제외)
  라. 추정금액: 금${Math.round(estimatedPrice * 1.1).toLocaleString()}원 (부가가치세 10% 포함)

3. 계약방법 결정 내역
  가. 결정된 계약방법: ${selectedMethod.title}
  나. 계약 추진 플랫폼: ${selectedMethod.platform}
  다. 관련 법적 근거: ${selectedMethod.legalClause}
  라. 결정 사유:
    본 건(${projectTitle ? `${projectTitle}, ` : ''}유형: ${typeName})의 추정가격은 금${priceFormatted}원으로, ${selectedMethod.legalDesc}
    ${selectedMethod.id.includes('QUOTATION') ? platformRationale : ''}
    ${typeCode.startsWith('B36') ? '아울러 본 건은 관계 법령에 따른 법정 의무 분리발주 대상 공사로서, 타 공종(건축·토목 등)과 통합 발주하지 않고 해당 전문등록면허 자격을 갖춘 업체와 개별 분리 계약을 추진하고자 함.' : ''}
    ${['B07', 'B12', 'B13'].includes(typeCode) ? '아울러 본 건은 학생 현장체험학습 관련 용역으로서, 「★2026학년도 서울특별시교육청 현장체험학습 길라잡이」에 의거하여 학생 안전관리 기준(안전요원 연수이수증, TS교통안전정보, 숙박시설 안전점검 등)을 준수하고 90일 이내 분할 수의계약 금지 규정을 철저히 점검하여 추진하고자 함.' : ''}
    ${selectedMethod.id === 'MEAL_SERVICE_EAT' ? '아울러 본 건은 학생 급식 식재료 구매 건으로, 서울특별시교육청 학교급식 기본방향에 따라 안전성과 위생이 검증된 공급업체 조달을 위해 한국농수산식품유통공사(aT) 학교급식전자조달시스템(eaT)을 활용하여 추진하고자 함.' : ''}
    ${selectedMethod.id === 'SOLE_SOURCE_DISABLED_FACILITY' ? '아울러 본 건은 「중증장애인생산품 우선구매 특별법」 제7조 제5항 및 「지방계약법 시행령」 제25조 제1항 제7호의2 나목에 의거 보건복지부 지정 중증장애인생산품 생산시설과의 계약으로서 금액 한도 제한 없이 1인 견적 수의계약 특례를 적용함.' : ''}
    ${isFemaleCompany ? '아울러 계약상대자는 중소벤처기업부 확인을 득한 여성기업으로 확인되어 1인 견적 수의계약 특례를 적용함.' : ''}
    ${projectTitle ? '공사원가계산서 제비율 및 관련 회계 법령에 따른 역산 검증을 완료하였으며, 동일 회계연도 내 분할 수의계약(일감 쪼개기) 금지 규정을 철저히 점검하여 ' : ''}청렴하고 적법한 학교회계 집행을 위해 상기 계약방법으로 추진하고자 합니다.

4. 낙찰자 결정 및 계약 조건
  - 공고(안내) 기간: ${selectedMethod.noticeDays}
  - 낙찰자 결정 기준: ${selectedMethod.lowerRate}
  - 계약보증금 징구: ${selectedMethod.guaranteeRate}

5. 단계별 주요 구비 서류 (서울시교육청 지침 [붙임 4] 준수)
${docsText}

작성일자: ${dateStr}
작성자: 행정실 계약담당자 (인)`;
}

// =============================================================================
// 아코디언 Progressive Flow 전용 헬퍼 함수
// =============================================================================

/**
 * 1) 계약분야와 추정가격을 기반으로 적용 가능한 계약방법 후보 목록 반환
 */
export function getAvailableContractOptions({ category, estimatedPrice, typeCode = '' }) {
  const options = [];
  const price = Number(estimatedPrice) || 0;

  // 1. 추정가격 2,000만 원 이하: 1인 수의 가능 구간
  if (price <= 20000000) {
    // 1-1. 일반 소액 1인 견적 수의계약
    options.push({
      ...CONTRACT_METHODS.SOLE_SOURCE_GENERAL,
      tag: '기본 추천 · 1인 수의',
      tagColor: 'blue',
      conditionText: '별도 자격인증 불필요 (누구나 체결 가능)',
      featureText: '공고 생략 / 계약서 작성 생략(승낙사항 대체 가능) / 1인 견적으로 즉시 체결',
      isDefault: true,
      badgeText: '가장 간편'
    });

    // 1-2. 취약계층 특례 1인 견적
    options.push({
      ...CONTRACT_METHODS.SOLE_SOURCE_AFFIRMATIVE,
      tag: '배려기업 우선구매 실적',
      tagColor: 'emerald',
      conditionText: '중기부 확인 여성기업, 장애인기업 또는 취약계층 30% 고용 사회적기업',
      featureText: '교육청 권장 사회적 배려기업 우선구매 실적 반영 / 1인 견적 체결',
      isDefault: false,
      badgeText: '우선구매 실적'
    });

    // 1-3. 물품인 경우: 조달청 종합쇼핑몰 직접구매 및 급식식재료 eaT
    if (category === 'goods') {
      options.push({
        ...CONTRACT_METHODS.PROCUREMENT_MAS,
        tag: '조달청 쇼핑몰 구매',
        tagColor: 'cyan',
        conditionText: '나라장터 종합쇼핑몰(제3자단가/MAS)에 등록된 제품 구매 시',
        featureText: '견적서 비교 없이 쇼핑몰 장바구니에서 바로 납품요구 (2천만원 이하는 심의 생략 가능)',
        isDefault: false,
        badgeText: '쇼핑몰 즉시구매'
      });

      options.push({
        ...CONTRACT_METHODS.MEAL_SERVICE_EAT,
        tag: '급식 식재료 특화 (eaT/S2B)',
        tagColor: 'emerald',
        conditionText: '학교 급식용 농·수·축산물 및 가공 식재료 구매 시',
        featureText: 'aT 학교급식전자조달시스템(eaT) 또는 S2B를 통한 1인 견적 전자 수의계약 체결 가능',
        isDefault: false,
        badgeText: '급식 식재료 (eaT)'
      });
    }

    // 1-4. 중증장애인생산품 생산시설 특례 (물품·용역 한정, 공사 제외)
    if (category !== 'construction') {
      options.push({
        ...CONTRACT_METHODS.SOLE_SOURCE_DISABLED_FACILITY,
        tag: '법정의무구매 1% 달성',
        tagColor: 'purple',
        conditionText: '보건복지부장관 지정 중증장애인생산품 생산시설 직접생산 제품/용역',
        featureText: '금액 한도 무제한 / 동일업체 연간 4회 제한 적용 제외 / 교육청 기관평가 가점',
        isDefault: false,
        badgeText: '금액 무제한'
      });
    }

    // 1-5. 2인 이상 전자견적 공고 (투명성 제고를 위해 원할 경우)
    options.push({
      ...CONTRACT_METHODS.ELECTRONIC_QUOTATION,
      tag: '투명성 최우선 (전자공고)',
      tagColor: 'amber',
      conditionText: '2천만원 이하여도 투명한 공개경쟁을 희망할 경우 선택 가능',
      featureText: `G2B 나라장터 또는 S2B 학교장터 2인 견적 공고 (낙찰하한율 ${category === 'construction' ? '89.745%' : '90%'} 적용)`,
      isDefault: false,
      badgeText: '전자공고'
    });
  }
  // 2. 추정가격 2,000만 원 초과 ~ 5,000만 원 이하: 소액수의 경쟁 & 배려기업 특례 구간
  else if (price <= 50000000) {
    // 2-1. 지정정보처리장치 2인 이상 견적제출 수의계약 (기본 원칙)
    options.push({
      ...CONTRACT_METHODS.ELECTRONIC_QUOTATION,
      tag: '법정 기본 원칙 (전자공고)',
      tagColor: 'blue',
      conditionText: '일반 사업자 누구나 참가 가능 (지역/면허 자격제한 공고 가능)',
      featureText: `G2B 나라장터(원칙) 또는 S2B 학교장터 공고 / 공고기간 최소 3일 / 낙찰하한율 ${category === 'construction' ? '89.745%' : (typeCode === 'B06' ? '90%' : '88%')}`,
      isDefault: true,
      badgeText: '법정 원칙'
    });

    // 2-2. 취약계층 특례 1인 견적 수의계약 (5천만원 이하 특례)
    options.push({
      ...CONTRACT_METHODS.SOLE_SOURCE_AFFIRMATIVE,
      tag: '법정 특례 (1인 수의 가능)',
      tagColor: 'emerald',
      conditionText: '중기부 발급 여성기업, 장애인기업 확인서 또는 취약계층 30% 고용 사회적기업',
      featureText: '전자공고 없이 지정 배려기업과 1인 견적으로 바로 체결 가능 (5천만원 이하 특례)',
      isDefault: false,
      badgeText: '공고 생략 특례'
    });

    // 2-3. 물품인 경우: 조달청 종합쇼핑몰 직접구매 및 급식식재료 eaT
    if (category === 'goods') {
      options.push({
        ...CONTRACT_METHODS.PROCUREMENT_MAS,
        tag: '조달몰 구매 (심의 필수)',
        tagColor: 'cyan',
        conditionText: '종합쇼핑몰 등록 물품 (1억원 미만 중기간물품)',
        featureText: '복잡한 2단계경쟁 없이 쇼핑몰에서 바로 구매 (⚠️ 교내 물품선정위원회 심의 필수)',
        isDefault: false,
        badgeText: '쇼핑몰 직접구매'
      });

      options.push({
        ...CONTRACT_METHODS.MEAL_SERVICE_EAT,
        tag: '급식 식재료 전자견적 (eaT)',
        tagColor: 'emerald',
        conditionText: '학교 급식용 농·수·축산물, 공산품, 김치 등 구매 시',
        featureText: 'aT 학교급식전자조달시스템(eaT)을 통한 2인 이상 전자견적 제출 수의계약 (낙찰하한율 적용)',
        isDefault: false,
        badgeText: '급식 식재료 (eaT)'
      });
    }

    // 2-4. 중증장애인생산품 생산시설 특례 (물품·용역 한정, 공사 제외)
    if (category !== 'construction') {
      options.push({
        ...CONTRACT_METHODS.SOLE_SOURCE_DISABLED_FACILITY,
        tag: '금액 무제한 특례',
        tagColor: 'purple',
        conditionText: '보건복지부 지정시설 직접생산 제품/용역',
        featureText: '금액 한도 제한 없이 1인 견적 수의계약 / 동일업체 연간 4회 제한 적용 제외',
        isDefault: false,
        badgeText: '금액 무제한'
      });
    }
  }
  // 3. 추정가격 5,000만 원 초과 ~ 1억 원 이하 / 2억 원 이하
  else if (price <= 100000000) {
    if (category === 'construction') {
      // 전문공사 1억 이하: G2B 2인 전자견적
      options.push({
        ...CONTRACT_METHODS.G2B_ELECTRONIC_QUOTATION,
        tag: 'G2B 전자견적 소액수의',
        tagColor: 'blue',
        conditionText: '해당 공종 전문건설업 면허 등록업체',
        featureText: '나라장터(G2B) 2인 전자견적 공고 / 낙찰하한율 89.745% (A값 감액 산식) / 적격심사 생략',
        isDefault: true,
        badgeText: '소액수의 공고'
      });

      options.push({
        ...CONTRACT_METHODS.LIMITED_COMPETITIVE_BID,
        tag: '제한경쟁입찰 (적격심사)',
        tagColor: 'indigo',
        conditionText: '서울시 관내 등록 건설업체 (실적 또는 지역 제한)',
        featureText: '입찰공고 최소 7일 / 적격심사(수행능력+입찰가격)를 통한 낙찰자 결정',
        isDefault: false,
        badgeText: '경쟁입찰'
      });
    } else {
      // 용역 및 물품 1억 이하: 전자견적 가능
      options.push({
        ...CONTRACT_METHODS.ELECTRONIC_QUOTATION,
        tag: '전자견적 수의계약',
        tagColor: 'blue',
        conditionText: '해당 용역/물품 사업자 등록업체 (추정가격 1억원 이하 소액수의)',
        featureText: `G2B 나라장터 또는 S2B 학교장터 2인 견적 공고 / 낙찰하한율 ${typeCode === 'B06' ? '90%' : '88%'}`,
        isDefault: true,
        badgeText: '1억 이하 소액수의'
      });

      if (category === 'goods') {
        options.push({
          ...CONTRACT_METHODS.PROCUREMENT_MAS,
          tag: '쇼핑몰 직접구매 (1억 미만)',
          tagColor: 'cyan',
          conditionText: '종합쇼핑몰 등록 물품 (1억원 미만으로 2단계 경쟁 없이 직접구매 가능)',
          featureText: '교내 물품선정위원회 심의 후 쇼핑몰에서 바로 납품요구',
          isDefault: false,
          badgeText: '쇼핑몰 직접구매'
        });

        options.push({
          ...CONTRACT_METHODS.MEAL_SERVICE_EAT,
          tag: '급식 식재료 소액수의 (eaT)',
          tagColor: 'emerald',
          conditionText: '학교 급식 식재료(농수축산물, 공산품, 김치 등) 정기/분기 구매 시',
          featureText: 'aT 학교급식전자조달시스템(eaT) 2인 이상 전자견적 수의계약 공고 (1억원 이하 소액수의)',
          isDefault: false,
          badgeText: '급식 식재료 (eaT)'
        });
      }

      options.push({
        ...CONTRACT_METHODS.TWO_STAGE_BIDDING,
        tag: '품질·가격 동시입찰',
        tagColor: 'amber',
        conditionText: '교복구매, 앨범, 학생 수련활동 등 품질 확보가 필수인 사업',
        featureText: '1단계 제안서(품평회) 평가 ➔ 적격자에 한하여 2단계 가격개찰 실시',
        isDefault: false,
        badgeText: '품질 검증 필수'
      });

      options.push({
        ...CONTRACT_METHODS.NEGOTIATED_CONTRACT,
        tag: '협상에 의한 계약',
        tagColor: 'emerald',
        conditionText: '기획력과 전문기술이 요구되는 교육정보화 또는 위탁 용역',
        featureText: '제안서 평가(기술 80% + 가격 20%)를 거쳐 협상적격자 선정',
        isDefault: false,
        badgeText: '제안서 평가'
      });
    }

    // 공통 중증장애인 특례 (물품·용역 한정, 공사 제외)
    if (category !== 'construction') {
      options.push({
        ...CONTRACT_METHODS.SOLE_SOURCE_DISABLED_FACILITY,
        tag: '금액 무제한 특례',
        tagColor: 'purple',
        conditionText: '보건복지부 지정시설 직접생산 제품/용역',
        featureText: '1억원 이하도 금액 제한 없이 1인 견적 수의계약 가능',
        isDefault: false,
        badgeText: '금액 무제한'
      });
    }
  }
  // 4. 추정가격 1억 원 초과 (고액 계약)
  else {
    if (category === 'construction') {
      const isOtherConst = ['B36_ELEC', 'B36_COMM', 'B36_FIRE'].includes(typeCode); // 전기, 통신, 소방 (기타공사 법정 한도 1.6억)
      // 전문건설(B15), 가스시설(B36_GAS), 승강기설치(B36_LIFT), 석면해체(B36_ASBESTOS)는 건산법상 전문공사 한도 2억 적용
      const smallLimit = isOtherConst ? 160000000 : 200000000;
      const limitLabel = isOtherConst ? '전기·통신·소방 1.6억 이하' : '전문공사(가스·승강기·석면 포함) 2억 이하';
      const tradeName = isOtherConst ? '전기·통신·소방' : '전문건설(가스·승강기·석면)';

      if (price <= smallLimit) {
        // 소액수의 전자견적 가능 구간
        options.push({
          ...CONTRACT_METHODS.G2B_ELECTRONIC_QUOTATION,
          tag: `G2B 전자견적 소액수의 (${limitLabel})`,
          tagColor: 'blue',
          conditionText: isOtherConst
            ? '해당 공종(전기·통신·소방) 면허 등록업체 (기타공사 법정 소액수의 한도 1.6억 원 이하)'
            : '해당 공종 전문건설업(가스·승강기·석면 포함) 면허 등록업체 (전문공사 법정 소액수의 한도 2억 원 이하)',
          featureText: '나라장터(G2B) 2인 이상 전자견적 공고 / 낙찰하한율 89.745% (A값 감액 산식) / 적격심사 생략',
          isDefault: true,
          badgeText: limitLabel
        });

        options.push({
          ...CONTRACT_METHODS.LIMITED_COMPETITIVE_BID,
          tag: '제한경쟁입찰 (적격심사)',
          tagColor: 'indigo',
          conditionText: `서울시 관내 등록 ${tradeName}업체 (실적 또는 지역 제한)`,
          featureText: 'G2B 입찰공고(7일~14일) / 행안부 적격심사(수행능력+입찰가격)를 거쳐 낙찰자 결정',
          isDefault: false,
          badgeText: '경쟁입찰'
        });
      } else {
        // 법정 소액수의 한도 초과: 경쟁입찰 필수
        options.push({
          ...CONTRACT_METHODS.LIMITED_COMPETITIVE_BID,
          tag: `일반(제한)경쟁입찰 (${isOtherConst ? '1.6억' : '2억'} 초과 적격심사 필수)`,
          tagColor: 'blue',
          conditionText: isOtherConst
            ? '기타공사(전기·통신·소방) 소액수의 한도(추정가격 1억 6천만 원) 초과 공사 (서울시 지역제한 등)'
            : '전문공사(가스·승강기·석면) 소액수의 한도(추정가격 2억 원) 초과 공사 (서울시 지역제한 등)',
          featureText: '소액수의 불가 / G2B 나라장터 정규 입찰공고(7일~14일) / 행안부 적격심사 필수',
          isDefault: true,
          badgeText: `${isOtherConst ? '1.6억' : '2억'} 초과 경쟁입찰`
        });
      }
    } else {
      options.push({
        ...CONTRACT_METHODS.LIMITED_COMPETITIVE_BID,
        tag: '경쟁입찰 (적격심사)',
        tagColor: 'blue',
        conditionText: '지역제한(서울시) 또는 면허·실적 제한 가능',
        featureText: 'G2B 나라장터 입찰공고(7일~14일) / 행안부·조달청 적격심사 기준 적용',
        isDefault: true,
        badgeText: '경쟁입찰'
      });
    }

    if (category === 'goods') {
      options.push({
        ...CONTRACT_METHODS.PROCUREMENT_MAS,
        tag: '쇼핑몰 MAS 2단계 경쟁',
        tagColor: 'cyan',
        conditionText: '조달청 다수공급자계약(MAS) 물품 중 1억원 이상 구매 시',
        featureText: '쇼핑몰 내 5개사 이상 비교제안 요청 ➔ 최저가 또는 종합평가 낙찰자 선정',
        isDefault: false,
        badgeText: '2단계 경쟁'
      });

      options.push({
        ...CONTRACT_METHODS.MEAL_SERVICE_EAT,
        tag: '급식 식재료 경쟁입찰 (eaT)',
        tagColor: 'emerald',
        conditionText: '학교 급식 식재료 연간/학기 대규모 조달',
        featureText: 'aT 학교급식전자조달시스템(eaT) 일반(제한)경쟁입찰 공고 및 적격심사/최저가 낙찰',
        isDefault: false,
        badgeText: '급식 식재료 입찰'
      });
    }

    if (category === 'service') {
      options.push({
        ...CONTRACT_METHODS.TWO_STAGE_BIDDING,
        tag: '2단계 규격·가격 동시입찰 (방과후학교 대표)',
        tagColor: 'amber',
        conditionText: '🏫 방과후학교 프로그램 위탁운영, 수련활동 등',
        featureText: '학교 대규모 용역의 대부분을 차지하는 방과후학교 위탁 시 주로 활용 / 제안서(프로그램·강사) 평가 적격자 대상 가격개찰',
        isDefault: true,
        badgeText: '방과후학교 주계약'
      });

      options.push({
        ...CONTRACT_METHODS.NEGOTIATED_CONTRACT,
        tag: '협상에 의한 계약 (방과후·늘봄 위탁)',
        tagColor: 'emerald',
        conditionText: '🏫 방과후학교 프로그램 및 늘봄학교 전체위탁, 전문 위탁사업',
        featureText: '제안서 기술평가(80%) + 가격평가(20%) 합산 고득점 순 협상 / 학교운영위원회 심의 필수',
        isDefault: false,
        badgeText: '방과후·늘봄 위탁'
      });
    } else if (category !== 'construction') {
      options.push({
        ...CONTRACT_METHODS.TWO_STAGE_BIDDING,
        tag: '2단계 규격·가격 동시입찰',
        tagColor: 'amber',
        conditionText: '교복구매, 졸업앨범, 수련활동 등',
        featureText: '제안서(품평회) 평가 통과자 대상 가격개찰',
        isDefault: false,
        badgeText: '2단계 입찰'
      });

      options.push({
        ...CONTRACT_METHODS.NEGOTIATED_CONTRACT,
        tag: '협상에 의한 계약',
        tagColor: 'emerald',
        conditionText: '소프트웨어 개발, 시스템 운영, 학술/기획 위탁사업',
        featureText: '기술능력평가(80%) + 가격평가(20%) 합산 고득점 순 협상',
        isDefault: false,
        badgeText: '제안서 평가'
      });
    }

    // 중증장애인은 1억 초과도 무제한 특례! (물품·용역 한정, 공사 제외)
    if (category !== 'construction') {
      options.push({
        ...CONTRACT_METHODS.SOLE_SOURCE_DISABLED_FACILITY,
        tag: '금액 무제한 특례',
        tagColor: 'purple',
        conditionText: '보건복지부 지정시설 직접생산 제품/용역',
        featureText: '1억 초과 고액이어도 법률상 금액한도 없이 1인 견적 수의계약 가능 (특별법 제7조)',
        isDefault: false,
        badgeText: '금액 무제한'
      });
    }
  }

  return options;
}

/**
 * 2) 선택된 계약방법별 실무 진행 절차(Roadmap) 생성
 */
export function getContractMethodRoadmap(methodId, category, price, typeCode = '') {
  const isGoods = category === 'goods';
  const isConst = category === 'construction';
  const isSoleSource = methodId.includes('SOLE_SOURCE');
  const isProcurementMas = methodId === 'PROCUREMENT_MAS';
  const isMealEat = methodId === 'MEAL_SERVICE_EAT';
  const isCompetitiveBid = methodId.includes('COMPETITIVE_BID');
  const isTwoStage = methodId === 'TWO_STAGE_BIDDING';
  const isNegotiated = methodId === 'NEGOTIATED_CONTRACT';

  // 1단계: 계획 수립 및 심의/품의
  let step1Title = '사업 계획 수립 및 품의';
  let step1Desc = '사업계획 수립, 소요예산 산출, 계약방법 결정, 일상감사 대상 여부 점검';
  let step1Badge = '계획 수립';

  if (isMealEat) {
    step1Title = '급식 운영계획 수립 및 심의';
    step1Desc = '학교급식 운영계획 수립, 소요량 산출, 학교운영위원회(급식소위) 심의, eaT 공고 규격서 작성';
    step1Badge = '급식소위 심의';
  } else if (isProcurementMas) {
    step1Title = '사업 계획 수립 및 물품선정 심의';
    step1Desc = price > 20000000
      ? '소요예산 산출, 교내 「물품선정위원회」 심의 개최(2천만원 초과 필수), 쇼핑몰 등록 규격 확정'
      : '사업계획 수립, 소요예산 산출, 종합쇼핑몰 등록 품목 및 납품조건 확인';
    step1Badge = price > 20000000 ? '선정위 심의' : '계획 수립';
  } else if (isSoleSource) {
    step1Title = '사업 계획 수립 및 수의계약 품의';
    step1Desc = '사업계획 수립, 소요예산 산출, 1인 수의계약 사유서 작성, 동일업체 연간 4회 제한 점검';
    step1Badge = '계획 및 품의';
  }

  // 2단계: 견적 접수 / 공고 / 쇼핑몰
  let step2Title = '안내공고(입찰공고) 게시';
  let step2Desc = 'G2B/S2B에 안내공고문 게시 (공고기간 최소 3일~7일 이상 준수, 토·공휴일 제외)';
  let step2Badge = '공고 게시';

  if (isSoleSource) {
    step2Title = price <= 1000000 ? '견적 검토 (또는 가격확인)' : '견적서 접수 및 단가 검토';
    step2Desc = price <= 1000000
      ? '추정가격 100만 원 이하는 견적서 징구 생략 가능(가격비교 사이트·주문서 확인 가능) ➔ 사업자등록증 및 통장사본 확인'
      : '업체로부터 견적서, 사업자등록증, 통장사본(배려기업 확인서) 접수 및 예정가격 대비 적합성 검토';
    step2Badge = price <= 1000000 ? '견적확인(생략가능)' : '1인 견적 접수';
  } else if (isProcurementMas) {
    step2Title = '쇼핑몰 규격 검토 및 장바구니 담기';
    step2Desc = '나라장터 종합쇼핑몰에서 선정된 물품 장바구니 담기 및 규격·단가·인도조건 검토';
    step2Badge = '쇼핑몰 담기';
  } else if (isMealEat) {
    step2Title = 'eaT 전자조달 공고(견적요청)';
    step2Desc = 'aT 학교급식전자조달(eaT) 시스템에 품목별 규격서 및 전자견적(입찰) 공고 게시 (HACCP 인증업체 대상)';
    step2Badge = 'eaT 공고';
  } else if (methodId.includes('ELECTRONIC_QUOTATION')) {
    step2Title = '2인 이상 전자견적 제출 공고';
    step2Desc = 'G2B 나라장터 또는 S2B 학교장터에 소액수의 전자견적 공고문 게시 (공고기간 3일~5일)';
    step2Badge = '전자견적 공고';
  } else if (isTwoStage) {
    step2Title = '2단계 규격·가격 동시입찰 공고';
    step2Desc = 'G2B 나라장터에 입찰공고 및 제안요청서(규격/품평회) 게시 (공고기간 최소 7일~14일 이상)';
    step2Badge = '2단계 공고';
  } else if (isNegotiated) {
    step2Title = '협상에 의한 계약 입찰공고';
    step2Desc = 'G2B 나라장터에 입찰공고 및 제안요청서 게시 (공고기간 최소 20일, 긴급 시 10일)';
    step2Badge = '협상 입찰공고';
  }

  // 3단계: 계약상대자(낙찰자) 결정 및 계약 체결
  let step3Title = '낙찰자 결정 및 계약 체결';
  let step3Desc = '개찰 및 결격사유 조회 ➔ 전자계약서 체결, 계약보증금(10%) 징구, 인지세 납부 확인';
  let step3Badge = '계약 체결';

  if (isSoleSource) {
    if (methodId === 'SOLE_SOURCE_DISABLED_FACILITY') {
      step3Title = price <= 50000000
        ? '계약상대자 결정 및 계약 체결 (또는 승낙사항 대체)'
        : '계약상대자 결정 및 계약 체결 (정식 계약서 작성 필수)';
      step3Desc = price <= 50000000
        ? '계약상대자(생산시설) 결정 및 견적 합의 ➔ 2026 수의계약 통합서약서(1종) 징구 ➔ 추정가격 5천만원 이하 소액수의로 정식 계약서 대신 승낙사항(주문서) 대체 가능 및 계약보증금 지급확약서 갈음'
        : '계약상대자(생산시설) 결정 및 견적 합의 ➔ 2026 수의계약 통합서약서 징구 ➔ 중증장애인생산품 특례로 금액 제한 없이 1인 수의계약 체결 (5천만원 초과 시 정식 전자계약서 작성, 계약보증금 10% 납부, 인지세 납부 확인)';
    } else {
      step3Title = price <= 50000000
        ? '계약상대자 결정 및 계약 체결 (또는 승낙사항 대체)'
        : '계약상대자 결정 및 계약 체결 (정식 계약서 작성 필수)';
      step3Desc = price <= 50000000
        ? '계약상대자 결정(견적서 수용) ➔ 2026 수의계약 통합서약서(1종) 징구 ➔ 추정가격 5천만원 이하 소액수의로 정식 계약서 대신 승낙사항(주문서) 대체 가능 및 계약보증금 지급확약서 갈음'
        : '계약상대자 결정(견적 협의) ➔ 2026 수의계약 통합서약서 징구 ➔ 법정 수의계약 사유에 따라 정식 전자계약서 체결, 계약보증금(10%) 징구, 인지세 납부 확인';
    }
    step3Badge = '계약상대자 결정';
  } else if (isProcurementMas) {
    step3Title = '납품요구서 전송 및 발주 확정';
    step3Desc = '나라장터 종합쇼핑몰에서 계약상대자에게 납품요구서 전송 (쇼핑몰 납품요구서가 계약서로 대체됨) 및 K-에듀파인 품의 연동';
    step3Badge = '납품요구';
  } else if (isMealEat) {
    step3Title = '개찰 및 낙찰자 결정 ➔ eaT 전자계약';
    step3Desc = 'eaT 개찰 및 적격업체 낙찰자 결정 ➔ 2026 수의계약 통합서약서 확인 ➔ eaT 시스템 전자계약 체결 및 전자보증서 접수';
    step3Badge = '낙찰 및 계약';
  } else if (methodId.includes('ELECTRONIC_QUOTATION')) {
    const quoteRate = category === 'construction'
      ? '89.745%'
      : (typeCode === 'B06' || price <= 20000000 ? '90%' : '88%');
    step3Title = '개찰 및 낙찰자 결정 ➔ 전자계약 체결';
    step3Desc = `전자개찰(낙찰하한율 ${quoteRate} 이상 최저가) ➔ 결격사유 조회 및 2026 수의계약 통합서약서 확인 ➔ G2B/S2B 전자계약 체결 및 보증금 확약`;
    step3Badge = '낙찰자 결정';
  } else if (isTwoStage) {
    step3Title = '제안서(규격) 평가 ➔ 가격개찰 ➔ 낙찰자 결정';
    step3Desc = '1단계 제안서(품평회) 적격자 선정 ➔ 2단계 가격개찰(예정가격 이하 최저가 낙찰) ➔ 전자계약 체결';
    step3Badge = '낙찰자 결정';
  } else if (isNegotiated) {
    step3Title = '제안서 평가 ➔ 우선협상 및 계약 체결';
    step3Desc = '기술능력평가(80%) + 가격평가(20%) 종합 1순위 협상적격자 선정 ➔ 기술 및 가격 협상 완료 후 최종 계약 체결';
    step3Badge = '협상 및 계약';
  } else if (isCompetitiveBid) {
    step3Title = '개찰 및 적격심사 ➔ 낙찰자 결정 및 계약';
    step3Desc = '개찰 ➔ 1순위자 적격심사(수행능력+입찰가격) 서류 검토 ➔ 최종 낙찰자 결정 ➔ 나라장터 전자계약 체결(보증금 10%)';
    step3Badge = '적격심사 낙찰';
  }

  // 4단계: 착공 / 납품 / 착수
  let step4Title = isConst ? '착공계 제출 및 현장 시공' : (isGoods ? '물품 제작 및 납품 준비' : '착수계 제출 및 과업 수행');
  let step4Desc = isConst
    ? (price < 10000000
      ? '1천만원 미만 공사: 착공계·공정표 생략 가능, 전·후 사진 촬영 및 안전관리'
      : '착공계, 현장대리인계, 공정표, 안전보건 체크리스트 제출 및 시공 착수')
    : (isGoods
      ? '납품기한 및 장소 확인, 규격 제품 제작/출고, 학교 납품 일정 협의'
      : '착수계 및 과업수행계획서 접수 (5백만원 미만 용역은 착수계 생략 가능)');
  let step4Badge = '수행 및 납품';

  if (isMealEat) {
    step4Title = '일일 식재료 납품 및 조리실 대면 검수';
    step4Desc = '매일 아침 지정시간 냉장·보랭 배송 납품 ➔ 영양(교)사 및 조리사 입회 하에 신선도·원산지·온도 대면 검수';
    step4Badge = '일일 검수';
  } else if (isProcurementMas) {
    step4Title = '조달업체 납품 및 학교 현장 설치';
    step4Desc = '조달등록 공급업체의 학교 현장 직접 배송 및 설치·시운전 완료';
    step4Badge = '조달 납품';
  }

  // 5단계: 준공 및 완료 검사·검수
  let step5Title = '준공 및 완료 검사·검수';
  let step5Desc = price <= 30000000
    ? '준공(완료/납품) 확인 ➔ 3천만원 이하로 검사조서 작성 생략 가능 (지출결의서 검사인 날인 갈음)'
    : '준공(완료)계 접수 ➔ 학교 검사공무원 입회 하에 정식 검사·검수조서 작성';
  let step5Badge = '검사·검수';

  if (isMealEat) {
    step5Title = '월간 납품 검수조서 확인 및 정산';
    step5Desc = '월별 납품확인서 집계 및 eaT 식재료 납품대금 검수·정산 확인';
    step5Badge = '식재료 정산';
  } else if (isProcurementMas) {
    step5Title = '나라장터 물품납품및영수증 검수·승인';
    step5Desc = '학교 검수공무원의 조달청 나라장터 「물품납품및영수증」 전자 승인 (별도 자체 검수조서 대체)';
    step5Badge = '영수증 승인';
  }

  // 6단계: 대금 청구 및 지출결의
  const step6Title = '대금 청구 및 지출결의';
  const step6Desc = '대가청구서, 전자세금계산서, 4대보험 완납증명서(5백만원 이상) 접수 ➔ 하자보수보증금 및 채권 매입 확인 ➔ 계좌입금 (5일 이내 지급)';
  const step6Badge = '지출 완료';

  return [
    { step: '1단계', title: step1Title, desc: step1Desc, badge: step1Badge },
    { step: '2단계', title: step2Title, desc: step2Desc, badge: step2Badge },
    { step: '3단계', title: step3Title, desc: step3Desc, badge: step3Badge },
    { step: '4단계', title: step4Title, desc: step4Desc, badge: step4Badge },
    { step: '5단계', title: step5Title, desc: step5Desc, badge: step5Badge },
    { step: '6단계', title: step6Title, desc: step6Desc, badge: step6Badge }
  ];
}

/**
 * 3) 선택된 계약방법의 최종 맞춤형 실무 패키지 정보 일괄 조립
 */
export function getContractPackageDetails({ category, estimatedPrice, methodId, targetPlatform = 'G2B', isFemaleCompany = false, typeCode = '', projectTitle = '' }) {
  const price = Number(estimatedPrice) || 0;
  const baseMethod = CONTRACT_METHODS[methodId] || CONTRACT_METHODS.SOLE_SOURCE_GENERAL;
  const method = { ...baseMethod };

  if (methodId === 'ELECTRONIC_QUOTATION' || methodId === 'G2B_ELECTRONIC_QUOTATION') {
    if (category === 'construction') {
      method.lowerRate = '예정가격 대비 89.745% 이상 (A값 감액 산식 적용, 결격사유 없는 최저가)';
    } else if (typeCode === 'B06' || price <= 20000000) {
      method.lowerRate = '예정가격 대비 90% 이상 (2천만 이하 소액견적 또는 도서구매 특례)';
    } else {
      method.lowerRate = '예정가격 대비 88% 이상 (결격사유 없는 최저가)';
    }
  }

  // 1. 진행 절차 로드맵
  const roadmap = getContractMethodRoadmap(methodId, category, price, typeCode);

  // 2. 감사 주의사항 및 안전장치 경보
  const auditWarnings = [];
  if (price > 20000000 && methodId === 'SOLE_SOURCE_GENERAL') {
    auditWarnings.push({
      level: 'critical',
      title: '추정가격 2,000만 원 초과 1인 수의 불가 경보',
      message: '일반 기업과의 1인 견적 수의계약은 추정가격 2,000만 원 이하만 가능합니다. 2천만 원 초과 시 2인 이상 전자견적 공고 또는 여성·장애인기업 특례를 적용해야 합니다.'
    });
  }
  if (price > 50000000 && methodId === 'SOLE_SOURCE_AFFIRMATIVE') {
    auditWarnings.push({
      level: 'critical',
      title: '배려기업 특례 한도(5,000만 원) 초과 경보',
      message: '여성기업·장애인기업·사회적기업 1인 수의 특례는 추정가격 5,000만 원 이하까지만 적용됩니다. 5,000만 원 초과 시 2인 견적 공고 또는 경쟁입찰을 진행해야 합니다.'
    });
  }
  if (category === 'goods' && price > 20000000) {
    const isExemptGoods = ['B18', 'B01'].includes(typeCode);
    if (!isExemptGoods) {
      auditWarnings.push({
        level: 'warning',
        title: '교내 「물품선정위원회」 심의 필수 (2026.9 규정 준수)',
        message: '추정가격 2,000만 원 초과 물품 구매는 특혜 시비 방지를 위해 교내 물품선정위원회 심의 필수입니다. (위원 5~10인, 외부위원 1/2 이상, 학교장·행정실장·계약담당자 위원 제외, 참석위원 청렴·보안 통합서약서 징구 필수, 평가표 첨부)'
      });
    } else {
      auditWarnings.push({
        level: 'info',
        title: '물품선정위원회 심의 생략 가능 (식자재·정형 규격)',
        message: '급식 식자재·우유 등 식자재 및 소모품류는 서울시교육청 물품선정위원회 운영 규정(2026.9 제3조)에 따라 물품선정위원회 심의를 생략할 수 있습니다. (학교운영위원회/급식소위원회 심의로 갈음)'
      });
    }
  }
  if (methodId !== 'SOLE_SOURCE_DISABLED_FACILITY' && price >= 5000000) {
    auditWarnings.push({
      level: 'info',
      title: '동일업체 연간 4회 계약 제한 준수 여부 점검',
      message: '동일 업체와의 수의계약 체결 횟수가 이번 건을 포함하여 당해 회계연도 총 4회를 초과하지 않는지 확인하십시오. (배려기업, 조달몰 직접구매 등은 제외)'
    });
  }
  if (category === 'service' && price >= 100000000) {
    auditWarnings.unshift({
      level: 'info',
      title: '🏫 학교 대규모 용역(방과후학교 등) 업무 참고',
      message: '방과후학교 프로그램(업체위탁) 등 대형 용역의 경우 가격 경쟁뿐 아니라 프로그램·강사 검증이 중요하므로 2단계(규격-가격 동시) 입찰 또는 협상에 의한 계약이 주로 적용됩니다. 계약 전 교내 소위원회 및 학교운영위원회 심의를 거쳤는지 점검하십시오.'
    });
  }
  if (category === 'construction' && typeCode.startsWith('B36')) {
    if (typeCode === 'B36_ASBESTOS') {
      auditWarnings.unshift({
        level: 'critical',
        title: '⚠️ 석면해체·제거공사 법정 의무 분리발주 (통합발주 형사처벌 대상!)',
        message: '석면 해체·제거 작업은 「산업안전보건법」 제121조에 따라 다른 건축·철거공사와 반드시 분리하여 고용노동부 등록 석면해체·제거업자에게 개별 발주해야 합니다(일괄 통합 발주 시 5년 이하 징역 또는 5천만 원 이하 벌금 대상). 착공 전 노동청 작업신고필증 및 준공 시 실내 공기 중 석면농도(0.01개/㎤ 이하) 측정결과표와 올바로시스템(Allbaro) 폐석면 인계확인서를 필히 확인하십시오.'
      });
    } else if (typeCode === 'B36_GAS') {
      auditWarnings.unshift({
        level: 'warning',
        title: '🔥 가스시설공사 전문면허 분리발주 및 완성검사 확인',
        message: '가스설비공사(급식실 배관, GHP 냉난방 인입 등)는 화재·폭발 위험성이 높아 「도시가스사업법」 및 「건설산업기본법」에 따라 일반 건축·설비공사와 분리하여 가스시설시공업(제1종) 면허 등록업체와 분리 계약해야 합니다. 준공 전 한국가스안전공사 또는 도시가스사업자의 완성검사필증(합격증) 교부 여부를 반드시 점검하십시오.'
      });
    } else if (typeCode === 'B36_LIFT') {
      auditWarnings.unshift({
        level: 'warning',
        title: '🛗 승강기설치공사 전문 분리발주 및 설치완료검사 확인',
        message: '장애인용 승강기(엘리베이터) 신설·교체 및 급식용 덤웨이터는 「승강기안전관리법」 및 「건설산업기본법」에 따라 일반 건축공사와 분리하여 승강기설치공사업 면허 및 승강기 제조업·설치업 자격을 갖춘 업체와 분리 계약해야 합니다. 한국승강기안전공단(KoELSA) 설치검사 합격증이 발급되어야 비로소 승강기 운행이 가능합니다.'
      });
    } else {
      const fieldName = typeCode === 'B36_ELEC' ? '전기공사' : (typeCode === 'B36_COMM' ? '정보통신공사' : (typeCode === 'B36_FIRE' ? '소방시설공사' : '전기·통신·소방공사'));
      const lawName = typeCode === 'B36_ELEC' ? '「전기공사업법」 제11조' : (typeCode === 'B36_COMM' ? '「정보통신공사업법」 제25조' : (typeCode === 'B36_FIRE' ? '「소방시설공사업법」 제21조' : '개별법'));
      auditWarnings.unshift({
        level: 'warning',
        title: `⚡ ${fieldName} 법정 의무 분리발주(분리도급) 점검`,
        message: `${fieldName}는 ${lawName}에 따라 건축·토목 등 다른 공종과 분리하여 독립 발주하여야 합니다. 건축공사에 일괄 포함하여 발주할 경우 교육청 감사 지적 및 행정처분(과태료) 대상이 되므로 반드시 해당 면허를 소지한 전문업체와 분리 계약하십시오.`
      });
    }
  }

  if (['B07', 'B12', 'B13'].includes(typeCode)) {
    auditWarnings.unshift({
      level: 'warning',
      title: '🏕️ 현장체험학습 분할 수의계약 금지 및 안전관리 점검 (2026 길라잡이)',
      message: '동일 학년 또는 유사한 행사로 90일 이내에 실시되는 현장체험학습(수학여행·수련활동·차량임차 등)은 원칙적으로 통합 발주하여야 하며, 시기별·학급별 분할 수의계약 체결 시 감사 지적 대상입니다. 또한 여행사 위탁 시 일반관리비(5% 이하) 및 이윤(10% 이하) 상한선을 엄격히 준수하십시오. (지방계약법 시행규칙 제8조, ★2026학년도 현장체험학습 길라잡이)'
    });
    if (typeCode === 'B13') {
      auditWarnings.unshift({
        level: 'info',
        title: '🏕️ 청소년수련시설 용역 부가가치세 면세 안내',
        message: '청소년활동진흥법에 따라 허가·등록된 청소년수련시설이 제공하는 숙식·수련교육용역은 「부가가치세법 시행령」 제36조에 따른 면세 용역입니다. 따라서 견적금액 총액이 곧 추정가격이며, 대가 지급 시 전자계산서(면세)를 징구합니다.'
      });
    }
  }

  // 3. 필수 구비서류
  const requiredDocs = generateRequiredDocsList(category, methodId, price, typeCode);

  // 4. K-에듀파인 기안문 사유서
  const baseTypeName = category === 'construction' ? '시설보수 및 개선공사' : (category === 'service' ? '교육행정 지원용역' : '교육용 기자재 및 물품구매');
  const typeObj = getTypeNameByCode(typeCode);
  const typeName = typeObj ? typeObj.name : baseTypeName;

  const memoText = generateDraftMemoText({
    category,
    typeName,
    typeCode,
    projectTitle,
    estimatedPrice: price,
    selectedMethod: method,
    targetPlatform,
    isFemaleCompany: methodId === 'SOLE_SOURCE_AFFIRMATIVE' || isFemaleCompany,
    auditWarnings,
    requiredDocs
  });

  return {
    method,
    roadmap,
    auditWarnings,
    requiredDocs,
    memoText,
    estimatedPrice: price,
    totalPrice: Math.round(price * 1.1)
  };
}

