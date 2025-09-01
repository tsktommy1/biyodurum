from node:22-alpine as builder

workdir /app

copy package.json package-lock.json ./
run npm ci

copy . .

run npm run build

from nginx:alpine as runtime

copy --from=builder /app/dist /usr/share/nginx/html

expose 80
