#!/bin/bash
set -e

# 현재 HEAD 해시
HASH=$(git rev-parse --short HEAD)

echo "🚀 Deploying with cache bust hash: $HASH"

# index.html 의 ?v= 값을 현재 커밋 해시로 치환
sed -i '' "s/\?v=[a-f0-9]*/\?v=$HASH/g" static/index.html

# 변경사항이 없으면 스킵
git diff --quiet static/index.html && {
    echo "ℹ️ Already up-to-date"
    git push origin main 2>/dev/null || true
    exit 0
}

# 변경사항 커밋 & 푸시
git add static/index.html
git commit -m "deploy: bump cache bust to $HASH"
git push origin main

echo "✅ Deployed!"
