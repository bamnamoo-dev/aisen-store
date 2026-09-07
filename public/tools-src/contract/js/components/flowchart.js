/**
 * 인터랙티브 의사결정 순서도 컴포넌트 (Flowchart & Decision Tree)
 */

export class FlowchartComponent {
  constructor(containerId, onNodeSelect) {
    this.container = document.getElementById(containerId);
    this.onNodeSelect = onNodeSelect;
    this.zoomLevel = 1;

    if (this.container) {
      this.init();
    }
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindControls();
    setTimeout(() => this.centerView(), 50);
  }

  centerView() {
    const viewport = this.container.querySelector('.flowchart-viewport');
    const canvas = this.container.querySelector('#fc-canvas');
    if (viewport && canvas) {
      const scrollX = (canvas.scrollWidth - viewport.clientWidth) / 2;
      if (scrollX > 0) {
        viewport.scrollLeft = scrollX;
      }
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="flowchart-viewport">
        <div class="flowchart-controls">
          <button type="button" class="flowchart-ctrl-btn" id="fc-zoom-in" title="확대">+</button>
          <button type="button" class="flowchart-ctrl-btn" id="fc-zoom-out" title="축소">-</button>
          <button type="button" class="flowchart-ctrl-btn" id="fc-zoom-reset" title="원래대로">⟲</button>
        </div>

        <div class="flowchart-canvas" id="fc-canvas" style="transform: scale(1);">
          <div class="fc-tree">
            <!-- LEVEL 1: 시작점 -->
            <div class="fc-level">
              <div class="fc-node active-path" id="node-root">
                <span class="fc-node-badge">START</span>
                <span class="fc-node-title">사업(계약) 추진 검토</span>
                <span class="fc-node-desc">예산 확보 및 품의 접수</span>
              </div>
            </div>

            <!-- LEVEL 2: 분야 선택 -->
            <div class="fc-level">
              <div class="fc-node" id="node-cat-construction" data-cat="construction">
                <span class="fc-node-badge">분야 1</span>
                <span class="fc-node-title">공사 (Construction)</span>
                <span class="fc-node-desc">전문/전기/통신/소방 등</span>
              </div>
              <div class="fc-node" id="node-cat-service" data-cat="service">
                <span class="fc-node-badge">분야 2</span>
                <span class="fc-node-title">용역 (Service)</span>
                <span class="fc-node-desc">청소/수학여행/통학버스 등</span>
              </div>
              <div class="fc-node" id="node-cat-goods" data-cat="goods">
                <span class="fc-node-badge">분야 3</span>
                <span class="fc-node-title">물품 (Goods)</span>
                <span class="fc-node-desc">구매/제조/교복/조달MAS 등</span>
              </div>
            </div>

            <!-- LEVEL 3: 금액 및 조건 분기 -->
            <div class="fc-level">
              <div class="fc-node" id="node-tier-under20m" data-tier="under20m">
                <span class="fc-node-badge">금액 1</span>
                <span class="fc-node-title">추정가격 ≤ 2,000만원</span>
                <span class="fc-node-desc">소액 수의계약 기준 충족</span>
              </div>
              <div class="fc-node" id="node-tier-affirmative" data-tier="affirmative">
                <span class="fc-node-badge">특례 조건</span>
                <span class="fc-node-title">2천만 초과 ~ 5천만 이하</span>
                <span class="fc-node-desc">여성·장애인·사회적기업</span>
              </div>
              <div class="fc-node" id="node-tier-s2b" data-tier="s2b">
                <span class="fc-node-badge">금액 2</span>
                <span class="fc-node-title">2천만 초과 ~ 7천만/1억</span>
                <span class="fc-node-desc">G2B(기본) / S2B 공고</span>
              </div>
              <div class="fc-node" id="node-tier-special-item" data-tier="special">
                <span class="fc-node-badge">특수 품목</span>
                <span class="fc-node-title">교복 / MAS / 특정인</span>
                <span class="fc-node-desc">2단계 입찰 또는 조달구매</span>
              </div>
              <div class="fc-node" id="node-tier-bidding" data-tier="bid">
                <span class="fc-node-badge">고액</span>
                <span class="fc-node-title">소액수의 기준 초과</span>
                <span class="fc-node-desc">경쟁입찰 (적격심사)</span>
              </div>
            </div>

            <!-- LEVEL 4: 최종 계약방법 -->
            <div class="fc-level">
              <div class="fc-node target-result" id="node-res-1in-general">
                <span class="fc-node-badge">최종 결정</span>
                <span class="fc-node-title">1인 견적 수의계약</span>
                <span class="fc-node-desc">시행령 제25조 제1항 5호</span>
              </div>
              <div class="fc-node target-result" id="node-res-1in-affirmative">
                <span class="fc-node-badge">최종 결정</span>
                <span class="fc-node-title">취약계층 특례 1인수의</span>
                <span class="fc-node-desc">5천만원 이하 여성·장애인</span>
              </div>
              <div class="fc-node target-result" id="node-res-s2b">
                <span class="fc-node-badge">최종 결정</span>
                <span class="fc-node-title">G2B · S2B 전자견적</span>
                <span class="fc-node-desc">나라장터(기본) · 학교장터</span>
              </div>
              <div class="fc-node target-result" id="node-res-special">
                <span class="fc-node-badge">최종 결정</span>
                <span class="fc-node-title">2단계 입찰 / 조달MAS</span>
                <span class="fc-node-desc">규격가격동시 / 나라장터</span>
              </div>
              <div class="fc-node target-result" id="node-res-bid">
                <span class="fc-node-badge">최종 결정</span>
                <span class="fc-node-title">제한경쟁입찰 (적격심사)</span>
                <span class="fc-node-desc">서울지역제한 7일 공고</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindControls() {
    const canvas = this.container.querySelector('#fc-canvas');
    const btnIn = this.container.querySelector('#fc-zoom-in');
    const btnOut = this.container.querySelector('#fc-zoom-out');
    const btnReset = this.container.querySelector('#fc-zoom-reset');

    if (btnIn) {
      btnIn.addEventListener('click', () => {
        this.zoomLevel = Math.min(this.zoomLevel + 0.15, 1.6);
        canvas.style.transform = `scale(${this.zoomLevel})`;
      });
    }

    if (btnOut) {
      btnOut.addEventListener('click', () => {
        this.zoomLevel = Math.max(this.zoomLevel - 0.15, 0.6);
        canvas.style.transform = `scale(${this.zoomLevel})`;
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.zoomLevel = 1;
        canvas.style.transform = 'scale(1)';
        this.centerView();
      });
    }

    // Node Clicks for Direct Simulation
    this.container.querySelectorAll('.fc-node[data-cat]').forEach((node) => {
      node.addEventListener('click', () => {
        const cat = node.dataset.cat;
        if (this.onNodeSelect) this.onNodeSelect({ category: cat });
      });
    });

    this.container.querySelectorAll('.fc-node[data-tier]').forEach((node) => {
      node.addEventListener('click', () => {
        const tier = node.dataset.tier;
        if (tier === 'under20m') {
          if (this.onNodeSelect) this.onNodeSelect({ rawPrice: 15000000, vatIncluded: true, isFemaleCompany: false });
        } else if (tier === 'affirmative') {
          if (this.onNodeSelect) this.onNodeSelect({ rawPrice: 45000000, vatIncluded: true, isFemaleCompany: true });
        } else if (tier === 's2b') {
          if (this.onNodeSelect) this.onNodeSelect({ rawPrice: 35000000, vatIncluded: true, isFemaleCompany: false });
        } else if (tier === 'special') {
          if (this.onNodeSelect) this.onNodeSelect({ category: 'goods', subType: 'uniform', rawPrice: 120000000 });
        } else if (tier === 'bid') {
          if (this.onNodeSelect) this.onNodeSelect({ rawPrice: 300000000 });
        }
      });
    });
  }

  /**
   * 사용자 상태에 따른 순서도 노드 하이라이트 업데이트
   */
  updateHighlights(state, result) {
    // Reset highlights
    this.container.querySelectorAll('.fc-node').forEach((n) => {
      n.classList.remove('active-path');
    });

    // Root is always active
    const rootNode = this.container.querySelector('#node-root');
    if (rootNode) rootNode.classList.add('active-path');

    // Category Node
    const catNode = this.container.querySelector(`#node-cat-${state.category}`);
    if (catNode) catNode.classList.add('active-path');

    // Tier Node
    const est = state.estimatedPrice;
    let tierNode = null;
    if (result.method.id === 'SOLE_SOURCE_DISABLED_FACILITY') {
      tierNode = this.container.querySelector('#node-tier-affirmative');
    } else if (state.subType === 'uniform' || state.isMasAvailable || state.hasSpecialReason) {
      tierNode = this.container.querySelector('#node-tier-special-item');
    } else if (est <= 20000000) {
      tierNode = this.container.querySelector('#node-tier-under20m');
    } else if (est <= 50000000 && (state.isFemaleCompany || state.isHandicapped || state.isSocialEnterprise)) {
      tierNode = this.container.querySelector('#node-tier-affirmative');
    } else if (est <= 100000000) {
      tierNode = this.container.querySelector('#node-tier-s2b');
    } else {
      tierNode = this.container.querySelector('#node-tier-bidding');
    }
    if (tierNode) tierNode.classList.add('active-path');

    // Result Node
    let resNode = null;
    if (result.method.id === 'SOLE_SOURCE_GENERAL') {
      resNode = this.container.querySelector('#node-res-1in-general');
    } else if (result.method.id === 'SOLE_SOURCE_AFFIRMATIVE' || result.method.id === 'SOLE_SOURCE_DISABLED_FACILITY') {
      resNode = this.container.querySelector('#node-res-1in-affirmative');
    } else if (result.method.id === 'ELECTRONIC_QUOTATION' || result.method.id === 'G2B_ELECTRONIC_QUOTATION' || result.method.id.includes('S2B') || result.method.id.includes('G2B')) {
      resNode = this.container.querySelector('#node-res-s2b');
    } else if (result.method.id === 'TWO_STAGE_BIDDING' || result.method.id === 'PROCUREMENT_MAS') {
      resNode = this.container.querySelector('#node-res-special');
    } else {
      resNode = this.container.querySelector('#node-res-bid');
    }
    if (resNode) resNode.classList.add('active-path');
  }
}
