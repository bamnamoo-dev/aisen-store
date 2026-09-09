/**
 * 따라하기 대화형 마법사 컴포넌트 (Wizard)
 * 계약길잡이(contract.sen.go.kr) 공식 계약유형 20종 완벽 반영
 */

import { SafetyGuard } from './safety_guard.js';
import { OFFICIAL_SEN_TYPES } from '../rules/items_catalog.js';
import { evaluateContractMethod } from '../rules/contract_rules.js';

export class WizardComponent {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange;
    this.safetyGuard = new SafetyGuard();

    this.currentStep = 1;
    this.totalSteps = 4;

    this.state = {
      category: 'construction',
      typeCode: 'B15', // 계약길잡이 공식 코드: 건설공사
      rawPrice: 8500000,
      vatIncluded: true,
      estimatedPrice: 7727273,
      targetPlatform: 'G2B',
      isFemaleCompany: false,
      isHandicapped: false,
      isSocialEnterprise: false,
      isSevereDisabledFacility: false,
      hasSpecialReason: false,
      specialReasonType: '',
      isMasAvailable: false,
      annualAccumulatedPrice: 0,
      vendorCountThisYear: 1
    };

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.updatePriceCalculations();
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    
    // 만약 category만 바뀌고 typeCode가 불일치하면 해당 카테고리의 첫번째 유형으로 기본 지정
    const validCodes = OFFICIAL_SEN_TYPES[this.state.category].map(t => t.code);
    if (!validCodes.includes(this.state.typeCode)) {
      this.state.typeCode = validCodes[0];
    }

