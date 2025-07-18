# Use a Python base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/requirements.txt

# Install the necessary dependencies for ML
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the entire contents of the 'ml' folder into the container
COPY . /app/ml

# Expose a port if needed (for any ML-based web service or API)
# EXPOSE <port_number>

# Command to run when the container starts (replace with your app's entry point)
CMD ["python", "/app/ml/train.py"]
