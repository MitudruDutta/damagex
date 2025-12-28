# Build Stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final Stage
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /home/appuser appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application code
COPY . .
RUN chown -R appuser:appuser /app

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/app/model/saved_model.pth

USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]