    this.render();
    this.bindEvents();
    this.updatePriceCalculations();
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;
    this.currentStep = stepNumber;
    this.updateStepVisibility();
    this.updateStepperBar();
    this.updateNavButtons();
  }

  updateNavButtons() {
    const prevWrap = this.container.querySelector('#wizard-prev-wrap');
    const nextBtn = this.container.querySelector('#wizard-btn-primary');

    if (prevWrap) {
      prevWrap.innerHTML = this.currentStep > 1 
        ? '<button type="button" class="btn-wizard btn-prev" id="btn-wizard-prev">← 이전 단계</button>'
        : '';
      const btnPrev = prevWrap.querySelector('#btn-wizard-prev');
      if (btnPrev) btnPrev.addEventListener('click', () => this.goToStep(this.currentStep - 1));
    }

    if (nextBtn) {
      if (this.currentStep < 4) {
        nextBtn.innerHTML = '다음 단계 →';
        nextBtn.className = 'btn-wizard btn-next';
        nextBtn.style.background = 'var(--primary-600)';
        nextBtn.onclick = () => this.goToStep(this.currentStep + 1);
      } else {
        nextBtn.innerHTML = '판정 및 구비서류 확인 ✓';
        nextBtn.className = 'btn-wizard btn-next';
        nextBtn.style.background = 'var(--accent-emerald)';
        nextBtn.onclick = () => {
          if (this.onStateChange) this.onStateChange(this.state);
          const reportCard = document.getElementById('card-report');
          if (reportCard) {
            reportCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        };
      }
    }
  }

  updateStepperBar() {
    const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    const bar = this.container.querySelector('.stepper-bar-progress');
    if (bar) bar.style.width = `${progress}%`;

    const nodes = this.container.querySelectorAll('.step-node');
    nodes.forEach((node, idx) => {
      const stepIdx = idx + 1;
      node.classList.remove('active', 'completed');
      if (stepIdx === this.currentStep) {
        node.classList.add('active');
      } else if (stepIdx < this.currentStep) {
        node.classList.add('completed');
      }
    });
  }

  updateStepVisibility() {
    const contents = this.container.querySelectorAll('.wizard-step-content');
    contents.forEach((c) => {
      const step = parseInt(c.dataset.step, 10);
      if (step === this.currentStep) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  updatePriceCalculations() {
    const prices = this.safetyGuard.calculatePrices(this.state.rawPrice, this.state.vatIncluded);
    this.state.estimatedPrice = prices.estimatedPrice;

    const estBox = this.container.querySelector('#calc-est-price');
    const vatBox = this.container.querySelector('#calc-vat-price');
    const totalBox = this.container.querySelector('#calc-total-price');
    const tipBox = this.container.querySelector('#edge-case-tip');

    if (estBox) estBox.textContent = prices.estimatedPrice.toLocaleString() + '원';
    if (vatBox) vatBox.textContent = prices.vatPrice.toLocaleString() + '원';
    if (totalBox) totalBox.textContent = prices.totalPrice.toLocaleString() + '원';

    if (tipBox) {
      const tipHtml = this.safetyGuard.getEdgeCaseTip(prices.estimatedPrice);
      if (tipHtml) {
        tipBox.innerHTML = tipHtml;
        tipBox.style.display = 'flex';
      } else {
        tipBox.style.display = 'none';
      }
    }

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  render() {
    const types = OFFICIAL_SEN_TYPES[this.state.category] || [];

    this.container.innerHTML = `
      <div class="wizard-container">
        <!-- Progress Stepper -->
        <div class="stepper-bar">
          <div class="stepper-bar-progress" style="width: 0%"></div>
          <div class="step-node active" data-step="1">
            <div class="step-circle">1</div>
            <span class="step-label">분야·유형</span>
          </div>
          <div class="step-node" data-step="2">
            <div class="step-circle">2</div>
            <span class="step-label">금액·세액</span>
          </div>
          <div class="step-node" data-step="3">
            <div class="step-circle">3</div>
            <span class="step-label">특수 조건</span>
          </div>
          <div class="step-node" data-step="4">
            <div class="step-circle">4</div>
            <span class="step-label">감사 점검</span>
          </div>
        </div>

        <!-- STEP 1: 계약길잡이 공식 분야 및 유형 선택 -->
        <div class="wizard-step-content active" data-step="1">
          <div class="question-header">
            <span class="question-num-tag">STEP 01</span>
            <h3 class="question-title">계약분야와 세부 계약유형을 선택해 주세요</h3>
            <p class="question-subtitle">서울특별시교육청 계약길잡이 공식 20대 계약유형 기준</p>
          </div>

          <!-- 1. 대분야 선택 탭 (공사 / 용역 / 물품) -->
          <div class="options-grid">
            <div class="option-card ${this.state.category === 'construction' ? 'selected' : ''}" data-cat="construction">
              <div class="option-icon">🏗️</div>
              <div class="option-title">공사</div>
              <div class="option-desc">건설·전기·소방</div>
            </div>

            <div class="option-card ${this.state.category === 'service' ? 'selected' : ''}" data-cat="service">
              <div class="option-icon">🧹</div>
              <div class="option-title">용역</div>
              <div class="option-desc">버스·청소·늘봄</div>
            </div>

            <div class="option-card ${this.state.category === 'goods' ? 'selected' : ''}" data-cat="goods">
              <div class="option-icon">📦</div>
              <div class="option-title">물품</div>
              <div class="option-desc">교복·조달·제조</div>
            </div>
          </div>

          <!-- 2. 세부 계약유형 선택 그리드 -->
          <div style="margin-top: 1.15rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.55rem;">
              <label style="font-size: 0.85rem; font-weight: 800; color: var(--neutral-800);">
                세부 계약유형 선택 (계약길잡이 공식 분류)
              </label>
              <span style="font-size: 0.75rem; color: var(--primary-600); font-weight: 700;">
                선택: ${types.find(t => t.code === this.state.typeCode)?.name || ''}
              </span>
            </div>

            <div class="subtypes-selection-grid" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 290px; overflow-y: auto; padding-right: 0.25rem;">
              ${types.map(t => `
                <div class="subtype-select-card ${this.state.typeCode === t.code ? 'selected' : ''}" data-code="${t.code}" style="padding: 0.65rem 0.8rem; border: 1.5px solid ${this.state.typeCode === t.code ? 'var(--primary-600)' : 'var(--neutral-200)'}; background: ${this.state.typeCode === t.code ? '#eff6ff' : 'var(--surface-white)'}; border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
                    <span style="font-weight: 800; font-size: 0.85rem; color: ${this.state.typeCode === t.code ? 'var(--primary-900)' : 'var(--neutral-800)'};">${t.name}</span>
                    <span style="font-size: 0.675rem; font-weight: 700; background: var(--neutral-100); color: var(--neutral-600); padding: 0.1rem 0.35rem; border-radius: 4px;">${t.code}</span>
                  </div>
                  <p style="font-size: 0.725rem; color: var(--neutral-500); line-height: 1.35;">${t.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- STEP 2: 금액 및 부가세 산출 -->
        <div class="wizard-step-content" data-step="2">
          <div class="question-header">
            <span class="question-num-tag">STEP 02</span>
            <h3 class="question-title">계약 예상 금액(사업비)은 얼마인가요?</h3>
            <p class="question-subtitle">견적서나 사업계획서 상의 금액을 입력하면 법정 추정가격이 자동 계산됩니다.</p>
          </div>

          <div class="price-input-section">
            <div class="price-input-row">
              <div class="price-input-box">
                <input type="text" id="raw-price-input" value="${this.state.rawPrice.toLocaleString()}" />
                <span class="price-unit">원</span>
              </div>
              <div class="vat-mode-toggle">
                <button type="button" class="vat-btn ${this.state.vatIncluded ? 'active' : ''}" data-vat="inc">부가세 포함 (추정금액)</button>
                <button type="button" class="vat-btn ${!this.state.vatIncluded ? 'active' : ''}" data-vat="exc">부가세 제외 (추정가격)</button>
              </div>
            </div>

            <div class="price-breakdown-grid">
              <div class="breakdown-card highlight">
                <div class="breakdown-label">판정 기준 추정가격 (공급가액)</div>
                <div class="breakdown-value" id="calc-est-price">0원</div>
              </div>
              <div class="breakdown-card">
                <div class="breakdown-label">부가가치세 (10%)</div>
                <div class="breakdown-value" id="calc-vat-price">0원</div>
              </div>
              <div class="breakdown-card">
                <div class="breakdown-label">총 추정금액 (총액)</div>
                <div class="breakdown-value" id="calc-total-price">0원</div>
              </div>
            </div>

            <div class="edge-case-alert" id="edge-case-tip" style="display: none;"></div>
          </div>
        </div>

        <!-- STEP 3: 특수 조건 확인 -->
        <div class="wizard-step-content" data-step="3">
          <div class="question-header">
            <span class="question-num-tag">STEP 03</span>
            <h3 class="question-title">해당되는 특수 조건 및 전자조달 시스템 선택</h3>
            <p class="question-subtitle">법정 기본 조달시스템(G2B) 및 취약계층 특례(5천만원 이하) 여부를 확인합니다.</p>
          </div>

          <!-- 전자조달 지정정보처리장치 선택 (G2B 기본 vs S2B) -->
          <div style="background: #f8fafc; border: 2px solid #bfdbfe; border-radius: var(--radius-md); padding: 1.1rem; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
              <strong style="font-size: 0.925rem; color: var(--primary-900);">전자조달 지정정보처리장치 선택</strong>
              <span style="font-size: 0.725rem; font-weight: 700; background: var(--primary-100); color: var(--primary-700); padding: 0.15rem 0.5rem; border-radius: 4px;">지방계약법 시행령 제30조</span>
            </div>
            <p style="font-size: 0.775rem; color: var(--neutral-600); margin-bottom: 0.75rem; line-height: 1.4;">
              * <b>법적 기본(원칙):</b> 국가종합전자조달시스템인 <b>G2B(나라장터)</b>가 원칙이며, 각급 학교는 조달 편의에 따라 <b>S2B(학교장터)</b>를 선택할 수 있습니다.
            </p>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 700; color: var(--neutral-800); cursor: pointer;">
                <input type="radio" name="proc-platform" value="G2B" ${this.state.targetPlatform === 'G2B' ? 'checked' : ''} style="width: 17px; height: 17px;" />
                <span>G2B 나라장터 (법정 기본·원칙)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 700; color: var(--neutral-800); cursor: pointer;">
                <input type="radio" name="proc-platform" value="S2B" ${this.state.targetPlatform === 'S2B' ? 'checked' : ''} style="width: 17px; height: 17px;" />
                <span>S2B 학교장터 (교육기관 전용)</span>
              </label>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--neutral-200); border-radius: var(--radius-md); background: var(--surface-white); cursor: pointer;">
              <input type="checkbox" id="chk-female" ${this.state.isFemaleCompany ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <div>
                <strong style="font-size: 0.9rem; color: var(--neutral-900);">여성기업 또는 장애인기업 확인서 보유</strong>
                <p style="font-size: 0.775rem; color: var(--neutral-500);">중기부 정식 확인서 보유 시 추정가격 5,000만원 이하 1인 수의계약 특례 적용</p>
              </div>
            </label>

            ${this.state.category !== 'construction' ? `
            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; border: 1.5px solid #6ee7b7; border-radius: var(--radius-md); background: #f0fdf4; cursor: pointer;">
              <input type="checkbox" id="chk-severe-disabled" ${this.state.isSevereDisabledFacility ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <div>
                <strong style="font-size: 0.9rem; color: #065f46;">⭐️ 중증장애인생산품 생산시설 직접생산품 (금액 한도 없음)</strong>
                <p style="font-size: 0.775rem; color: #047857;">「중증장애인생산품 특별법」 제7조제5항 및 시행령 제25조제1항제7호의2: <b>금액 한도 없는 수의계약 특례</b> (연간 4회 제한 제외)</p>
              </div>
            </label>
            ` : ''}

            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--neutral-200); border-radius: var(--radius-md); background: var(--surface-white); cursor: pointer;">
              <input type="checkbox" id="chk-social" ${this.state.isSocialEnterprise ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <div>
                <strong style="font-size: 0.9rem; color: var(--neutral-900);">사회적경제기업 (취약계층 고용비율 30% 이상)</strong>
                <p style="font-size: 0.775rem; color: var(--neutral-500);">사회적기업, 사회적협동조합, 자활기업, 마을기업 등 5,000만원 이하 1인 수의 가능</p>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--neutral-200); border-radius: var(--radius-md); background: var(--surface-white); cursor: pointer;">
              <input type="checkbox" id="chk-mas" ${this.state.isMasAvailable || this.state.typeCode === 'B03' ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <div>
                <strong style="font-size: 0.9rem; color: var(--neutral-900);">🛒 조달청 종합쇼핑몰 구매 (제3자단가 / 쇼핑몰 직접구매)</strong>
                <p style="font-size: 0.775rem; color: var(--neutral-500);">나라장터 쇼핑몰에서 바로 장바구니 담아 납품요구 (학교 현장은 대부분 1억 미만으로 복잡한 2단계경쟁 없음)</p>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--neutral-200); border-radius: var(--radius-md); background: var(--surface-white); cursor: pointer;">
              <input type="checkbox" id="chk-special" ${this.state.hasSpecialReason ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <div>
                <strong style="font-size: 0.9rem; color: var(--neutral-900);">법정 특정사유 (특허공법, 2회 유찰, 비상재해 복구 등)</strong>
                <p style="font-size: 0.775rem; color: var(--neutral-500);">시행령 제25조 제1항 제1호~4호에 따른 특정인 수의계약</p>
              </div>
            </label>
          </div>
        </div>

        <!-- STEP 4: 감사 안전체크 -->
        <div class="wizard-step-content" data-step="4">
          <div class="question-header">
            <span class="question-num-tag">STEP 04</span>
            <h3 class="question-title">감사 지적 방지를 위한 사전 점검</h3>
            <p class="question-subtitle">교육청 감사에서 가장 많이 적발되는 2대 항목(분할수의, 업체 몰아주기)을 점검합니다.</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="background: var(--surface-white); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: 1rem;">
              <label style="font-size: 0.875rem; font-weight: 700; color: var(--neutral-800); display: block; margin-bottom: 0.35rem;">
                동일 회계연도에 동일 예산 비목 또는 유사 용도로 기집행한 금액이 있습니까?
              </label>
              <p style="font-size: 0.75rem; color: var(--neutral-500); margin-bottom: 0.5rem;">
                * 합산 시 2천만원을 초과하면 분할수의계약(쪼개기) 지적 위험이 있습니다.
              </p>
              <div style="position: relative; max-width: 300px;">
                <input type="text" id="accum-price-input" value="${this.state.annualAccumulatedPrice.toLocaleString()}" style="width: 100%; padding: 0.6rem 2.5rem 0.6rem 0.85rem; border: 2px solid var(--neutral-300); border-radius: var(--radius-sm); font-size: 1rem; font-weight: 700; text-align: right;" />
                <span style="position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); font-size: 0.85rem; font-weight: 700; color: var(--neutral-500);">원</span>
              </div>
            </div>

            <div style="background: var(--surface-white); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: 1rem;">
              <label style="font-size: 0.875rem; font-weight: 700; color: var(--neutral-800); display: block; margin-bottom: 0.35rem;">
                계약 예정 업체와 올해 학교(기관) 전체에서 계약한 횟수
              </label>
              <p style="font-size: 0.75rem; color: var(--neutral-500); margin-bottom: 0.5rem;">
                * 서울시교육청 지침: 동일업체 수의계약(5백만원 이상)은 회계연도 중 4회로 엄격히 제한됩니다.
              </p>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="number" id="vendor-count-input" min="0" max="10" value="${this.state.vendorCountThisYear}" style="width: 90px; padding: 0.6rem; border: 2px solid var(--neutral-300); border-radius: var(--radius-sm); font-size: 1rem; font-weight: 700; text-align: center;" />
                <span style="font-size: 0.9rem; font-weight: 700; color: var(--neutral-600);">회</span>
              </div>
            </div>
          </div>
        </div>

            <!-- 조건 입력 완료 안내 배지 -->
            <div style="margin-top: 1.25rem; background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.5rem;">🎉</span>
              <div>
                <strong style="font-size: 0.875rem; color: #065f46;">4단계 조건 입력 완료!</strong>
                <p style="font-size: 0.775rem; color: #047857; line-height: 1.4; margin-top: 0.15rem;">
                  중앙의 <b>[계약 판정 &amp; 기안문]</b>과 우측의 <b>[단계별 필수 구비서류]</b>가 실시간으로 자동 완성되었습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Wizard Nav Actions -->
        <div class="wizard-nav-actions">
          <div id="wizard-prev-wrap">
            <!-- updateNavButtons()로 동적 갱신 -->
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button type="button" class="btn-wizard btn-reset" id="btn-wizard-reset">처음으로 초기화</button>
            <button type="button" class="btn-wizard btn-next" id="wizard-btn-primary">다음 단계 →</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Stepper Node Clicks
    this.container.querySelectorAll('.step-node').forEach((node) => {
      node.addEventListener('click', () => {
        const step = parseInt(node.dataset.step, 10);
        this.goToStep(step);
      });
    });

    // Category Card Selection
    this.container.querySelectorAll('.option-card').forEach((card) => {
      card.addEventListener('click', () => {
        const cat = card.dataset.cat;
        const validCodes = OFFICIAL_SEN_TYPES[cat].map(t => t.code);
        this.state.category = cat;
        this.state.typeCode = validCodes[0];
        if (cat === 'construction') {
          this.state.isSevereDisabledFacility = false;
        }

        this.render();
        this.bindEvents();
        this.updatePriceCalculations();
      });
    });

    // SubType Select Card Click
    this.container.querySelectorAll('.subtype-select-card').forEach((card) => {
      card.addEventListener('click', () => {
        const code = card.dataset.code;
        this.state.typeCode = code;
        if (code === 'B03') this.state.isMasAvailable = true;
        this.render();
        this.bindEvents();
        this.updatePriceCalculations();
      });
    });

    // Raw Price Input
    const priceInput = this.container.querySelector('#raw-price-input');
    if (priceInput) {
      priceInput.addEventListener('input', (e) => {
        const numeric = e.target.value.replace(/[^0-9]/g, '');
        this.state.rawPrice = Number(numeric) || 0;
        e.target.value = this.state.rawPrice.toLocaleString();
        this.updatePriceCalculations();
      });
    }

    // VAT Mode Toggle
    this.container.querySelectorAll('.vat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.vat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.vatIncluded = btn.dataset.vat === 'inc';
        this.updatePriceCalculations();
      });
    });

    // Radio proc-platform in Step 3
    this.container.querySelectorAll('input[name="proc-platform"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.state.targetPlatform = e.target.value;
          this.updatePriceCalculations();
        }
      });
    });

    // Checkboxes in Step 3
    const chkFemale = this.container.querySelector('#chk-female');
    if (chkFemale) chkFemale.addEventListener('change', (e) => { this.state.isFemaleCompany = e.target.checked; this.updatePriceCalculations(); });

    const chkSevere = this.container.querySelector('#chk-severe-disabled');
    if (chkSevere) chkSevere.addEventListener('change', (e) => { this.state.isSevereDisabledFacility = e.target.checked; this.updatePriceCalculations(); });

    const chkSocial = this.container.querySelector('#chk-social');
    if (chkSocial) chkSocial.addEventListener('change', (e) => { this.state.isSocialEnterprise = e.target.checked; this.updatePriceCalculations(); });

    const chkMas = this.container.querySelector('#chk-mas');
    if (chkMas) chkMas.addEventListener('change', (e) => { this.state.isMasAvailable = e.target.checked; this.updatePriceCalculations(); });

    const chkSpecial = this.container.querySelector('#chk-special');
    if (chkSpecial) chkSpecial.addEventListener('change', (e) => {
      this.state.hasSpecialReason = e.target.checked;
      this.state.specialReasonType = e.target.checked ? 'patent' : '';
      this.updatePriceCalculations();
    });

    // Inputs in Step 4
    const accumInput = this.container.querySelector('#accum-price-input');
    if (accumInput) {
      accumInput.addEventListener('input', (e) => {
        const numeric = e.target.value.replace(/[^0-9]/g, '');
        this.state.annualAccumulatedPrice = Number(numeric) || 0;
        e.target.value = this.state.annualAccumulatedPrice.toLocaleString();
        this.updatePriceCalculations();
      });
    }

    const vendorCountInput = this.container.querySelector('#vendor-count-input');
    if (vendorCountInput) {
      vendorCountInput.addEventListener('input', (e) => {
        this.state.vendorCountThisYear = Number(e.target.value) || 0;
        this.updatePriceCalculations();
      });
    }

    // Update Nav Buttons
    this.updateNavButtons();

    const btnReset = this.container.querySelector('#btn-wizard-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.setState({
          category: 'construction',
          typeCode: 'B15',
          rawPrice: 8500000,
          vatIncluded: true,
          isFemaleCompany: false,
          isHandicapped: false,
          isSocialEnterprise: false,
          hasSpecialReason: false,
          specialReasonType: '',
          isMasAvailable: false,
          annualAccumulatedPrice: 0,
          vendorCountThisYear: 1
        });
        this.goToStep(1);
      });
    }
  }
}
