/**
 * 최종 결과 리포트 및 기안문 자동 생성기 컴포넌트 (Report Generator)
 */

export class ReportGeneratorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.lastResult = null;
  }

  render(result) {
    this.lastResult = result;
    const { method, auditWarnings, requiredDocs, memoText, estimatedPrice, totalPrice } = result;

    this.container.innerHTML = `
      <div class="report-container">
        <!-- 1. 감사 안전 경보 배너 (Red Flag Warning) -->
        ${auditWarnings.map(w => `
          <div class="audit-warning-box show">
            <div class="audit-warning-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="audit-warning-content">
              <h4>${w.title}</h4>
              <p>${w.message}</p>
            </div>
          </div>
        `).join('')}

        <!-- 2. 최종 확정 계약방법 히어로 카드 -->
        <div class="result-hero-card">
          <div class="result-badge-row">
            <span class="badge-platform">추천 플랫폼: ${method.platformBadge}</span>
            <span class="badge-platform" style="background: rgba(16, 185, 129, 0.25); border-color: rgba(16, 185, 129, 0.4);">
              기준 추정가격: ${estimatedPrice.toLocaleString()}원
            </span>
          </div>
          <h2 class="result-method-title">${method.title}</h2>
          <p class="result-summary-desc">${method.legalDesc}</p>

          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">공고(안내) 기간</span>
              <span class="spec-val">${method.noticeDays}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">낙찰하한율</span>
              <span class="spec-val">${method.lowerRate}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">계약보증금</span>
              <span class="spec-val">${method.guaranteeRate}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">계약서 작성 의무</span>
              <span class="spec-val">${method.signContractRequired ? '계약서 필수 작성' : '승낙사항 대체 가능'}</span>
            </div>
          </div>
        </div>

        <!-- 3. 법적 근거 원문 및 감사 방어 팁 -->
        <div class="legal-card">
          <div class="legal-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-600);">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>법적 근거 및 실무 유의사항</span>
          </div>
          <div class="legal-clause-box">
            <p><strong>[관련 법조항]</strong> ${method.legalClause}</p>
            <p style="margin-top: 0.4rem;"><strong>[실무 감사 팁]</strong> ${method.auditTip}</p>
          </div>
        </div>

        <!-- 4. ⭐️ 내부결재용 기안문 사유서 1초 복사 -->
        <div class="draft-memo-card">
          <div class="draft-memo-header">
            <div class="draft-memo-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-700);">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>K-에듀파인 기안용 사유서 자동 완성</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn-copy-draft" id="btn-copy-memo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                사유서 복사하기
              </button>
              <button type="button" class="btn-copy-draft" id="btn-print-report" style="background: var(--neutral-800);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                인쇄하기
              </button>
            </div>
          </div>
          <div class="draft-memo-content" id="draft-memo-text">${memoText}</div>
        </div>
      </div>

      <div class="toast-notice" id="toast-memo-copied">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-emerald);">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        기안문용 사유서가 클립보드에 복사되었습니다! (K-에듀파인에 붙여넣기 하세요)
      </div>
    `;

    this.bindEvents(memoText);
  }

  bindEvents(memoText) {
    const btnCopy = this.container.querySelector('#btn-copy-memo');
    const toast = this.container.querySelector('#toast-memo-copied');

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(memoText).then(() => {
          if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
              toast.classList.remove('show');
            }, 2500);
          }
        }).catch(err => {
          alert('클립보드 복사에 실패했습니다. 텍스트를 직접 드래그하여 복사하세요.');
        });
      });
    }

    const btnPrint = this.container.querySelector('#btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }
}
