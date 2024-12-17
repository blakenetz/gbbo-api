FROM python:3.11.6-slim

WORKDIR /app
COPY . /app

RUN pip install poetry
RUN poetry install -C packages/scraper
RUN poetry install -C packages/api
