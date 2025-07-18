FROM python:3.10

# Set working directory to /app
WORKDIR /app

# Copy backend and other necessary folders into /app
COPY backend/ ./backend/
COPY ml/ ./ml/
COPY utils/ ./utils/
COPY data/ ./data/

# Copy requirements.txt from root (assumed to be next to docker-compose.yml)
COPY requirements.txt .

# Set PYTHONPATH so Python can find your modules easily
ENV PYTHONPATH=/app

# Switch working directory to backend where main.py is located
WORKDIR /app/backend

# Install Python dependencies from requirements.txt in /app folder
RUN pip install --no-cache-dir -r ../requirements.txt

# Start the FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]






