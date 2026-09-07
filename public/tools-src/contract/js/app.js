/**
 * 서울교육 계약나침반 - Progressive Accordion Application Controller
 * 중앙 1열 순차 아코디언 진행 방식 (종류 ➔ 금액 ➔ 방법선택 ➔ 맞춤형 실무가이드)
 */

import {
  getAvailableContractOptions,
  getContractPackageDetails
} from './rules/contract_rules.js';

import { OFFICIAL_SEN_TYPES } from './rules/items_catalog.js';

class ProgressiveContractCompassApp {
  constructor() {
    this.state = {
      category: null,            // 'construction' | 'service' | 'goods'
      typeCode: '',              // 세부 계약유형 코드 (예: B20, B08, B07 등)
      typeName: '',              // 세부 계약유형 이름 (예: 방과후학교 프로그램 위탁운영 등)
      rawAmount: 0,              // 사용자가 입력한 숫자
      vatIncluded: false,        // 부가가치세 포함 여부 (기본: 체크 해제)
      estimatedPrice: 0,         // 추정가격 (VAT 제외 기준)
      totalPrice: 0,             // 계약예정금액 (VAT 포함)
      selectedMethodId: null,    // 선택된 계약방법 ID
      activeStep: 1,             // 현재 활성 스텝 (1 ~ 4)
      availableOptions: []       // Step 3에서 도출된 계약방법 후보 목록
    };

    this.init();
  }

  init() {
    this.initTheme();
    this.bindGlobalActions();
    this.bindStep1Events();
    this.bindStep2Events();
    this.bindStep3Events();
    this.bindStep4Events();
  }

