# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /code

# Copy requirements first to leverage Docker cache
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the application code
COPY . /code

# Create a non-root user (required by Hugging Face for security)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set working directory to where main.py is located
WORKDIR $HOME/app
COPY --chown=user . $HOME/app

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start the FastAPI application
# Ensure your FastAPI instance is named 'app' in main.py
CMD ["uvicorn", "main.py:app", "--host", "0.0.0.0", "--port", "7860"]