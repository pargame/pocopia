const i18n = {
    ko: {
        title: "🏝️ 포코피아",
        subtitle: "닌텐도 스위치2 포코피아 클라우드섬 공유 플랫폼",
        formTitle: "클우드섬 공유하기",
        labelTitle: "제목 *",
        placeholderTitle: "섬 이름을 입력하세요",
        labelDesc: "설명",
        placeholderDesc: "간단한 소개 (선택)",
        labelCode: "클우드섬 코드 *",
        codeHint: "(Z, I, O 제외한 8자리 알파벳/숫자)",
        codePlaceholder: "예: 1234ABCD",
        submitBtn: "클우드섬 공유하기",
        listTitle: "현재 활성화된 클라우드섬",
        countSuffix: "개",
        emptyMsg: "아직 공유된 클라우드섬이 없습니다.",
        remaining: "남은 시간",
        seconds: "초",
        expired: "만료됨",
        successMsg: "클우드섬이 공유되었습니다! (60초 후 자동 삭제)",
        errorServer: "서버 연결에 실패했습니다.",
        errorTitleMin: "제목은 2자 이상 입력해주세요.",
        errorCodeLength: "코드는 정확히 8자리여야 합니다.",
        errorCodeInvalid: "Z, I, O를 제외한 알파벳 대문자와 숫자만 입력 가능합니다.",
        codeInputHint: "⚠️ 영문 대문자와 숫자만 입력 가능합니다",
        langName: "한국어",
    },
    en: {
        title: "🏝️ Pocopia",
        subtitle: "Nintendo Switch 2 Pocopia Cloud Island Sharing Platform",
        formTitle: "Share Cloud Island",
        labelTitle: "Title *",
        placeholderTitle: "Enter island name",
        labelDesc: "Description",
        placeholderDesc: "Brief intro (optional)",
        labelCode: "Cloud Island Code *",
        codeHint: "(8 chars, uppercase A-Y excl. Z, I, O)",
        codePlaceholder: "e.g. 1234ABCD",
        submitBtn: "Share Cloud Island",
        listTitle: "Active Cloud Islands",
        countSuffix: "",
        emptyMsg: "No cloud islands shared yet.",
        remaining: "Time left",
        seconds: "s",
        expired: "Expired",
        successMsg: "Cloud island shared! (Auto-deletes in 60s)",
        errorServer: "Server connection failed.",
        errorTitleMin: "Title must be at least 2 characters.",
        errorCodeLength: "Code must be exactly 8 characters.",
        errorCodeInvalid: "Only uppercase A-Y (excl. Z, I, O) and numbers allowed.",
        codeInputHint: "⚠️ Only uppercase letters and numbers allowed",
        langName: "English",
    },
    ja: {
        title: "🏝️ ポコピア",
        subtitle: "ニンテンドースイッチ2 ポコピア クラウド島共有プラットフォーム",
        formTitle: "クラウド島を共有",
        labelTitle: "タイトル *",
        placeholderTitle: "島の名前を入力",
        labelDesc: "説明",
        placeholderDesc: "簡単な紹介（任意）",
        labelCode: "クラウド島コード *",
        codeHint: "(Z, I, Oを除く8文字の英数字)",
        codePlaceholder: "例: 1234ABCD",
        submitBtn: "クラウド島を共有",
        listTitle: "現在アクティブなクラウド島",
        countSuffix: "個",
        emptyMsg: "まだ共有されたクラウド島はありません。",
        remaining: "残り時間",
        seconds: "秒",
        expired: "期限切れ",
        successMsg: "クラウド島を共有しました！（60秒後に自動削除）",
        errorServer: "サーバー接続に失敗しました。",
        errorTitleMin: "タイトルは2文字以上入力してください。",
        errorCodeLength: "コードは8文字である必要があります。",
        errorCodeInvalid: "Z, I, Oを除く大文字アルファベットと数字のみ入力可能です。",
        codeInputHint: "⚠️ 大文字の英数字のみ入力可能です",
        langName: "日本語",
    },
};

let currentLang = localStorage.getItem('pocopia-lang') || 'ko';

function t(key) {
    return i18n[currentLang]?.[key] || i18n['ko'][key];
}

function setLang(lang) {
    if (i18n[lang]) {
        currentLang = lang;
        localStorage.setItem('pocopia-lang', lang);
        applyTranslations();
    }
}

function applyTranslations() {
    // Header
    document.querySelector('header h1').textContent = t('title');
    document.querySelector('header p').textContent = t('subtitle');

    // Form
    document.querySelector('.upload-form h2').textContent = t('formTitle');
    document.querySelector('label[for="title"]').childNodes[0].textContent = t('labelTitle') + ' ';
    document.getElementById('title').placeholder = t('placeholderTitle');
    document.querySelector('label[for="description"]').textContent = t('labelDesc');
    document.getElementById('description').placeholder = t('placeholderDesc');

    const codeLabel = document.querySelector('label[for="code"]');
    codeLabel.childNodes[0].textContent = t('labelCode') + ' ';
    codeLabel.querySelector('.hint').textContent = t('codeHint');
    document.getElementById('code').placeholder = t('codePlaceholder');

    document.querySelector('.btn-submit').textContent = t('submitBtn');

    // List
    const listH2 = document.querySelector('.island-list h2');
    listH2.childNodes[0].textContent = t('listTitle') + ' ';

    // Empty message (if visible)
    const emptyEl = document.querySelector('.empty');
    if (emptyEl) emptyEl.textContent = t('emptyMsg');

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    // Refresh island list with new language
    fetchIslands();
}
