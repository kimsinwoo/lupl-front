# ---------------------
# 1️⃣ BUILD STAGE
# ---------------------
    FROM node:20-alpine AS build

    WORKDIR /app
    
    # npm install
    COPY package*.json ./
    RUN npm install
    
    # Vite 실행 권한 부여
    RUN chmod +x node_modules/.bin/vite || true
    
    # 앱 복사 후 빌드
    COPY . .
    RUN npx vite build --force --mode production
    
    # ---------------------
    # 2️⃣ DEPLOY STAGE
    # ---------------------
    FROM nginx:1.25-alpine
    
    # 빌드 결과를 nginx 루트로 복사
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # SPA 라우팅 처리 (index.html fallback)
    RUN echo 'server { \
        listen 80; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $$uri $$uri/ /index.html; \
        } \
    }' > /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    