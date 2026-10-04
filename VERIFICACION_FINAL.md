# Verificación Final — Invergica / SIG-A

> **Estado**: COMPLETADA (3 ajustes del profesor + corrección de lectura de PDF + verificación visual, confirmados en navegador).

<br>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Ajuste</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Archivos <code>.env.example</code> solo con valores ficticios en raíz y <code>siga/</code></td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Existencia exacta de <code>siga/.env.example</code> alineada con <code>config.py</code></td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Inclusión de <code>python-dotenv</code> en <code>siga/requirements.txt</code></td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Corrección en la lectura de PDF en <code>pdfParser.ts</code></td>
      <td>✅ OK</td>
    </tr>
  </tbody>
</table>

<br>

## 1. Variables de Entorno Ficticias y Gitignore

Se verificó que los archivos de plantilla contengan únicamente valores de demostración sin credenciales reales expuestas:

* **Valores de plantilla utilizados**: `correo@ejemplo.com` / `cambia_esta_contrasena`.
* **Protección de credenciales**: Los archivos `.env` reales permanecen fuera del repositorio mediante las reglas definidas en el `.gitignore`.

## 2. Variables de Configuración en Backend (config.py)

Se validó que `config.py` cargue correctamente todas las variables clave requeridas para el funcionamiento del módulo ejecutable en Python (`siga_db`):

<br>

<table>
  <thead>
    <tr>
      <th>Variable de Entorno</th>
      <th>Propósito / Valor por defecto</th>
      <th>Leída por config.py</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>ADMIN_EMAIL</code></td>
      <td>Correo de administración</td>
      <td>✅ Sí</td>
    </tr>
    <tr>
      <td><code>ADMIN_PASSWORD</code></td>
      <td>Contraseña de acceso</td>
      <td>✅ Sí</td>
    </tr>
    <tr>
      <td><code>DB_HOST</code></td>
      <td>Host de MySQL</td>
      <td>✅ Sí</td>
    </tr>
    <tr>
      <td><code>DB_PORT</code></td>
      <td>Puerto de MySQL</td>
      <td>✅ Sí</td>
    </tr>
    <tr>
      <td><code>DB_NAME</code></td>
      <td>Nombre de la base de datos (siga_db)</td>
      <td>✅ Sí</td>
    </tr>
    <tr>
      <td><code>DB_USER</code></td>
      <td>Usuario de MySQL</td>
      <td>✅ Sí</td>
    </tr>
    <tr>
      <td><code>DB_PASSWORD</code></td>
      <td>Contraseña de MySQL</td>
      <td>✅ Sí</td>
    </tr>
  </tbody>
</table>

<br>

## 3. Dependencias del Backend (siga/requirements.txt)

Se constató que la librería `python-dotenv>=1.0.0` se encuentra declarada explícitamente junto con las dependencias principales del sistema:

* `python-dotenv>=1.0.0`
* `customtkinter`
* `pandas`
* `numpy`
* `matplotlib`
* `mysql-connector-python`

## 4. Corrección en la Lectura de PDF (pdfParser.ts)

* **Worker Local**: Se sustituyó el enlace CDN por una importación local de Vite (`?url`) para garantizar independencia de red y disponibilidad offline.
* **Reconstrucción de texto**: La función `extractTextFromPdf` reconstruye las líneas respetando la coordenada horizontal por fila.
* **Compatibilidad**: La estructura global y las interfaces TypeScript se mantuvieron intactas sin romper componentes existentes.

## 5. Verificación Visual (Módulos B02 / B03 / C02)

Se confirmó la consistencia visual y de cálculo en el navegador web:

### Módulo de Ventas (8 Productos Procesados)

<br>

<table>
  <thead>
    <tr>
      <th>Métrica / Concepto</th>
      <th>Valor Calculado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Total ventas</td>
      <td>22.250,00 Bs</td>
    </tr>
    <tr>
      <td>Total costo</td>
      <td>15.150,00 Bs</td>
    </tr>
    <tr>
      <td>Total utilidad</td>
      <td>7.050,00 Bs</td>
    </tr>
    <tr>
      <td>Margen promedio</td>
      <td>31,7 %</td>
    </tr>
    <tr>
      <td>Base imponible (Bruto − Descuentos)</td>
      <td>22.200,00 Bs</td>
    </tr>
    <tr>
      <td>IVA (16 %)</td>
      <td>3.552,00 Bs</td>
    </tr>
  </tbody>
</table>

<br>

* **Semáforo de Margen (B02)**: CAFE y JABON en verde (60 %), LECHE en amarillo (57,9 %), ARROZ en amarillo (44,4 %), productos restantes en rojo.
* **Gráfica de Rendimiento (B03)**: Representación visual de distribución de margen validada correctamente.

### Módulo de Inventario (6 Productos Registrados)

<br>

<table>
  <thead>
    <tr>
      <th>Métrica</th>
      <th>Cantidad / Valor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Total productos</td>
      <td>6</td>
    </tr>
    <tr>
      <td>Agotados</td>
      <td>1 (AZUCAR, existencia 0)</td>
    </tr>
    <tr>
      <td>Stock bajo</td>
      <td>2 (HARINA 3 &lt; 10, PAPEL 2 &lt; 10)</td>
    </tr>
    <tr>
      <td>Suficientes</td>
      <td>3</td>
    </tr>
    <tr>
      <td>Valor a costo</td>
      <td>6.537,00 Bs</td>
    </tr>
    <tr>
      <td>Valor a venta</td>
      <td>11.499,00 Bs</td>
    </tr>
  </tbody>
</table>

<br>

* **Verificación C02**: Contadores globales y alertas de stock bajo desplegados de forma correcta.

## 6. Verificación de Arranque desde Clon Limpio

Se validó la instalación e inicio del proyecto ejecutando los siguientes comandos en un entorno aislado:

### Frontend (Aplicación Web React + Vite)

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto
cp .env.example .env
npm install
npm run dev
```

### Backend (Módulo ejecutable SIG-A)

```bash
cd siga
cp .env.example .env
pip install -r requirements.txt
python main.py
```

## 7. Recordatorios de Seguridad y Arquitectura

1. **Historial de Git**: Se sugiere purgar del historial de commits cualquier credencial antigua expuesta previamente y realizar la rotación de contraseñas correspondiente.
2. **Autenticación Frontend**: La autenticación dentro de la app web es de carácter representativo para la interfaz gráfica. Dado que no interactúa con un servidor seguro para el login, las variables `VITE_*` permanecen incluidas dentro del bundle compilado en el cliente.
