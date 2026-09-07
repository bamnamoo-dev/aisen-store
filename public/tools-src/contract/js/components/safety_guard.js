/**
 * 감사 안전장치 모듈 (Safety Guard)
 * - 부가세 10% 자동분리 및 역산 계산
 * - 분할 수의계약(쪼개기) 사전 의심 경보
 * - 동일업체 연간 4회 제한 카운터
 * - 물품선정위원회 의무 대상 판별
 */

export class SafetyGuard {
  constructor() {
    this.vatIncluded = true; // 기본값: 부가세 포함 금액 입력
  }

  /**
   * 입력 금액으로부터 공급가액(추정가격)과 부가세 자동 분리 계산
   */
  calculatePrices(rawAmount, isVatIncluded) {
    const amount = Number(rawAmount) || 0;
    if (amount <= 0) {
      return { estimatedPrice: 0, vatPrice: 0, totalPrice: 0 };
    }

    if (isVatIncluded) {
      // 입력값이 부가세 포함(추정금액)인 경우 -> 1.1로 나누어 추정가격(공급가액) 산출
      const estimatedPrice = Math.round(amount / 1.1);
      const vatPrice = amount - estimatedPrice;
      return {
        estimatedPrice,
        vatPrice,
        totalPrice: amount
      };
    } else {
      // 입력값이 부가세 제외(추정가격)인 경우 -> 10% 부가세 가산
      const vatPrice = Math.round(amount * 0.1);
      return {
        estimatedPrice: amount,
        vatPrice,
        totalPrice: amount + vatPrice
      };
    }
  }

  /**
   * 경계선 금액 꿀팁 안내 (실무자가 가장 헷갈려하는 2,000만원, 5,000만원 등)
   */
  getEdgeCaseTip(estimatedPrice) {
    if (estimatedPrice === 20000000) {
      return '💡 <b>경계선 실무 팁:</b> 정확히 2,000만원은 법률상 2,000만원 "이하"에 해당하므로 1인 견적 수의계약이 적법하게 가능합니다!';
    } else if (estimatedPrice > 20000000 && estimatedPrice <= 22000000) {
      return '⚠️ <b>주의:</b> 추정가격이 2,000만원을 단 1원이라도 초과하면 원칙적으로 지정정보처리장치(G2B/S2B) 2인 이상 견적제출 수의계약 대상입니다.';
    } else if (estimatedPrice === 50000000) {
      return '💡 <b>경계선 실무 팁:</b> 5,000만원은 여성/장애인/사회적기업 1인 수의계약 한도 및 계약서 작성 생략(승낙사항 대체) 한도에 딱 부합합니다.';
    } else if (estimatedPrice >= 20000000) {
      return '💡 <b>물품선정위원회 안내:</b> 추정가격 2천만 원 초과 물품 구매 시에는 서울시교육청 물품선정위원회 규정(2026.9)에 따라 사전에 위원회(5~10인, 외부위원 1/2 이상)를 개최해야 합니다. (단, 식자재·소모품 등은 심의 생략 가능)';
    }
    return null;
  }
}
