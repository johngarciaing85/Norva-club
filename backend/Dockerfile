FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY . .
RUN chmod +x start.sh

RUN adduser --disabled-password --no-create-home appuser
USER appuser

EXPOSE 8000
CMD ["./start.sh"]
