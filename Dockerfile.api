FROM python:3.11.6-slim

WORKDIR /app
COPY . /app

RUN pip install poetry
RUN poetry install -C packages/scraper
RUN poetry install -C packages/api

RUN apt-get update && apt-get upgrade -y && \
  apt-get install -y nodejs \
  npm   

RUN npm install
RUN npm run turbo run setup
RUN npm run turbo run scrape