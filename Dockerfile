FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# build expo web
RUN npx expo export

RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]