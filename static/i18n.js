const i18n = {
    ko: {
        title: "🏝️ 포코피아",
        subtitle: "닌텐도 스위치2 포코피아 클라우드섬 공유 플랫폼",
        formTitle: "클라우드섬 공유하기",
        labelTitle: "제목 *",
        titleHint: "(최소 2자 이상)",
        placeholderTitle: "제목을 입력하세요",
        labelDesc: "설명",
        placeholderDesc: "간단한 소개 (선택)",
        labelCode: "클라우드섬 코드 *",
        codeHint: "(Z, I, O 제외한 8자리 알파벳/숫자)",
        codePlaceholder: "예: 1234ABCD",
        submitBtn: "클라우드섬 공유하기",
        listTitle: "현재 활성화된 클라우드섬",
        countSuffix: "개",
        emptyMsg: "아직 공유된 클라우드섬이 없습니다.",
        remaining: "남은 시간",
        minutes: "분",
        seconds: "초",
        expired: "만료됨",
        successMsg: "클라우드섬이 공유되었습니다! (자동 삭제됨)",
        durationLabel: "공유 기간",
        duration1m: "1분",
        duration5m: "5분",
        duration30m: "30분",
        duration60m: "60분",
        errorServer: "서버 연결에 실패했습니다.",
        errorTitleMin: "제목은 2자 이상 입력해주세요.",
        errorTitleMax: "제목은 20자 이하여야 합니다.",
        errorDescMax: "설명은 40자 이하여야 합니다.",
        errorCodeLength: "코드는 정확히 8자리여야 합니다.",
        errorCodeInvalid: "Z, I, O를 제외한 알파벳 대문자와 숫자만 입력 가능합니다.",
        errorIpLimit: "IP당 최대 2개의 클라우드섬만 동시에 공유할 수 있습니다. 기존 게시물이 만료된 후 다시 시도해주세요.",
        errorCooldown: "쿨타임 중입니다. 잠시 후 다시 시도해주세요.",
        errorNotFound: "해당 클라우드섬을 찾을 수 없습니다.",
        codeInputHint: "⚠️ 영어 대문자와 숫자만 입력 가능합니다",
        viewCodeBtn: "코드 보기",
        cooldownMsg: "쿨타임",
        searchPlaceholder: "제목으로 검색...",
        refreshHint: "브라우저 새로고침으로 목록을 갱신합니다.",
        filterAll: "유저 섬",
        filterMine: "나의 섬",
        filterPinned: "유명 섬",
        permanent: "상시",
        infoStorage: "데이터 저장",
        infoStorageDesc: "모든 데이터는 서버 메모리에만 저장됩니다. 서버가 재시작되면 모든 게시물이 사라집니다.",
        infoIp: "IP 기반 식별",
        infoIpDesc: "동일 Wi-Fi 네트워크 사용자는 같은 IP 주소를 공유할 수 있습니다.",
        infoAbuse: "악용 방지",
        infoAbuseDesc: "IP당 최대 2개 게시물. 코드 보기 30초 쿨타임.",
        infoPrivacy: "개인정보",
        infoPrivacyDesc: "로그인 불필요. IP 주소는 속도 제한용으로만 사용되며 공유되지 않습니다.",
        infoContact: "문의",
        infoContactDesc: "001201parg@gmail.com",
        deleteAllMine: "내 게시 모두 삭제",
        deleteSuccess: "내 게시물이 모두 삭제되었습니다.",
        emptyMyMsg: "내가 공유한 클라우드섬이 없습니다.",
        langName: "한국어",
    },
    en: {
        title: "🏝️ Pokopia",
        subtitle: "Nintendo Switch 2 Pokopia Cloud Island Sharing Platform",
        formTitle: "Share Cloud Island",
        labelTitle: "Title *",
        titleHint: "(at least 2 characters)",
        placeholderTitle: "Enter title",
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
        minutes: "m",
        seconds: "s",
        expired: "Expired",
        successMsg: "Cloud island shared! (Auto-deletes)",
        durationLabel: "Duration",
        duration1m: "1 min",
        duration5m: "5 min",
        duration30m: "30 min",
        duration60m: "60 min",
        errorServer: "Server connection failed.",
        errorTitleMin: "Title must be at least 2 characters.",
        errorTitleMax: "Title must be at most 20 characters.",
        errorDescMax: "Description must be at most 40 characters.",
        errorCodeLength: "Code must be exactly 8 characters.",
        errorCodeInvalid: "Only uppercase A-Y (excl. Z, I, O) and numbers allowed.",
        errorIpLimit: "You can only share up to 2 cloud islands at a time. Please try again after your existing posts expire.",
        errorCooldown: "Cooldown active. Please try again in a moment.",
        errorNotFound: "Cloud island not found.",
        codeInputHint: "⚠️ Only English letters and numbers",
        viewCodeBtn: "View Code",
        cooldownMsg: "Cooldown",
        searchPlaceholder: "Search by title...",
        refreshHint: "Refresh the page to see new posts.",
        filterAll: "User Islands",
        filterMine: "My Islands",
        filterPinned: "Famous Island",
        permanent: "Always",
        infoStorage: "Data Storage",
        infoStorageDesc: "All data is stored only in server memory. When the server restarts, all posts disappear.",
        infoIp: "IP-Based Identification",
        infoIpDesc: "Users on the same Wi-Fi network may share the same IP address.",
        infoAbuse: "Abuse Prevention",
        infoAbuseDesc: "Max 2 posts per IP. 30-second cooldown between code reveals.",
        infoPrivacy: "Privacy",
        infoPrivacyDesc: "No login required. IP addresses are used only for rate limiting and are not shared.",
        infoContact: "Contact",
        infoContactDesc: "001201parg@gmail.com",
        deleteAllMine: "Delete All My Posts",
        deleteSuccess: "All your posts have been deleted.",
        emptyMyMsg: "You haven't shared any cloud islands yet.",
        langName: "English",
    },
    ja: {
        title: "🏝️ ポコピア",
        subtitle: "ニンテンドースイッチ2 ポコピア クラウド島共有プラットフォーム",
        formTitle: "クラウド島を共有",
        labelTitle: "タイトル *",
        titleHint: "(2文字以上)",
        placeholderTitle: "タイトルを入力",
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
        minutes: "分",
        seconds: "秒",
        expired: "期限切れ",
        successMsg: "クラウド島を共有しました！（自動削除）",
        durationLabel: "共有期間",
        duration1m: "1分",
        duration5m: "5分",
        duration30m: "30分",
        duration60m: "60分",
        errorServer: "サーバー接続に失敗しました。",
        errorTitleMin: "タイトルは2文字以上入力してください。",
        errorTitleMax: "タイトルは20文字以内にしてください。",
        errorDescMax: "説明は40文字以内にしてください。",
        errorCodeLength: "コードは8文字である必要があります。",
        errorCodeInvalid: "Z, I, Oを除く大文字アルファベットと数字のみ入力可能です。",
        errorIpLimit: "IPあたり最大2つのクラウド島を同時に共有できます。既存の投稿が期限切れになってから再度お試しください。",
        errorCooldown: "クールタイム中です。しばらくしてからもう一度お試しください。",
        errorNotFound: "クラウド島が見つかりません。",
        codeInputHint: "⚠️ 英語の大文字と数字のみ入力可能です",
        viewCodeBtn: "コードを見る",
        cooldownMsg: "クールタイム",
        searchPlaceholder: "タイトルで検索...",
        refreshHint: "ページを更新すると新しい投稿が表示されます。",
        filterAll: "ユーザー島",
        filterMine: "マイ島",
        filterPinned: "有名島",
        permanent: "常時",
        infoStorage: "データ保存",
        infoStorageDesc: "すべてのデータはサーバーのメモリにのみ保存されます。サーバーが再起動すると、すべての投稿が消えます。",
        infoIp: "IPベースの識別",
        infoIpDesc: "同じWi-Fiネットワークのユーザーは同じIPアドレスを共有する場合があります。",
        infoAbuse: "悪用防止",
        infoAbuseDesc: "IPあたり最大2つの投稿。コード表示の30秒クールタイム。",
        infoPrivacy: "プライバシー",
        infoPrivacyDesc: "ログイン不要。IPアドレスは速度制限用のみで共有されません。",
        infoContact: "問い合わせ",
        infoContactDesc: "001201parg@gmail.com",
        deleteAllMine: "自分の投稿をすべて削除",
        deleteSuccess: "自分の投稿がすべて削除されました。",
        emptyMyMsg: "まだクラウド島を共有していません。",
        langName: "日本語",
    },
};

