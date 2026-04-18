FROM python:3.11-slim

# Install build dependencies for dlib
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for layer caching — only reinstalls if requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install gunicorn

COPY . .

EXPOSE 5000

CMD gunicorn "app:create_app()" --bind 0.0.0.0:${PORT:-5000} --workers 1 --timeout 120
