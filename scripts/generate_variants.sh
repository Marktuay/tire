#!/usr/bin/env bash
set -euo pipefail

# scripts/generate_variants.sh
# Genera variantes responsive (WebP y AVIF) a partir de archivos originales.
# Coloca tus originales en images/ con nombres:
#  - images/hero-original.jpg
#  - images/prod-1-original.jpg
#  - images/prod-2-original.jpg
#  - images/prod-3-original.jpg
#  - images/prod-4-original.jpg
# Uso: bash scripts/generate_variants.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
IMAGES_DIR="$ROOT_DIR/images"
mkdir -p "$IMAGES_DIR"

# herramientas opcionales
HAS_MAGICK=0
HAS_CWEBP=0
HAS_AVIFENC=0

if command -v magick >/dev/null 2>&1; then
  HAS_MAGICK=1
fi
if command -v cwebp >/dev/null 2>&1; then
  HAS_CWEBP=1
fi
if command -v avifenc >/dev/null 2>&1; then
  HAS_AVIFENC=1
fi

echo "Herramientas detectadas: magick=$HAS_MAGICK cwebp=$HAS_CWEBP avifenc=$HAS_AVIFENC"

# Configuración de tamaños
HERO_SIZES=(1600 1200 900 600)
PROD_SIZES=(800 400 200)
THUMB_SIZES=(320 160)

# Funciones utilitarias
convert_to_webp_with_magick(){
  local src=$1 dest=$2 q=${3:-80}
  magick "$src" -quality "$q" "$dest"
}

convert_to_avif_with_magick(){
  local src=$1 dest=$2 q=${3:-60}
  magick "$src" -quality "$q" "$dest"
}

convert_to_webp_with_cwebp(){
  local src=$1 dest=$2 q=${3:-80} w=${4:-0}
  if [ "$w" -gt 0 ]; then
    cwebp -q "$q" -resize "$w" 0 "$src" -o "$dest"
  else
    cwebp -q "$q" "$src" -o "$dest"
  fi
}

convert_to_avif_with_avifenc(){
  local tmp=$1 dest=$2 qmin=${3:-30} qmax=${4:-40}
  # avifenc toma un archivo de entrada. Usamos el tmp ya redimensionado si necesario
  avifenc --min $qmin --max $qmax "$tmp" "$dest"
}

# procesa un archivo original generando tamaños y formatos
process_image(){
  local original=$1 base_name=$2 sizes=($3)
  if [ ! -f "$original" ]; then
    echo "AVISO: original no encontrado: $original -> saltando $base_name"
    return
  fi

  for size in "${sizes[@]}"; do
    webp_out="$IMAGES_DIR/${base_name}-${size}.webp"
    avif_out="$IMAGES_DIR/${base_name}-${size}.avif"

    echo "Generando $webp_out"
    if [ "$HAS_MAGICK" -eq 1 ]; then
      magick "$original" -resize ${size}x -quality 80 "$webp_out"
    elif [ "$HAS_CWEBP" -eq 1 ]; then
      # cwebp puede redimensionar
      cwebp -q 80 -resize $size 0 "$original" -o "$webp_out"
    else
      echo "Error: ni magick ni cwebp están disponibles. Instala ImageMagick o webp." >&2
      exit 1
    fi

    if [ "$HAS_AVIFENC" -eq 1 ]; then
      echo "Generando $avif_out"
      if [ "$HAS_MAGICK" -eq 1 ]; then
        # magick puede generar avif directamente si soportado
        magick "$original" -resize ${size}x -quality 60 "$avif_out" || {
          # fallback: crear temporal jpg y usar avifenc
          tmp="$IMAGES_DIR/tmp-${base_name}-${size}.jpg"
          magick "$original" -resize ${size}x -quality 80 "$tmp"
          avifenc --min 30 --max 40 "$tmp" "$avif_out"
          rm -f "$tmp"
        }
      else
        # no magick: crear temporal redimensionado con cwebp -> jpg y avifenc
        tmp="$IMAGES_DIR/tmp-${base_name}-${size}.jpg"
        cwebp -q 80 -resize $size 0 "$original" -o "$IMAGES_DIR/tmp-${base_name}-${size}.webP"
        # fallback: try avifenc from original (may be slow)
        magick "$original" -resize ${size}x "$tmp" 2>/dev/null || true
        if [ -f "$tmp" ]; then
          avifenc --min 30 --max 40 "$tmp" "$avif_out"
          rm -f "$tmp"
        else
          echo "Aviso: no se pudo generar AVIF para $original (falta magick para crear temporal)"
        fi
      fi
    fi
  done
}

# Ejecuta para hero
process_image "$IMAGES_DIR/hero-original.jpg" "hero" "${HERO_SIZES[*]}"

# Ejecuta para productos
for i in 1 2 3 4; do
  process_image "$IMAGES_DIR/prod-${i}-original.jpg" "prod-${i}" "${PROD_SIZES[*]}"
done

# thumbnails opcionales
for name in hero prod-1 prod-2 prod-3 prod-4; do
  for s in "${THUMB_SIZES[@]}"; do
    src_orig="$IMAGES_DIR/${name}-original.jpg"
    if [ -f "$src_orig" ]; then
      out="$IMAGES_DIR/${name}-${s}.webp"
      echo "Generando thumb $out"
      if [ "$HAS_MAGICK" -eq 1 ]; then
        magick "$src_orig" -resize ${s}x -quality 75 "$out"
      else
        cwebp -q 75 -resize $s 0 "$src_orig" -o "$out"
      fi
    fi
  done
done

cat <<EOF
Generación completada.
Ficheros generados en: $IMAGES_DIR
Recuerda revisar que los archivos existan y que HTML use srcset/sizes adecuados.
EOF
