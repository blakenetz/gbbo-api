FROM python:3.9-slim

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy only requirements to cache them in docker layer
COPY pyproject.toml poetry.lock* ./

RUN poetry lock --no-update

# Configure poetry
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi

# Copy application code
COPY . .

# Run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 