#!/bin/bash
# Caminho da imagem FULL SQUARE para evitar bordas brancas
SOURCE="/Users/murilomendonca/.gemini/antigravity/brain/df836686-d6ec-45fd-bd82-1b618e794342/licita_gestor_icon_full_square_v2_1769541584716.png"

echo "Atualizando ícones (versão quadrada sem bordas)..."
cp "$SOURCE" public/icon-512x512.png
cp "$SOURCE" public/icon-192x192.png
cp "$SOURCE" src/app/icon.png
echo "Ícones full-square atualizados com sucesso!"