let currentLang = localStorage.getItem('pokopia-lang') || 'en';

function t(key) {
    return i18n[currentLang]?.[key] || i18n['ko'][key];
}

function setLang(lang) {
    if (i18n[lang]) {
        currentLang = lang;
        localStorage.setItem('pokopia-lang', lang);
        applyTranslations();
    }
}

function applyTranslations() {
    // Header
    document.querySelector('header h1').textContent = t('title');
    document.querySelector('header p').textContent = t('subtitle');

    // Form
    document.querySelector('.upload-form h2').textContent = t('formTitle');
    const titleLabel = document.querySelector('label[for="title"]');
    titleLabel.childNodes[0].textContent = t('labelTitle') + ' ';
    const titleHintEl = titleLabel.querySelector('.hint');
    if (titleHintEl) titleHintEl.textContent = t('titleHint');
    document.getElementById('title').placeholder = t('placeholderTitle');
    document.querySelector('label[for="description"]').textContent = t('labelDesc');
    document.getElementById('description').placeholder = t('placeholderDesc');

    const codeLabel = document.querySelector('label[for="code"]');
    codeLabel.childNodes[0].textContent = t('labelCode') + ' ';
    codeLabel.querySelector('.hint').textContent = t('codeHint');
    document.getElementById('code').placeholder = t('codePlaceholder');

    document.querySelector('.btn-submit').textContent = t('submitBtn');

    // Search placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');

    // Refresh hint
    const refreshHint = document.getElementById('refreshHint');
    if (refreshHint) refreshHint.textContent = t('refreshHint');

    // Filter tabs
    const filterAll = document.getElementById('filterAll');
    if (filterAll) filterAll.textContent = t('filterAll');
    const filterMine = document.getElementById('filterMine');
    if (filterMine) filterMine.textContent = t('filterMine');
    const filterPinned = document.getElementById('filterPinned');
    if (filterPinned) filterPinned.textContent = t('filterPinned');

    // Delete all button
    const deleteAllBtn = document.getElementById('deleteAllMineBtn');
    if (deleteAllBtn) deleteAllBtn.textContent = t('deleteAllMine');

    // Duration labels
    const durationLabelEl = document.querySelector('.duration-label');
    if (durationLabelEl) durationLabelEl.textContent = t('durationLabel');
    const durationLabels = document.querySelectorAll('.duration-option span');
    if (durationLabels[0]) durationLabels[0].textContent = t('duration1m');
    if (durationLabels[1]) durationLabels[1].textContent = t('duration5m');
    if (durationLabels[2]) durationLabels[2].textContent = t('duration30m');
    if (durationLabels[3]) durationLabels[3].textContent = t('duration60m');

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

    // Info panel
    const infoIds = ['infoStorage','infoIp','infoAbuse','infoPrivacy','infoContact'];
    const descIds = ['infoStorageDesc','infoIpDesc','infoAbuseDesc','infoPrivacyDesc','infoContactDesc'];
    infoIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = t(id);
    });
    descIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = t(id);
    });

    // Refresh island list with new language (캐시된 데이터로 재렌더링, 서버 요청 없음)
    if (typeof reRenderFromCache === 'function') {
        reRenderFromCache();
    }
}
