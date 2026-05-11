FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=/app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app
EXPOSE 8001
CMD ["uvicorn", "apps.search.main:app", "--host", "0.0.0.0", "--port", "8001"]
