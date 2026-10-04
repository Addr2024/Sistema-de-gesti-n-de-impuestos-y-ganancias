Informe de Aceptacion - Invergica / SIG-A v1.0 (corregido)
Fecha: 2026-10-05. Checklist: src/tests/fase3-aceptacion/checklist-alfa.md.
Como se ejecuto
	src/tests/fase3-aceptacion/aceptacion.ui.test.tsx: UI real (jsdom + Testing
	Library) para login, impuestos y navegacion.
	src/tests/fase3-aceptacion/aceptacion.pdf.test.tsx: flujo de PDF A2 con el
	parser real (pdfjs-dist) y los paneles reales, usando PDFs sinteticos
	en src/tests/fixtures/.
	Verificacion visual en navegador (B02, B03, C02) con los dos PDF de prueba.
	Arranque desde clonacion limpia confirmado (frontend Vite + backend Python).
	Resultado global de pruebas automatizadas: web 127/127, SIGA 77/77.
Resultado: 24 pasan, 1 falla (no bloqueante), 0 pendientes (de 25)
Caso	Estado
A01-A06	Pasa
B01, B04, B05	Pasa (PDF sintetico)
B02	Pasa (verificacion visual confirmada: productos + semaforo de margen)
B03	Pasa (verificacion visual confirmada: grafica)
C01, C03	Pasa (PDF sintetico)
C02	Pasa (verificacion visual confirmada: contadores + alertas de inventario)
D01-D06	Pasa
E01, E03, E04	Pasa
E02	Falla (no bloqueante): sin menu movil
E05	Pasa: carga de PDF en decimas de segundo
Flujo PDF A2 (hallazgo principal)
Con los PDF sinteticos se extraen 8 productos de ventas y 6 de inventario. Montos verificados:
	Monto bruto total: 22.250,00 Bs
	Base imponible (bruto menos descuentos de 50,00): 22.200,00 Bs
	IVA 16% sobre la base: 3.552,00 Bs
(Correccion respecto a la version anterior del informe, que indicaba 22.250,00
-> 3.560,00: no restaba el descuento. Ahora el descuento se resta y el IVA
cuadra en 3.552,00.)
Un PDF que no es A2 muestra «No se encontraron productos» y no guarda nada.
Nota: los PDF siguen siendo sinteticos (generados por el equipo). Queda
pendiente, de forma opcional, repetir el flujo con un reporte real de A2.
Procedimiento manual con PDF real (opcional, del equipo)
Iniciar sesion y abrir «Documentos».
Arrastrar el PDF de Cierre de Caja de A2 -> verificar productos, semaforo
1.	(B02) y grafica (B03).
Verificar el badge «Datos guardados» y la seccion «Impuestos» (B04, D01).
Arrastrar el PDF de inventario -> contadores y alertas (C01, C02, C03).
Repetir con un PDF cualquiera (B05) y cronometrar la carga (E05).
Hallazgos y estado
Resueltos en esta ronda
1.	Worker desde CDN -> RESUELTO. pdfParser.ts ahora carga el worker de
2.	pdf.js empaquetado por Vite (import ... '?url'). La lectura de PDF funciona
sin internet y desde una clonacion limpia.
3.	Descuentos ignorados -> RESUELTO. La base imponible resta los descuentos
del monto bruto (22.250,00 - 50,00 = 22.200,00; IVA = 3.552,00).
4.	Sin index.html -> RESUELTO. Se agrego index.html y .gitignore; el
5.	proyecto compila y arranca con npm run dev fuera de Figma Make.
6.	Credenciales en el codigo -> RESUELTO. config.py lee todo por
7.	os.getenv + python-dotenv; los .env.example solo tienen valores
8.	ficticios y los .env reales quedan fuera del repo.
Pendientes / limitaciones conocidas
5.	Menu movil ausente (E02, no bloqueante): Navbar usa hidden md:flex
sin boton hamburguesa.
6.	Descripciones multilinea: si A2 parte una descripcion en dos lineas, el
agrupamiento por coordenada Y (tolerancia) puede perder parte de la
descripcion. No afecta los PDF de prueba actuales.
7.	pdfjs-dist 6.x exige JS moderno (Promise.try, Uint8Array.toHex,
8.	Math.sumPrecise); en pruebas se agregan polyfills en setup.ts.
Navegadores muy antiguos podrian fallar.
9.	*`VITE_` visible en el bundle**: sin backend, el login web es una barrera
de interfaz, no seguridad real.
Recomendacion final antes de transferir
	Limpiar el historial de git donde quedo la clave antigua y rotar la
	credencial.
	Opcional: resolver el menu movil (E02) y la descripcion multilinea (hallazgo
	6) en una proxima iteracion; ninguno bloquea la aceptacion.
Dictamen: ACEPTADO (24/25; la unica falla, E02, no es bloqueante).
