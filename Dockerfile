FROM node:14.21 as build

WORKDIR /nestjsApp

# coppy content from pakage.json and package-lock.json to the working directory
COPY package*.json .
COPY prisma ./prisma
# COPY node_modules ./node_modules/

# Install app dependencies
RUN npm install

# Generate prisma client,
RUN npx prisma generate
# Coppy all to the working directory i.e nestjsApp directory
COPY . .

# Generate js files/ build the app
RUN npm run build


# production conatainer
FROM node:14.21

WORKDIR /nestjsApp

COPY package.json .
# install production packeges from packege.json file


RUN npm install --only=production

# copy production files from the dist folder
COPY --from=build /nestjsApp/node_modules ./node_modules
COPY --from=build /nestjsApp/package*.json ./
COPY --from=build /nestjsApp/prisma ./prisma
COPY --from=build /nestjsApp/dist ./dist
# Generate prisma client,
RUN npx prisma generate

EXPOSE 8080
# CMD npm run start:prod
CMD [ "npm","run", "start:prod" ]