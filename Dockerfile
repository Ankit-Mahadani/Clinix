# ==========================================
# Multi-Stage Production Dockerfile for MediTrack
# ==========================================

# Stage 1: Build Dependencies & Wheels
FROM python:3.12-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Build wheels for all packages AND their transitive dependencies (no --no-deps)
RUN pip install --no-cache-dir --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt


# Stage 2: Final Runtime Image
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install runtime utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -s /bin/bash -m appuser

# Install built wheels from builder stage
COPY --from=builder /build/wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels requirements.txt

# Copy application source code
COPY --chown=appuser:appgroup . /app

# Ensure entrypoint is executable
RUN chmod +x /app/entrypoint.sh

# Switch to non-root user
USER appuser

EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
