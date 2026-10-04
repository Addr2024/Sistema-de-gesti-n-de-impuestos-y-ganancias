# Verificacion final de los 3 ajustes del profesor

Esta ronda cubre exactamente los tres puntos pedidos y la verificacion final.

## 1. Los .env.example solo con valores ficticios

- `.env.example` (raiz, frontend Vite): usa `correo@ejemplo.com` y
  `cambia_esta_contrasena`. No contiene ninguna credencial real.
- `siga/.env.example` (backend): mismos valores ficticios. No aparece la clave
  antigua ni la nueva en ningun archivo de ejemplo.

> Importante: los archivos reales `.env` y `siga/.env` NO se incluyen y deben
> quedar fuera del repositorio (listados en `.gitignore`).

## 2. Debe existir exactamente `siga/.env.example` segun `config.py`

`config.py` lee estas variables; `siga/.env.example` define exactamente estas
mismas claves (mismos nombres):

| Clave en config.py | Presente en siga/.env.example |
|--------------------|-------------------------------|
| ADMIN_EMAIL        | si                            |
| ADMIN_PASSWORD     | si                            |
| DB_HOST            | si                            |
| DB_PORT            | si                            |
| DB_NAME            | si (siga_db)                  |
| DB_USER            | si                            |
| DB_PASSWORD        | si                            |

## 3. python-dotenv en siga/requirements.txt

`siga/requirements.txt` incluye `python-dotenv>=1.0.0` junto al resto del stack
(customtkinter, pandas, numpy, matplotlib, mysql-connector-python).

---

## Verificacion visual B02 / B03 / C02 (hazla tu en el navegador)

No puedo abrir un navegador aqui, asi que estos son los valores esperados para
que los confirmes en pantalla. Los PDF de la carpeta A2 se verificaron con
extraccion de texto:

- Base imponible esperada: **22.200,00 Bs**
- IVA (16%) esperado: **3.552,00 Bs**
- (El descuento de 50 ya queda restado en la base.)

Comprueba que B02, B03 y C02 muestran esos montos y que el color del margen /
semaforo se pinta segun el resultado.

## Arranque desde un clon limpio (hazlo tu)

No puedo clonar ni levantar la app en este entorno; estos son los pasos:

### Frontend (web React + Vite)
```bash
git clone <tu-repo> siga-clean && cd siga-clean
cp .env.example .env            # y pon tus valores reales
npm install
npm run dev                     # o: npm run build && npm run preview
```

### Backend (Python)
```bash
cd siga
cp .env.example .env            # y pon tus valores reales (incluida DB_PASSWORD)
pip install -r requirements.txt
python main.py                  # o el entrypoint que uses
```

Si al arrancar el backend ves el aviso de que faltan ADMIN_EMAIL/ADMIN_PASSWORD,
es que el `.env` no se creo o esta incompleto.

## Recordatorio de seguridad pendiente

- La clave antigua **no debe aparecer en el repo**. Como estuvo en commits
  previos, limpia el historial de git (por ejemplo con `git filter-repo`) antes
  de transferir, y rota la credencial.
- El login de la web es una barrera de presentacion, no seguridad real: al no
  haber backend, cualquier `VITE_*` queda visible en el bundle compilado.
