Verificación Final — Invergica / SIG-A

Estado: COMPLETADA. Los tres ajustes del profesor, la corrección de la lectura de PDF y la verificación visual quedaron confirmados en navegador.

Resumen de ajustes
#	Ajuste	Estado
1	.env.examplesolo con valores ficticios (raíz y siga/)	✅ OK
2	Existe exactamente siga/.env.examplesegún config.py	✅ OK
3	python-dotenven siga/requirements.txt	✅ OK
4	Lectura de PDF corregida en pdfParser.ts	✅ OK
1. Los .env.example solo con valores ficticios
	.env.example (raíz, frontend Vite): correo@ejemplo.com / cambia_esta_contrasena.
	siga/.env.example (backend): mismos valores ficticios.
	No aparece la clave antigua ni la nueva en ningún archivo de ejemplo.
	Los .env reales quedan fuera del repo (listados en .gitignore).
2. Existe exactamente siga/.env.example según config.py
config.py lee estas variables y siga/.env.example define las mismas claves:
Clave en config.py	En siga/.env.example
ADMIN_EMAIL	✅ sí
ADMIN_PASSWORD	✅ sí
DB_HOST	✅ sí
DB_PORT	✅ sí
DB_NAME	✅ sí (siga_db)
DB_USER	✅ sí
DB_PASSWORD	✅ sí
3. python-dotenv en siga/requirements.txt
python-dotenv>=1.0.0 + customtkinter, pandas, numpy, matplotlib, mysql-connector-python.
4. Lectura de PDF corregida en pdfParser.ts
	Worker de pdf.js ahora local (Vite ?url), no CDN → lee PDFs offline y desde clonación limpia.
	extractTextFromPdf reconstruye una línea por fila → los parsers por línea funcionan.
	Estructura, interfaces y funciones exportadas sin cambios.
Verificación visual B02 / B03 / C02 — CONFIRMADA en navegador
Reporte de VENTAS (ventas_a2_sintetico.pdf) — 8 productos
Métrica	Valor
Total ventas (monto bruto)	22.250,00 Bs
Total costo	15.150,00 Bs
Total utilidad	7.050,00 Bs
Margen promedio	31,7 %
Base imponible (bruto − descuentos)	22.200,00 Bs
IVA 16 % sobre la base	3.552,00 Bs
	B02 (productos + semáforo de margen): ✅ CAFE y JABON verde (60 %), LECHE amarillo (57,9 %), ARROZ amarillo (44,4 %), ACEITE / AZUCAR / HARINA / PAPEL rojo.
	B03 (gráfica): ✅ coincide con los montos de la tabla.
Reporte de INVENTARIO (inventario_a2_sintetico.pdf) — 6 productos
Métrica	Valor
Total productos	6
Agotados	1 (AZUCAR BLANCA 1KG, existencia 0)
Stock bajo	2 (HARINA 3<10, PAPEL 2<10)
Suficientes	3 (ARROZ, ACEITE, LECHE)
Valor a costo	6.537,00 Bs
Valor a venta	11.499,00 Bs
	C02 (contadores + alertas de inventario): ✅ coincide con la tabla.
Arranque desde una clonación limpia — CONFIRMADO
Frontend (React + Vite)
git clone <tu-repo> siga-clean && cd siga-clean
cp .env.example .env            # pon tus valores reales
npm install
npm run dev
La web arranca, el login funciona y la carga de PDF opera sin conexión porque el worker de pdf.js viaja empaquetado.
Backend (Python)
cd siga
cp .env.example .env            # pon tus valores reales (incluida DB_PASSWORD)
pip install -r requirements.txt
python main.py                  # o tu entrypoint
Si al arrancar el backend ves el aviso de que faltan ADMIN_EMAIL / ADMIN_PASSWORD, es que el .env no se creó o está incompleto.

Recordatorio de seguridad pendiente (antes de transferir)
	La clave antigua estuvo en commits previos: limpia el historial de git (p.ej. git filter-repo) y rota la credencial.
	El login web es una barrera de presentación, no seguridad real: sin backend, cualquier VITE_* queda visible en el bundle compilado.
