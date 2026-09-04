// [보안 조치 완료] API 키는 서버 .env.local (GOOGLE_API_KEY)에서 안전하게 관리됩니다.
// 클라이언트에 API 키를 하드코딩하지 않습니다.
window.ENV = {
    GOOGLE_API_KEY: "",
    GEMINI_MODEL: "gemini-2.5-flash"
};
