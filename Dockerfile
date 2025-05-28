FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install -g @angular/cli@18 && npm install
EXPOSE 8080
CMD ["npm", "start"]