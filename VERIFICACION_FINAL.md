Verificacion final
Estado: COMPLETADA. Los tres ajustes del profesor, la correccion de la
lectura de PDF y la verificacion visual quedaron confirmados en navegador.
1. Los .env.example solo con valores ficticios (OK)
	.env.example (raiz, frontend Vite): correo@ejemplo.com /
	cambia_esta_contrasena.
	siga/.env.example (backend): mismos valores ficticios.
	No aparece la clave antigua ni la nueva en ningun archivo de ejemplo.
	Los .env reales quedan fuera del repo (listados en .gitignore).
2. Existe exactamente siga/.env.example segun config.py (OK)
config.py lee estas variables y siga/.env.example define las mismas claves:
Clave en config.py	En siga/.env.example
ADMIN_EMAIL	si
ADMIN_PASSWORD	si
DB_HOST	si
DB_PORT	si
DB_NAME	si (siga_db)
DB_USER	si
DB_PASSWORD	si
3. python-dotenv en siga/requirements.txt (OK)
python-dotenv>=1.0.0 + customtkinter, pandas, numpy, matplotlib,
mysql-connector-python.
4. Lectura de PDF corregida en pdfParser.ts (OK)
	Worker de pdf.js ahora local (Vite ?url), no CDN -> lee PDFs offline y
	desde clonacion limpia.
	extractTextFromPdf reconstruye una linea por fila -> los parsers por
	linea funcionan.
	Estructura, interfaces y funciones exportadas sin cambios.
Verificacion visual B02 / B03 / C02 (CONFIRMADA en navegador)
Valores correctos observados al cargar los dos PDF de prueba:
Reporte de VENTAS (ventas_a2_sintetico.pdf) - 8 productos
Metrica	Valor
Total ventas (monto bruto)	22.250,00 Bs
Total costo	15.150,00 Bs
Total utilidad	7.050,00 Bs
Margen promedio	31,7 %
Base imponible (bruto - descuentos)	22.200,00 Bs
IVA 16% sobre la base	3.552,00 Bs
	B02 (productos + semaforo de margen): OK. CAFE y JABON verde (60%),
	LECHE amarillo (57,9%), ARROZ amarillo (44,4%), ACEITE/AZUCAR/HARINA/PAPEL rojo.
	B03 (grafica): OK, coincide con los montos de la tabla.
Reporte de INVENTARIO (inventario_a2_sintetico.pdf) - 6 productos
Metrica	Valor
Total productos	6
Agotados	1 (AZUCAR BLANCA 1KG, existencia 0)
Stock bajo	2 (HARINA 3<10, PAPEL 2<10)
Suficientes	3 (ARROZ, ACEITE, LECHE)
Valor a costo	6.537,00 Bs
Valor a venta	11.499,00 Bs
	C02 (contadores + alertas de inventario): OK, coincide con la tabla.
Arranque desde una clonacion limpia (CONFIRMADO)
Frontend (React + Vite)
git clone <tu-repo> siga-clean && cd siga-clean
cp .env.example .env            # pon tus valores reales
npm install
npm run dev
La web arranca, el login funciona y la carga de PDF opera sin conexion porque
el worker de pdf.js viaja empaquetado.
Backend (Python)
cd siga
cp .env.example .env            # pon tus valores reales (incluida DB_PASSWORD)
pip install -r requirements.txt
python main.py                  # o tu entrypoint
Recordatorio de seguridad pendiente (antes de transferir)
	La clave antigua estuvo en commits previos: limpia el historial de git
	(p.ej. git filter-repo) y rota la credencial.
	El login web es barrera de presentacion, no seguridad real: sin backend,
	cualquier VITE_* queda visible en el bundle compilado.
