#!/usr/bin/env bash
set -euo pipefail

# scripts/download_and_optimize_images.sh
# Descarga imágenes públicas (Unsplash) y las convierte a WebP optimizado.
# Uso: bash scripts/download_and_optimize_images.sh
# Requisitos (macOS): curl, brew, cwebp (libwebp). Si no tienes cwebp, instala con: brew install webp

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR%/scripts}"
IMAGES_DIR="$ROOT_DIR/images"
mkdir -p "$IMAGES_DIR"

# Mapea nombre de archivo -> URL de descarga
declare -A IMAGES
IMAGES[hero]="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1400&auto=format&fit=crop"
IMAGES[prod-1]="https://images.unsplash.com/photo-1517949908114-3f27f8f69c9b?q=80&w=800&auto=format&fit=crop"
IMAGES[prod-2]="https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=800&auto=format&fit=crop"
IMAGES[prod-3]="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop&crop=top"
IMAGES[prod-4]="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=800&auto=format&fit=crop"

echo "Directorio images: $IMAGES_DIR"

# Verifica dependencia cwebp
if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp no encontrado. Instala con: brew install webp"
  exit 1
fi

# Descarga y convierte
for name in "${!IMAGES[@]}"; do
  url=${IMAGES[$name]}
  jpg_path="$IMAGES_DIR/${name}.jpg"
  webp_path="$IMAGES_DIR/${name}.webp"

  echo "Descargando $name desde $url"
  curl -L --fail -o "$jpg_path" "$url"

  echo "Convirtiendo $jpg_path -> $webp_path (calidad 80)"
  cwebp -q 80 "$jpg_path" -o "$webp_path"

  # reducir metadatos: cwebp no guarda EXIF por defecto
  echo "Optimizado: $webp_path"

  # opcional: eliminar el jpg original
  rm -f "$jpg_path"
done

cat <<EOF
Listo! Imágenes descargadas y convertidas a WebP en:
  $IMAGES_DIR

Recuerda que ya actualicé las rutas en index.html para apuntar a los .webp.
Si quieres mantener los JPG originales, edita el script para eliminar la línea 'rm -f "$jpg_path"'.
EOF
