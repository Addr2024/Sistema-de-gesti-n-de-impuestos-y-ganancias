# Informe de Aceptación — Invergica / SIG-A v1.0

* **Fecha**: 2026-10-05
* **Referencia**: `src/tests/fase3-aceptacion/checklist-alfa.md`

> **Dictamen**: ACEPTADO (24/25); la única falla E02 (menú móvil) no es bloqueante.

<br>

## 1. Metodología de Ejecución

La validación de la entrega se llevó a cabo combinando las siguientes suites de pruebas y verificaciones:

* **Pruebas de Interfaz**: Entorno simulado con `jsdom` + Testing Library.
* **Flujo de Extracción PDF (A2)**: Prueba del parser `pdfjs-dist` con documentos sintéticos estructurados en tabla.
* **Verificación Visual**: Confirmación manual de los módulos B02, B03 y C02 en navegador.
* **Arranque Limpio**: Despliegue completo desde repositorio clonado.
* **Resultados Totales Pruebas Unitarias/Integración**:
  * Web / React: **127/127 pasadas**
  * Backend SIG-A (Python): **77/77 pasadas**

## 2. Matriz de Resultados del Checklist Alfa

<br>

<table>
  <thead>
    <tr>
      <th>Caso de Prueba</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A01–A06</td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>B01, B04, B05</td>
      <td>✅ OK (Validado con PDF sintético)</td>
    </tr>
    <tr>
      <td>B02</td>
      <td>✅ OK (Verificación visual: productos + semáforo)</td>
    </tr>
    <tr>
      <td>B03</td>
      <td>✅ OK (Verificación visual: gráfica)</td>
    </tr>
    <tr>
      <td>C01, C03</td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>C02</td>
      <td>✅ OK (Verificación visual: contadores + alertas)</td>
    </tr>
    <tr>
      <td>D01–D06</td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>E01, E03, E04</td>
      <td>✅ OK</td>
    </tr>
    <tr>
      <td>E02</td>
      <td>❌ Falla no bloqueante (Ausencia de menú desplegable móvil)</td>
    </tr>
    <tr>
      <td>E05</td>
      <td>✅ OK (Carga completa en décimas de segundo)</td>
    </tr>
  </tbody>
</table>

<br>

## 3. Validación del Flujo PDF A2 (Formato de Facturación)

Se confirmó la precisión en los cálculos resultantes del análisis del PDF:

<br>

<table>
  <thead>
    <tr>
      <th>Concepto Financiero</th>
      <th>Monto (Bs)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Monto bruto</td>
      <td>22.250,00</td>
    </tr>
    <tr>
      <td>Descuentos aplicados</td>
      <td>50,00</td>
    </tr>
    <tr>
      <td>Base imponible</td>
      <td>22.200,00</td>
    </tr>
    <tr>
      <td>IVA (16 %)</td>
      <td>3.552,00</td>
    </tr>
  </tbody>
</table>

<br>

> **Nota de Corrección**: En iteraciones previas se calculaba el IVA directamente sobre el monto bruto ($22.250,00 \times 16\% = 3.560,00\text{ Bs}$) sin descontar la rebaja. Con el ajuste aplicado, la base imponible ($22.200,00\text{ Bs}$) genera exactamente $3.552,00\text{ Bs}$ de IVA, cuadrando la matemática financiera del comprobante.

* **Caso de Error de Formato**: Al procesar un PDF no-A2, el parser retorna adecuadamente el mensaje: `"No se encontraron productos"`.
* **Observación sobre Entorno Pruebas**: Se probaron estructuras sintéticas. Se sugiere realizar una verificación adicional opcional con facturas reales impresas o escaneadas.

### Procedimiento Recomendado para Prueba con PDF Real

1. Iniciar la aplicación web mediante `npm run dev`.
2. Navegar al módulo de **Ventas / Importación de Facturas**.
3. Cargar el archivo PDF real desde el explorador.
4. Inspeccionar la tabla resultante para corroborar que la Base Imponible sea igual a $\text{Monto Bruto} - \text{Descuentos}$ y que el IVA sea del $16\%$.

## 4. Estado de Hallazgos

### Hallazgos Resueltos

<br>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Hallazgo Detectado</th>
      <th>Solución Aplicada</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Worker de pdf.js apuntaba a CDN externo</td>
      <td>Configurado worker local mediante sintaxis de Vite <code>?url</code></td>
      <td>✅ Resuelto</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Descuentos ignorados en la base imponible del PDF</td>
      <td>Ajustado el cálculo: $\text{Base Imponible} = \text{Bruto} - \text{Descuento}$</td>
      <td>✅ Resuelto</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Falta de <code>index.html</code> en raíz del frontend</td>
      <td>Archivo creado e incluido en el control de versiones con <code>.gitignore</code> adecuado</td>
      <td>✅ Resuelto</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Credenciales expuestas directamente en código Python</td>
      <td>Implementado <code>config.py</code> utilizando <code>os.getenv</code> y <code>python-dotenv</code></td>
      <td>✅ Resuelto</td>
    </tr>
  </tbody>
</table>

<br>

### Hallazgos Pendientes (No Bloqueantes)

<br>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Hallazgo</th>
      <th>Detalle / Impacto</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>5</td>
      <td>Menú móvil ausente (E02)</td>
      <td>No bloqueante. La vista responsive contrae la navegación pero carece de botón hamburguesa funcional.</td>
    </tr>
    <tr>
      <td>6</td>
      <td>Descripciones multilínea en PDF</td>
      <td>Descripciones de productos muy largas divididas en dos líneas horizontales pueden truncarse debido al agrupamiento por coordenada Y.</td>
    </tr>
    <tr>
      <td>7</td>
      <td>Compatibilidad de <code>pdfjs-dist</code> v6.x</td>
      <td>Requiere funciones JS modernas en el entorno de pruebas, configuradas vía polyfills en <code>setup.ts</code>.</td>
    </tr>
    <tr>
      <td>8</td>
      <td>Variables <code>VITE_*</code> en el bundle</td>
      <td>Las variables de entorno expuestas al cliente web quedan embebidas en el JS estático. Se debe mantener el backend como la única fuente de autenticación real.</td>
    </tr>
  </tbody>
</table>

<br>
