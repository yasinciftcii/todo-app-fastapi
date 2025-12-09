FROM python:3.10-slim

# Logların anlık görünmesi için ayar
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Gerekli kütüphaneleri kur
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Proje dosyalarını kopyala
COPY . .

# Uygulamayı başlat (Port 8000)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]