  // =========================================================================
  // 0. 테마 관리 (다크모드 / 라이트모드)
  // =========================================================================
  initTheme() {
    const savedTheme = localStorage.getItem('sen_contract_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme(savedTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sen_contract_theme', theme);

    const btnToggle = document.getElementById('btn-theme-toggle');
    if (btnToggle) {
      const icon = btnToggle.querySelector('.theme-icon');
      const text = btnToggle.querySelector('.theme-text');
      if (theme === 'dark') {
        if (icon) icon.textContent = '☀️';
        if (text) text.textContent = '라이트모드';
        btnToggle.setAttribute('title', '라이트모드로 전환');
      } else {
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = '다크모드';
        btnToggle.setAttribute('title', '다크모드로 전환');
      }
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    this.showToast(nextTheme === 'dark' ? '🌙 다크 모드로 전환되었습니다.' : '☀️ 라이트 모드로 전환되었습니다.');
  }

  // =========================================================================
  // 1. 글로벌 액션 (초기화, 토스트 등)
  // =========================================================================
  bindGlobalActions() {
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    const btnReset = document.getElementById('btn-reset-flow');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('모든 입력을 초기화하고 1단계(종류 선택)부터 다시 시작하시겠습니까?')) {
          this.resetToStep(1);
        }
      });
    }

    // 사용자 설명서 모달 제어
    const btnOpenManual = document.getElementById('btn-open-manual');
    const manualOverlay = document.getElementById('manual-modal-overlay');
    const btnCloseManual = document.getElementById('btn-close-manual');
    const btnDoneManual = document.getElementById('btn-done-manual');

    const openManual = () => {
      if (manualOverlay) {
        manualOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    };

    const closeManual = () => {
      if (manualOverlay) {
        manualOverlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    };

    window.openManualModal = openManual;
    window.closeManualModal = closeManual;
    window.toggleContractTheme = () => this.toggleTheme();
    window.resetContractFlow = () => {
      if (confirm('모든 입력을 초기화하고 1단계(종류 선택)부터 다시 시작하시겠습니까?')) {
        this.resetToStep(1);
      }
    };

    if (btnOpenManual) btnOpenManual.addEventListener('click', openManual);
    if (btnCloseManual) btnCloseManual.addEventListener('click', closeManual);
    if (btnDoneManual) btnDoneManual.addEventListener('click', closeManual);

    if (manualOverlay) {
      manualOverlay.addEventListener('click', (e) => {
        if (e.target === manualOverlay) closeManual();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && manualOverlay && manualOverlay.style.display === 'flex') {
        closeManual();
      }
    });
  }

  showToast(message) {
    const toast = document.getElementById('toast-flow-notice');
    const msgSpan = document.getElementById('toast-flow-message');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // 2. Step 1: 계약 종류 선택 (공사 / 용역 / 물품)
  // =========================================================================
  bindStep1Events() {
    const cardStep1 = document.getElementById('card-step1');
    const step1Header = document.getElementById('step1-header');
    const btnEdit1 = document.getElementById('btn-edit-step1');
    const tileBtns = document.querySelectorAll('.category-tile-btn');

    tileBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        this.selectCategory(cat, btn);
      });
    });

    // 헤더 또는 수정 버튼 클릭 시 스텝 1로 복귀
    if (step1Header) {
      step1Header.addEventListener('click', (e) => {
        if (cardStep1.classList.contains('completed')) {
          this.openStep(1);
        }
      });
    }
    if (btnEdit1) {
      btnEdit1.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openStep(1);
      });
    }
  }

  selectCategory(category, activeBtn) {
    this.state.category = category;
    this.state.typeCode = '';
    this.state.typeName = '';

    // 타일 UI 활성화 표시
    document.querySelectorAll('.category-tile-btn').forEach((b) => b.classList.remove('selected'));
    if (activeBtn) activeBtn.classList.add('selected');

    // 한글명 및 아이콘
    const catMeta = {
      construction: { name: '공사', icon: '🏗️', subTitle: '세부 공종 선택 (법정 분리발주 여부 등)' },
      service: { name: '용역', icon: '💼', subTitle: '세부 용역 유형 선택 (방과후·늘봄·청소·경비 등)' },
      goods: { name: '물품', icon: '📦', subTitle: '세부 물품 유형 선택 (급식·교복·조달·제조 등)' }
    }[category];

    // 세부 유형 선택 패널 렌더링
    this.renderSubtypePanel(category, catMeta);
  }

  renderSubtypePanel(category, catMeta) {
    const panel = document.getElementById('subtype-selection-panel');
    const iconEl = document.getElementById('subtype-title-icon');
    const textEl = document.getElementById('subtype-title-text');
    const guideEl = document.getElementById('subtype-title-guide');
    const container = document.getElementById('subtype-chips-container');

    if (!panel || !container) {
      this.confirmStep1Selection();
      return;
    }

    if (iconEl) iconEl.textContent = catMeta.icon;
    if (textEl) textEl.textContent = catMeta.subTitle;
    if (guideEl) {
      guideEl.textContent = `※ 세부 ${category === 'construction' ? '공종' : '유형'}을 선택하시면 해당 ${catMeta.name} 맞춤형 특화 구비서류 및 계약방법이 정확히 매핑됩니다. (선택 생략 시 일반 적용)`;
    }

    const types = OFFICIAL_SEN_TYPES[category] || [];

    // '일반/기본' 옵션 + 세부 유형 목록
    const allOptions = [
      { code: '', name: `일반 ${catMeta.name} (전체/기본)`, desc: `특정 세부 유형 지정 없이 일반 ${catMeta.name} 기준으로 진행합니다.` },
      ...types
    ];

    container.innerHTML = allOptions.map((t) => `
      <button type="button" class="subtype-chip-btn ${this.state.typeCode === t.code ? 'selected' : ''}" data-code="${t.code}" data-name="${t.name}" title="${t.desc || t.name}">
        ${t.code ? `<span class="subtype-code-badge">${t.code}</span>` : '<span>✨</span>'}
        <span>${t.name}</span>
      </button>
    `).join('');

    panel.style.display = 'block';

    // 칩 클릭 이벤트 바인딩
    container.querySelectorAll('.subtype-chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => {
        const code = chip.dataset.code;
        const name = chip.dataset.name;
        this.state.typeCode = code;
        this.state.typeName = code ? name : '';

        container.querySelectorAll('.subtype-chip-btn').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');

        // 스텝 1 확정 및 스텝 2로 이동
        this.confirmStep1Selection();
      });
    });
  }

  confirmStep1Selection() {
    const catMeta = {
      construction: { name: '공사', icon: '🏗️' },
      service: { name: '용역', icon: '💼' },
      goods: { name: '물품', icon: '📦' }
    }[this.state.category];

    // Step 1 완료 처리
    const summaryChip = document.getElementById('step1-summary');
    const btnEdit = document.getElementById('btn-edit-step1');
    const bubble = document.getElementById('step1-bubble');
    const card1 = document.getElementById('card-step1');

    const detailText = this.state.typeName ? ` > ${this.state.typeName}` : '';

    if (summaryChip) {
      summaryChip.textContent = `선택: ${catMeta.icon} ${catMeta.name}${detailText}`;
      summaryChip.style.display = 'inline-flex';
    }
    if (btnEdit) btnEdit.style.display = 'inline-block';
    if (bubble) bubble.textContent = '✓';

    card1.classList.remove('active');
    card1.classList.add('completed');

    // Step 2 활성화
    this.unlockAndOpenStep(2);

    // 금액 입력창 포커스
    const inputAmount = document.getElementById('input-amount');
    if (inputAmount) {
      setTimeout(() => inputAmount.focus(), 300);
    }
  }

  // =========================================================================
  // 3. Step 2: 계약 금액 입력
  // =========================================================================
  bindStep2Events() {
    const cardStep2 = document.getElementById('card-step2');
    const step2Header = document.getElementById('step2-header');
    const btnEdit2 = document.getElementById('btn-edit-step2');
    const inputAmount = document.getElementById('input-amount');
    const chkVat = document.getElementById('chk-vat-included');
    const quickChips = document.querySelectorAll('.quick-amount-chip:not(#btn-clear-amount)');
    const btnClear = document.getElementById('btn-clear-amount');
    const btnSubmit = document.getElementById('btn-submit-step2');

    // 숫자 입력 시 실시간 포맷팅 & 계산
    if (inputAmount) {
      inputAmount.addEventListener('input', (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        const num = Number(raw) || 0;
        e.target.value = num ? num.toLocaleString() : '';
        this.state.rawAmount = num;
        this.recalculatePrices();
      });

      // 엔터키 지원
      inputAmount.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          btnSubmit.click();
        }
      });
    }

    // 부가세 체크박스 변경
    if (chkVat) {
      chkVat.addEventListener('change', (e) => {
        this.state.vatIncluded = e.target.checked;
        this.recalculatePrices();
      });
    }

    // 퀵 금액 추가 칩
    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (chip.dataset.set) {
          this.state.rawAmount = Number(chip.dataset.set) || 0;
        } else {
          const addVal = Number(chip.dataset.add) || 0;
          this.state.rawAmount = (this.state.rawAmount || 0) + addVal;
        }
        if (inputAmount) {
          inputAmount.value = this.state.rawAmount.toLocaleString();
        }
        this.recalculatePrices();
      });
    });

    // 지우기
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.state.rawAmount = 0;
        if (inputAmount) inputAmount.value = '';
        this.recalculatePrices();
      });
    }

    // "가능한 계약 방법 확인하기" 버튼
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        if (!this.state.rawAmount || this.state.rawAmount <= 0) {
          alert('계약 금액을 0원 이상 입력해 주세요.');
          if (inputAmount) inputAmount.focus();
          return;
        }
        this.completeStep2();
      });
    }

    // 헤더 클릭 시 스텝 2 열기
    if (step2Header) {
      step2Header.addEventListener('click', () => {
        if (cardStep2.classList.contains('completed')) {
          this.openStep(2);
        }
      });
    }
    if (btnEdit2) {
      btnEdit2.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openStep(2);
      });
    }
  }

  recalculatePrices() {
    const raw = this.state.rawAmount || 0;
    const isVatInc = this.state.vatIncluded;

    let estimated = 0;
    let total = 0;

    if (isVatInc) {
      // 입력액이 VAT 포함금액 ➔ 추정가격은 / 1.1 역산
      estimated = Math.round(raw / 1.1);
      total = raw;
    } else {
      // 입력액이 추정가격(VAT 제외) ➔ 총액은 * 1.1
      estimated = raw;
      total = Math.round(raw * 1.1);
    }

    this.state.estimatedPrice = estimated;
    this.state.totalPrice = total;

    const dispEst = document.getElementById('disp-estimated-price');
    const dispTot = document.getElementById('disp-total-price');

    if (dispEst) dispEst.textContent = `${estimated.toLocaleString()}원`;
    if (dispTot) dispTot.textContent = `${total.toLocaleString()}원`;
  }

  completeStep2() {
    this.recalculatePrices();

    const summaryChip = document.getElementById('step2-summary');
    const btnEdit = document.getElementById('btn-edit-step2');
    const bubble = document.getElementById('step2-bubble');
    const card2 = document.getElementById('card-step2');

    const estText = (this.state.estimatedPrice / 10000).toLocaleString();
    if (summaryChip) {
      summaryChip.textContent = `추정가격: ${this.state.estimatedPrice.toLocaleString()}원 (${estText}만원)`;
      summaryChip.style.display = 'inline-flex';
    }
    if (btnEdit) btnEdit.style.display = 'inline-block';
    if (bubble) bubble.textContent = '✓';

    card2.classList.remove('active');
    card2.classList.add('completed');

    // Step 3 렌더링 및 활성화
    this.renderStep3Methods();
    this.unlockAndOpenStep(3);
  }

  // =========================================================================
  // 4. Step 3: 적용 가능한 계약 방법 선택
  // =========================================================================
  bindStep3Events() {
    const cardStep3 = document.getElementById('card-step3');
    const step3Header = document.getElementById('step3-header');
    const btnEdit3 = document.getElementById('btn-edit-step3');

    if (step3Header) {
      step3Header.addEventListener('click', () => {
        if (cardStep3.classList.contains('completed')) {
          this.openStep(3);
        }
      });
    }
    if (btnEdit3) {
      btnEdit3.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openStep(3);
      });
    }
  }

  renderStep3Methods() {
    const introText = document.getElementById('methods-intro-text');
    const container = document.getElementById('methods-list-container');
    if (!container) return;

    // 규칙 엔진으로부터 가능한 옵션들 획득
    const options = getAvailableContractOptions({
      category: this.state.category,
      estimatedPrice: this.state.estimatedPrice,
      typeCode: this.state.typeCode
    });

    this.state.availableOptions = options;

    const catKorean = this.state.category === 'construction' ? '공사' : (this.state.category === 'service' ? '용역' : '물품');
    if (introText) {
      introText.innerHTML = `
        <strong>${catKorean} ${this.state.estimatedPrice.toLocaleString()}원</strong>에서 선택 가능한 계약방법 <strong>${options.length}가지</strong>입니다. 진행할 방식을 클릭하세요.
      `;
    }

    container.innerHTML = options.map((opt, idx) => `
      <div class="method-choice-card ${this.state.selectedMethodId === opt.id ? 'selected' : ''}" data-method-id="${opt.id}">
        <div class="method-header-row">
          <div class="method-title-left">
            <input type="radio" name="method-choice-radio" class="method-choice-radio" value="${opt.id}" ${this.state.selectedMethodId === opt.id ? 'checked' : ''} />
            <span class="method-choice-title">${opt.title}</span>
          </div>
          <div class="method-tags-row">
            <span class="tag-badge ${opt.tagColor || 'blue'}">${opt.tag}</span>
            ${opt.isDefault ? `<span class="badge-recommend">★ 권장 · 원칙</span>` : ''}
          </div>
        </div>

        <div class="method-condition-box">
          <span class="cond-icon">📌</span>
          <div><strong>자격 요건:</strong> ${opt.conditionText}</div>
        </div>

        <div class="method-features-row">
          <span>⚡ <strong>핵심 특징:</strong> ${opt.featureText}</span>
        </div>
      </div>
    `).join('');

    // 카드 클릭 이벤트 바인딩
    container.querySelectorAll('.method-choice-card').forEach((card) => {
      card.addEventListener('click', () => {
        const methodId = card.dataset.methodId;
        this.selectMethod(methodId, card);
      });
    });
  }

  selectMethod(methodId, cardElement) {
    this.state.selectedMethodId = methodId;

    // UI 선택 반영
    document.querySelectorAll('.method-choice-card').forEach((c) => c.classList.remove('selected'));
    if (cardElement) {
      cardElement.classList.add('selected');
      const radio = cardElement.querySelector('.method-choice-radio');
      if (radio) radio.checked = true;
    }

    const selectedOpt = this.state.availableOptions.find((o) => o.id === methodId);
    const title = selectedOpt ? selectedOpt.title : methodId;

    // Step 3 완료 처리
    const summaryChip = document.getElementById('step3-summary');
    const btnEdit = document.getElementById('btn-edit-step3');
    const bubble = document.getElementById('step3-bubble');
    const card3 = document.getElementById('card-step3');

    if (summaryChip) {
      summaryChip.textContent = `선택: ${title}`;
      summaryChip.style.display = 'inline-flex';
    }
    if (btnEdit) btnEdit.style.display = 'inline-block';
    if (bubble) bubble.textContent = '✓';

    card3.classList.remove('active');
    card3.classList.add('completed');

    // Step 4 렌더링 및 오픈
    this.renderStep4Guide();
    this.unlockAndOpenStep(4);
  }

  // =========================================================================
  // 5. Step 4: 최종 맞춤형 계약 실무 가이드 (절차·근거·서류·기안문)
  // =========================================================================
  bindStep4Events() {
    const btnPrintGuide = document.getElementById('btn-print-guide');
    if (btnPrintGuide) {
      btnPrintGuide.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.print();
      });
    }
  }

  renderStep4Guide() {
    const container = document.getElementById('guide-output-wrap');
    const btnPrintGuide = document.getElementById('btn-print-guide');
    if (!container) return;

    if (btnPrintGuide) {
      btnPrintGuide.style.display = 'inline-flex';
    }

    // 패키지 데이터 일괄 조립
    const pkg = getContractPackageDetails({
      category: this.state.category,
      estimatedPrice: this.state.estimatedPrice,
      methodId: this.state.selectedMethodId,
      typeCode: this.state.typeCode
    });

    const catKorean = this.state.category === 'construction' ? '공사' : (this.state.category === 'service' ? '용역' : '물품');
    const fullCatKorean = this.state.typeName ? `${catKorean} (${this.state.typeName})` : catKorean;
    const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    container.innerHTML = `
      <!-- ================================================================
           [인쇄 전용 클린 공문서 서식] 화면에서는 숨김, 인쇄 시 단독 깔끔 표출
           ================================================================ -->
      <div class="print-clean-document print-only">
        <div class="p-doc-header">
          <div class="p-doc-top">
            <span class="p-doc-emblem">🏛️ 서울특별시교육청 각급 학교 계약실무 서식</span>
            <span class="p-doc-date">발행일자: ${todayStr}</span>
          </div>
          <h1 class="p-doc-title">계약 집행 기준 및 구비서류 체크리스트</h1>
          <p class="p-doc-sub">2026 서울특별시교육청 계약업무 처리지침 및 지방계약법령 준수</p>
        </div>

        <!-- 1. 계약 기본 사항 표 -->
        <div class="p-sec">
          <div class="p-sec-header">1. 계약 기본 사항</div>
          <table class="p-table">
            <tbody>
              <tr>
                <th style="width: 15%;">계약방법</th>
                <td style="width: 35%; font-weight: bold; color: #1e3a8a;">${pkg.method.title}</td>
                <th style="width: 15%;">계약 분야</th>
                <td style="width: 35%; font-weight: bold;">${fullCatKorean}</td>
              </tr>
              <tr>
                <th>추정 가격</th>
                <td>금 ${pkg.estimatedPrice.toLocaleString()} 원 (VAT 제외)</td>
                <th>계약예정금액</th>
                <td style="font-weight: bold;">금 ${pkg.totalPrice.toLocaleString()} 원 (VAT 포함)</td>
              </tr>
              <tr>
                <th>공고 기간</th>
                <td>${pkg.method.noticeDays}</td>
                <th>낙찰 하한율</th>
                <td>${pkg.method.lowerRate}</td>
              </tr>
              <tr>
                <th>계약 보증금</th>
                <td>${pkg.method.guaranteeRate}</td>
                <th>계약서 작성</th>
                <td style="font-weight: bold;">${pkg.method.signContractRequired ? '계약서 작성 필수' : '승낙사항(주문서) 대체 가능'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. 법적 근거 및 실무 유의사항 -->
        <div class="p-sec">
          <div class="p-sec-header">2. 법적 근거 및 실무 착안사항</div>
          <table class="p-table">
            <tbody>
              <tr>
                <th style="width: 15%;">법적 근거</th>
                <td><strong>[${pkg.method.legalClause}]</strong> ${pkg.method.legalDesc}</td>
              </tr>
              <tr>
                <th>감사 유의사항</th>
                <td>${pkg.method.auditTip}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 단계별 주요 진행 절차 -->
        <div class="p-sec">
          <div class="p-sec-header">3. 단계별 주요 진행 절차</div>
          <div class="p-flow-box">
            ${pkg.roadmap.map((s, idx) => `
              <div class="p-flow-step">
                <span class="p-flow-num">${s.step}</span>
                <span class="p-flow-name">${s.title}</span>
              </div>
              ${idx < pkg.roadmap.length - 1 ? '<span class="p-flow-arrow">➔</span>' : ''}
            `).join('')}
          </div>
        </div>

        <!-- 4. 계약 단계별 구비서류 편철 체크리스트 (핵심 표) -->
        <div class="p-sec">
          <div class="p-sec-header">4. 계약 단계별 구비서류 편철 체크리스트 (총 ${pkg.requiredDocs.length}종)</div>
          <table class="p-table p-docs-table">
            <thead>
              <tr>
                <th style="width: 13%;">단계</th>
                <th style="width: 32%;">구비서류명</th>
                <th style="width: 13%;">구분</th>
                <th style="width: 34%;">비고 및 생략·대체 기준</th>
                <th style="width: 8%;">확인</th>
              </tr>
            </thead>
            <tbody>
              ${pkg.requiredDocs.map(d => `
                <tr>
                  <td style="text-align: center; font-weight: bold; background: #f8fafc;">${d.stage}</td>
                  <td style="font-weight: 800;">
                    ${d.name}
                    ${d.basis ? `<div style="color: #4338ca; font-size: 7.5pt; font-weight: 600; margin-top: 2px;">⚖️ [근거] ${d.basis}</div>` : ''}
                  </td>
                  <td style="text-align: center;">
                    <span class="p-badge ${d.required ? 'p-req' : 'p-opt'}">
                      ${d.required ? '필수' : '생략가능'}
                    </span>
                  </td>
                  <td style="font-size: 8pt; color: #334155;">
                    ${d.note ? `<div>${d.note}</div>` : ''}
                    ${d.exemptible && d.exemptReason ? `<div style="color: #0369a1; font-weight: 600; margin-top: 1px;">💡 ${d.exemptReason}</div>` : ''}
                  </td>
                  <td style="text-align: center; font-size: 11pt; color: #475569;">□</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 5. 결재 및 편철 확인 서명란 -->
        <div class="p-sign-box">
          <p class="p-sign-notice">위 계약 건에 대하여 관련 법령 및 서울특별시교육청 계약업무 처리지침에 의거하여 구비서류를 이상 없이 대조·확인하여 편철함.</p>
          <div class="p-sign-row">
            <div class="p-sign-col">계약담당자 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (서명/인)</div>
            <div class="p-sign-col">행정실장 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (서명/인)</div>
          </div>
        </div>
      </div>

      <!-- 1. 확정 계약 요약 히어로 바 (화면용) -->
      <div class="confirmed-method-banner screen-only">
        <div class="confirmed-left">
          <h3>✅ ${pkg.method.title}</h3>
          <p>분야: <strong>${fullCatKorean}</strong> · 추정가격: 금${pkg.estimatedPrice.toLocaleString()}원 (VAT포함: 금${pkg.totalPrice.toLocaleString()}원)</p>
        </div>
        <div class="confirmed-specs-pills">
          <span class="spec-pill">공고: ${pkg.method.noticeDays}</span>
          <span class="spec-pill">낙찰하한율: ${pkg.method.lowerRate}</span>
          <span class="spec-pill">계약보증금: ${pkg.method.guaranteeRate}</span>
          <span class="spec-pill">${pkg.method.signContractRequired ? '계약서 작성 필수' : '승낙사항 대체 가능'}</span>
        </div>
      </div>

      <!-- 2. 실무 가이드 탭 내비게이션 (화면용) -->
      <div class="guide-tabs-bar screen-only" role="tablist">
        <button type="button" class="guide-tab-btn active" data-tab="tab-roadmap">🚦 1. 진행 절차</button>
        <button type="button" class="guide-tab-btn" data-tab="tab-audit">⚖️ 2. 근거 &amp; 주의사항</button>
        <button type="button" class="guide-tab-btn" data-tab="tab-docs">📑 3. 필수 서류 (${pkg.requiredDocs.length}종)</button>
        <button type="button" class="guide-tab-btn" data-tab="tab-memo">📝 4. 기안문 사유서</button>
      </div>

      <!-- [화면용] 1. 진행 절차 로드맵 타임라인 -->
      <div class="guide-tab-pane active" id="tab-roadmap">
        <div class="roadmap-timeline">
          ${pkg.roadmap.map((s) => `
            <div class="timeline-step-item">
              <div class="timeline-step-bullet"></div>
              <div class="timeline-header-row">
                <span class="timeline-step-title"><strong>${s.step}</strong> : ${s.title}</span>
                <span class="timeline-step-badge">${s.badge}</span>
              </div>
              <p class="timeline-step-desc">${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- [화면용] 2. 법적 근거 및 실무 감사 주의사항 -->
      <div class="guide-tab-pane" id="tab-audit">
        <!-- 감사 경보 배너들 -->
        ${pkg.auditWarnings.map((w) => `
          <div class="audit-alert-box ${w.level === 'critical' ? 'critical' : ''}">
            <span class="audit-alert-icon">${w.level === 'critical' ? '🚨' : (w.level === 'warning' ? '⚠️' : '💡')}</span>
            <div class="audit-alert-body">
              <h4>${w.title}</h4>
              <p>${w.message}</p>
            </div>
          </div>
        `).join('')}

        <!-- 법적 근거 원문 -->
        <div class="legal-box">
          <h4>📜 관련 법적 근거</h4>
          <p><strong>[법조항]</strong> ${pkg.method.legalClause}</p>
          <p style="margin-top: 0.4rem;"><strong>[해설]</strong> ${pkg.method.legalDesc}</p>
        </div>

        <!-- 실무 감사 팁 -->
        <div class="legal-box" style="border-left: 4px solid var(--primary-600);">
          <h4>🛡️ 서울시교육청 실무 감사 방어 팁</h4>
          <p>${pkg.method.auditTip}</p>
        </div>
      </div>

      <!-- [화면용] 3. 단계별 필수 구비서류 체크리스트 -->
      <div class="guide-tab-pane" id="tab-docs">
        <div class="memo-toolbar screen-only">
          <span style="font-size: 0.85rem; color: var(--neutral-600);">
            서울시교육청 계약업무 처리지침 [붙임 4] 준수 서류 목록입니다. 체크박스를 활용해 서류철을 챙기세요.
          </span>
          <button type="button" class="btn-action-secondary" id="btn-print-checklist">
            🖨️ A4 실무자료 인쇄
          </button>
        </div>

        <div class="docs-checklist-wrap">
          ${(() => {
            const stageGroups = {};
            pkg.requiredDocs.forEach((d) => {
              const st = d.stage || '기타';
              if (!stageGroups[st]) stageGroups[st] = [];
              stageGroups[st].push(d);
            });

            return Object.entries(stageGroups).map(([stName, docs], gIdx) => `
              <div class="docs-stage-section">
                <div class="docs-stage-head">
                  <span>📂 ${stName}</span>
                  <span>${docs.length}종</span>
                </div>
                <div class="docs-stage-items-list">
                  ${docs.map((doc, dIdx) => {
                    const chkId = `chk-doc-${gIdx}-${dIdx}`;
                    return `
                      <div class="doc-check-row">
                        <div class="doc-check-left">
                          <input type="checkbox" id="${chkId}" class="doc-checkbox" />
                          <div>
                            <label for="${chkId}" class="doc-name-label">${doc.name}</label>
                            ${doc.basis ? `<div class="doc-basis-badge">⚖️ 근거: ${doc.basis}</div>` : ''}
                            ${doc.note ? `<div class="doc-note-text">${doc.note}</div>` : ''}
                            ${doc.exemptible && doc.exemptReason ? `<div class="doc-exempt-hint">💡 ${doc.exemptReason}</div>` : ''}
                          </div>
                        </div>
                        <span class="doc-status-badge ${doc.required ? 'badge-req' : 'badge-opt'}">
                          ${doc.required ? '필수 징구' : '생략 가능'}
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('');
          })()}
        </div>
      </div>

      <!-- [제4구분] K-에듀파인 기안문 사유서 (화면 전용, 인쇄에서 완전 제외) -->
      <div class="guide-tab-pane screen-only" id="tab-memo">
        <div class="memo-output-wrap">
          <div class="memo-toolbar">
            <span style="font-size: 0.85rem; color: var(--neutral-600);">
              K-에듀파인 품의 및 계약방법 결정 결재 기안문에 그대로 복사하여 붙여넣으세요.
            </span>
            <button type="button" class="btn-action-primary" id="btn-copy-memo-final">
              📋 사유서 1초 복사하기
            </button>
          </div>
          <pre class="memo-code-box" id="memo-code-text">${pkg.memoText}</pre>
        </div>
      </div>
    `;

    // 탭 전환 이벤트 바인딩
    container.querySelectorAll('.guide-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.guide-tab-btn').forEach((b) => b.classList.remove('active'));
        container.querySelectorAll('.guide-tab-pane').forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = container.querySelector(`#${btn.dataset.tab}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // 1초 복사 버튼
    const btnCopy = container.querySelector('#btn-copy-memo-final');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(pkg.memoText).then(() => {
          this.showToast('K-에듀파인 기안문 사유서가 클립보드에 복사되었습니다! (Ctrl+V로 붙여넣기 하세요)');
        }).catch(() => {
          alert('클립보드 복사에 실패했습니다. 본문 텍스트를 직접 드래그하여 복사해 주세요.');
        });
      });
    }

    // 체크리스트 전용 인쇄 버튼
    const btnPrintChk = container.querySelector('#btn-print-checklist');
    if (btnPrintChk) {
      btnPrintChk.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.print();
      });
    }
  }

  // =========================================================================
  // 6. 아코디언 상태 관리 및 스크롤 헬퍼
  // =========================================================================
  openStep(stepNum) {
    this.state.activeStep = stepNum;

    // 해당 스텝 열기
    for (let i = 1; i <= 4; i++) {
      const card = document.getElementById(`card-step${i}`);
      const pstep = document.getElementById(`pstep-${i}`);

      if (i === stepNum) {
        if (card) {
          card.classList.remove('locked');
          card.classList.add('active');
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
        if (pstep) pstep.classList.add('active');
      } else {
        if (card) card.classList.remove('active');
        if (pstep && i > stepNum) pstep.classList.remove('active');
      }
    }
  }

  unlockAndOpenStep(stepNum) {
    const card = document.getElementById(`card-step${stepNum}`);
    if (card) card.classList.remove('locked');
    this.openStep(stepNum);
  }

  resetToStep(stepNum) {
    for (let i = stepNum; i <= 4; i++) {
      const card = document.getElementById(`card-step${i}`);
      const summary = document.getElementById(`step${i}-summary`);
      const btnEdit = document.getElementById(`btn-edit-step${i}`);
      const bubble = document.getElementById(`step${i}-bubble`);
      const pstep = document.getElementById(`pstep-${i}`);

      if (card) {
        card.classList.remove('active', 'completed');
        if (i > stepNum) card.classList.add('locked');
      }
      if (summary) {
        summary.textContent = '';
        summary.style.display = 'none';
      }
      if (btnEdit) btnEdit.style.display = 'none';
      if (bubble) bubble.textContent = i;
      if (pstep) pstep.classList.remove('active', 'completed');
    }

    if (stepNum === 1) {
      this.state.category = null;
      this.state.typeCode = '';
      this.state.typeName = '';
      this.state.rawAmount = 0;
      this.state.vatIncluded = false;
      this.state.estimatedPrice = 0;
      this.state.totalPrice = 0;
      this.state.selectedMethodId = null;

      document.querySelectorAll('.category-tile-btn').forEach((b) => b.classList.remove('selected'));
      const subPanel = document.getElementById('subtype-selection-panel');
      if (subPanel) subPanel.style.display = 'none';

      const inputAmount = document.getElementById('input-amount');
      if (inputAmount) inputAmount.value = '';
      const chkVat = document.getElementById('chk-vat-included');
      if (chkVat) chkVat.checked = false;
      this.recalculatePrices();
    }

    this.openStep(stepNum);
  }
}

// DOM 준비 시 앱 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
  new ProgressiveContractCompassApp();
});
