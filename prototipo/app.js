// prototipo home-expenses — vanilla JS, estado en localStorage.
// ponytail: sin framework ni build; la versión real será Angular + FastAPI.

const CLAVE = 'he-proto-v1';
const SUPERS = ['Mercadona', 'Lidl', 'Carrefour'];
const COLOR_SUPER = { Mercadona: 'var(--s1)', Lidl: 'var(--s2)', Carrefour: 'var(--s3)' };
const CATEGORIAS = ['salida', 'cena', 'capricho', 'otro'];

function cargar() {
  try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; }
}
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(db)); }
function reiniciarDemo() {
  if (confirm('¿Borrar todo y volver a los datos de ejemplo?')) {
    db = semilla(); guardar(); render();
  }
}

// ── utilidades ──────────────────────────────────────────────
const eur = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const r2 = n => Math.round(n * 100) / 100;
const hoy = () => fechaISO(new Date());
const fechaISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => crypto.randomUUID();
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const nombreMes = m => { const [a, mm] = m.split('-'); return `${MESES[+mm - 1]} ${a}`; };

// ── datos de ejemplo ────────────────────────────────────────
function semilla() {
  const productos = [
    ['Aceite de oliva 1L', 8.5], ['Arroz 1kg', 1.2], ['Leche 6L', 5.4],
    ['Huevos docena', 2.8], ['Pollo kg', 6.5], ['Pan', 1.1],
    ['Tomates kg', 2.2], ['Detergente', 4.9], ['Papel higiénico 12', 3.6],
    ['Atún pack 3', 3.2], ['Agua 6L', 1.9], ['Queso curado', 3.8],
  ].map(([nombre, base], i) => ({ id: `p${i}`, nombre, base }));

  const factor = { Mercadona: 1, Lidl: 0.94, Carrefour: 1.07 };
  const compras = [];
  // una compra semanal desde febrero, rotando de supermercado, con deriva de precios
  for (let i = 0; i < 24; i++) {
    const fecha = new Date(2026, 1, 1 + i * 7);
    if (fecha > new Date()) break;
    const supermercado = SUPERS[i % 3];
    const items = productos
      .filter((p, j) => (i + j) % 3 !== 0)
      .map((p, j) => ({
        productoId: p.id,
        cantidad: 1 + ((i + j) % 2),
        precio: r2(p.base * factor[supermercado] * (1 + 0.002 * i) * (1 + 0.05 * Math.sin(i * 0.9 + j * 1.3))),
      }));
    compras.push({
      id: uid(), fecha: fechaISO(fecha), supermercado, items,
      total: r2(items.reduce((s, x) => s + x.precio * x.cantidad, 0)),
    });
  }

  const esporadicos = [];
  const ingresos = [];
  for (let m = 2; m <= 7; m++) {
    const mm = String(m).padStart(2, '0');
    esporadicos.push(
      { id: uid(), fecha: `2026-${mm}-06`, concepto: 'Cena fuera', categoria: 'cena', importe: r2(32 + m * 2.5) },
      { id: uid(), fecha: `2026-${mm}-14`, concepto: 'Cine', categoria: 'salida', importe: 18 },
    );
    if (m % 2 === 0) esporadicos.push({ id: uid(), fecha: `2026-${mm}-21`, concepto: 'Capricho', categoria: 'capricho', importe: r2(12 + m) });
    ingresos.push({ id: uid(), fecha: `2026-${mm}-01`, concepto: 'Nómina', importe: 1650 });
  }
  ingresos.push({ id: uid(), fecha: '2026-06-25', concepto: 'Venta segunda mano', importe: 80 });

  const d = { productos, lista: [{ productoId: 'p1', cantidad: 2 }, { productoId: 'p5', cantidad: 1 }], compras, esporadicos, ingresos };
  localStorage.setItem(CLAVE, JSON.stringify(d));
  return d;
}

let db = cargar() ?? semilla(); // tras las utilidades: semilla() las usa

// ── derivados ───────────────────────────────────────────────
const producto = id => db.productos.find(p => p.id === id);
const enPeriodo = (f, pref) => f.startsWith(pref); // pref: 'AAAA' o 'AAAA-MM'
const suma = xs => r2(xs.reduce((s, x) => s + x, 0));

function gastoTotal(pref) {
  return suma([
    ...db.compras.filter(c => enPeriodo(c.fecha, pref)).map(c => c.total),
    ...db.esporadicos.filter(e => enPeriodo(e.fecha, pref)).map(e => e.importe),
  ]);
}
const ingresoTotal = pref => suma(db.ingresos.filter(i => enPeriodo(i.fecha, pref)).map(i => i.importe));

// historial de precios de un producto: derivado de las compras guardadas
function preciosDe(productoId) {
  return db.compras
    .flatMap(c => c.items.filter(i => i.productoId === productoId)
      .map(i => ({ fecha: c.fecha, supermercado: c.supermercado, precio: i.precio })))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
function ultimoPrecio(productoId, supermercado) {
  const h = preciosDe(productoId).filter(x => !supermercado || x.supermercado === supermercado);
  return h.at(-1)?.precio ?? producto(productoId)?.base ?? 0;
}

// ── gráficas (SVG a mano) ───────────────────────────────────
function graficaBarras(items) { // items: [{etiqueta, valor, tip}]
  const W = 640, H = 200, izq = 48, arr = 12, aba = 24;
  const max = Math.max(...items.map(i => i.valor), 1);
  const nice = Math.ceil(max / 4 / 50) * 50 * 4 || 100;
  const px = v => arr + (H - arr - aba) * (1 - v / nice);
  const banda = (W - izq - 12) / items.length;
  const grosor = Math.min(24, banda - 8);
  let s = '';
  for (let g = 0; g <= 4; g++) {
    const v = nice * g / 4, y = px(v);
    s += `<line x1="${izq}" x2="${W - 12}" y1="${y}" y2="${y}" stroke="var(--rejilla)"/>` +
         `<text x="${izq - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--apagado)">${v.toLocaleString('es-ES')}</text>`;
  }
  items.forEach((it, i) => {
    const x = izq + banda * i + (banda - grosor) / 2;
    const y = px(it.valor), h = Math.max(H - aba - y, 0);
    if (it.valor > 0)
      s += `<path d="M${x},${H - aba} v${-(h - 4)} q0,-4 4,-4 h${grosor - 8} q4,0 4,4 v${h - 4} z" fill="var(--s1)" data-tip="${esc(it.tip)}"/>`;
    s += `<text x="${x + grosor / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--apagado)">${it.etiqueta}</text>`;
  });
  s += `<line x1="${izq}" x2="${W - 12}" y1="${H - aba}" y2="${H - aba}" stroke="var(--eje)"/>`;
  return `<svg class="grafica" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

function graficaLineas(series) { // series: [{nombre, color, puntos:[{fecha, valor}]}]
  const W = 640, H = 240, izq = 48, arr = 12, aba = 26;
  const todos = series.flatMap(s => s.puntos);
  if (!todos.length) return '<p class="apagado">Sin datos todavía.</p>';
  const fechas = [...new Set(todos.map(p => p.fecha))].sort();
  const t0 = Date.parse(fechas[0]), t1 = Math.max(Date.parse(fechas.at(-1)), t0 + 1);
  const vMin = Math.min(...todos.map(p => p.valor)) * 0.93;
  const vMax = Math.max(...todos.map(p => p.valor)) * 1.05;
  const X = f => izq + (W - izq - 16) * (Date.parse(f) - t0) / (t1 - t0);
  const Y = v => arr + (H - arr - aba) * (1 - (v - vMin) / (vMax - vMin));
  let s = '';
  for (let g = 0; g <= 3; g++) {
    const v = vMin + (vMax - vMin) * g / 3, y = Y(v);
    s += `<line x1="${izq}" x2="${W - 16}" y1="${y}" y2="${y}" stroke="var(--rejilla)"/>` +
         `<text x="${izq - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--apagado)">${v.toFixed(2)}</text>`;
  }
  const etiquetasX = fechas.filter((_, i) => i % Math.ceil(fechas.length / 6) === 0);
  etiquetasX.forEach(f => {
    s += `<text x="${X(f)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--apagado)">${f.slice(5)}</text>`;
  });
  for (const serie of series) {
    const pts = serie.puntos;
    if (!pts.length) continue;
    s += `<polyline points="${pts.map(p => `${X(p.fecha)},${Y(p.valor)}`).join(' ')}" fill="none" stroke="${serie.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const p of pts) // punto visible + zona de hover generosa
      s += `<circle cx="${X(p.fecha)}" cy="${Y(p.valor)}" r="4" fill="${serie.color}" stroke="var(--superficie)" stroke-width="2"/>` +
           `<circle cx="${X(p.fecha)}" cy="${Y(p.valor)}" r="12" fill="transparent" data-tip="${esc(`${serie.nombre} · ${p.fecha}\n${eur(p.valor)}`)}"/>`;
  }
  return `<svg class="grafica" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

function chispa(valores, ancho = 90, alto = 24) { // sparkline mini
  if (valores.length < 2) return '';
  const min = Math.min(...valores), max = Math.max(...valores) || 1;
  const pts = valores.map((v, i) =>
    `${(i / (valores.length - 1)) * (ancho - 6) + 3},${3 + (alto - 6) * (1 - (v - min) / (max - min || 1))}`);
  return `<svg class="chispa" width="${ancho}" height="${alto}">
    <polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="${pts.at(-1).split(',')[0]}" cy="${pts.at(-1).split(',')[1]}" r="2.5" fill="var(--s1)"/></svg>`;
}

// tooltip compartido
const tip = document.getElementById('tip');
document.addEventListener('pointerover', e => {
  const el = e.target.closest?.('[data-tip]');
  if (el) { tip.textContent = el.dataset.tip; tip.hidden = false; }
});
document.addEventListener('pointermove', e => {
  if (!tip.hidden) { tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY + 14 + 'px'; }
});
document.addEventListener('pointerout', e => {
  if (e.target.closest?.('[data-tip]')) tip.hidden = true;
});

// ── vistas ──────────────────────────────────────────────────
const app = document.getElementById('app');
const ui = { mesGastos: hoy().slice(0, 7), productoPrecio: null };

function vResumen() {
  const mes = hoy().slice(0, 7), ano = mes.slice(0, 4);
  const gm = gastoTotal(mes), ga = gastoTotal(ano);
  const im = ingresoTotal(mes), balance = r2(im - gm);
  const barras = MESES.map((n, i) => {
    const clave = `${ano}-${String(i + 1).padStart(2, '0')}`;
    const v = gastoTotal(clave);
    return { etiqueta: n, valor: v, tip: `${n} ${ano}\n${eur(v)}` };
  });
  const caros = db.productos
    .map(p => ({ p, precio: ultimoPrecio(p.id), hist: preciosDe(p.id).map(x => x.precio) }))
    .sort((a, b) => b.precio - a.precio).slice(0, 5);

  return `
  <h2>Este mes (${nombreMes(mes)})</h2>
  <div class="tarjeta">
    <div class="etiqueta">Gastado este mes</div>
    <div class="heroe">${eur(gm)}</div>
    <div class="delta ${balance >= 0 ? 'bien' : 'mal'}">${balance >= 0 ? '▲' : '▼'} balance del mes ${eur(balance)} <span class="apagado">(ingresos − gastos)</span></div>
  </div>
  <div class="fichas">
    <div class="tarjeta"><div class="etiqueta">Gastado en ${ano}</div><div class="valor">${eur(ga)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Ingresos del mes</div><div class="valor">${eur(im)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Ahorro del año</div><div class="valor ${ingresoTotal(ano) - ga >= 0 ? 'bien' : 'mal'}">${eur(r2(ingresoTotal(ano) - ga))}</div></div>
  </div>
  <h2>Gasto por mes</h2>
  <div class="tarjeta">${graficaBarras(barras)}</div>
  <h2>Los 5 más caros ahora</h2>
  <div class="tarjeta"><table>
    <tr><th>Producto</th><th>Evolución</th><th class="num">Último precio</th></tr>
    ${caros.map(({ p, precio, hist }) => `
      <tr class="clicable" onclick="irAPrecio('${p.id}')">
        <td>${esc(p.nombre)}</td><td>${chispa(hist)}</td><td class="num">${eur(precio)}</td>
      </tr>`).join('')}
  </table></div>`;
}

function vLista() {
  const enLista = new Set(db.lista.map(i => i.productoId));
  const disponibles = db.productos.filter(p => !enLista.has(p.id));
  const filas = db.lista.map(i => {
    const p = producto(i.productoId);
    return `<tr>
      <td>${esc(p.nombre)}</td>
      <td class="num">
        <button class="mini" onclick="cambiarCantidad('${p.id}',-1)">−</button>
        <span style="display:inline-block;min-width:24px;text-align:center">${i.cantidad}</span>
        <button class="mini" onclick="cambiarCantidad('${p.id}',1)">+</button>
      </td>
      <td class="num"><button class="mini" onclick="quitarDeLista('${p.id}')">quitar</button></td>
    </tr>`;
  }).join('');

  return `
  <h2>Lista de la compra</h2>
  <div class="tarjeta">
    <form class="linea" onsubmit="event.preventDefault(); anadirALista(this.prod.value)">
      <label class="campo">Producto del catálogo
        <select name="prod" ${disponibles.length ? '' : 'disabled'}>
          ${disponibles.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}
        </select>
      </label>
      <button ${disponibles.length ? '' : 'disabled'}>Añadir</button>
    </form>
    <form class="linea" style="margin-top:10px" onsubmit="event.preventDefault(); nuevoProducto(this.nombre.value); this.reset()">
      <label class="campo">Nuevo producto en el catálogo
        <input name="nombre" required placeholder="p. ej. Café molido">
      </label>
      <button>Crear y añadir</button>
    </form>
  </div>
  ${db.lista.length ? `
  <div class="tarjeta"><table>
    <tr><th>Producto</th><th class="num">Cantidad</th><th></th></tr>${filas}
  </table></div>
  <h2>Cerrar la compra</h2>
  <div class="tarjeta">
    <form class="linea" style="margin-bottom:12px">
      <label class="campo">Supermercado
        <select id="superCompra" onchange="render()">
          ${SUPERS.map(s => `<option ${s === (document.getElementById('superCompra')?.value ?? SUPERS[0]) ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </label>
      <label class="campo">Fecha <input type="date" id="fechaCompra" value="${hoy()}"></label>
    </form>
    <table>
      <tr><th>Producto</th><th class="num">Cant.</th><th class="num">Precio unidad</th><th class="num">Subtotal</th></tr>
      ${db.lista.map(i => {
        const p = producto(i.productoId);
        const sug = ultimoPrecio(p.id, document.getElementById('superCompra')?.value ?? SUPERS[0]);
        return `<tr>
          <td>${esc(p.nombre)}</td><td class="num">${i.cantidad}</td>
          <td class="num"><input type="number" step="0.01" min="0" data-precio="${p.id}" value="${sug.toFixed(2)}" oninput="totalCompraVivo()"></td>
          <td class="num" data-sub="${p.id}">${eur(r2(sug * i.cantidad))}</td>
        </tr>`;
      }).join('')}
    </table>
    <p style="display:flex;justify-content:space-between;align-items:center">
      <strong>Total: <span id="totalCompra"></span></strong>
      <button class="primario" onclick="guardarCompra()">Guardar gasto</button>
    </p>
  </div>` : '<p class="apagado">La lista está vacía: añade productos del catálogo.</p>'}`;
}

function vGastos() {
  const m = ui.mesGastos, ano = m.slice(0, 4);
  const movs = [
    ...db.compras.filter(c => enPeriodo(c.fecha, m)).map(c => ({ tipo: 'compra', ...c })),
    ...db.esporadicos.filter(e => enPeriodo(e.fecha, m)).map(e => ({ tipo: 'capricho', ...e })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return `
  <h2>Gastos</h2>
  <div class="fichas">
    <div class="tarjeta"><div class="etiqueta">Total ${nombreMes(m)}</div><div class="valor">${eur(gastoTotal(m))}</div></div>
    <div class="tarjeta"><div class="etiqueta">Total ${ano}</div><div class="valor">${eur(gastoTotal(ano))}</div></div>
  </div>
  <div class="tarjeta">
    <form class="linea"><label class="campo">Mes
      <input type="month" value="${m}" onchange="ui.mesGastos=this.value; render()">
    </label></form>
  </div>
  <div class="tarjeta">
    ${movs.length ? movs.map(mov => mov.tipo === 'compra' ? `
      <details class="mov"><summary><span class="fila-mov">
        <span class="fecha">${mov.fecha.slice(5)}</span>
        <span class="detalle"><span class="punto" style="background:${COLOR_SUPER[mov.supermercado]}"></span>${mov.supermercado} · ${mov.items.length} productos</span>
        <span class="importe">${eur(mov.total)}</span>
        <button class="mini" onclick="event.preventDefault(); borrarCompra('${mov.id}')">×</button>
      </span></summary>
      <div class="submov">${mov.items.map(i => `${i.cantidad} × ${esc(producto(i.productoId)?.nombre ?? '?')} — ${eur(i.precio)}`).join('<br>')}</div>
      </details>` : `
      <div class="fila-mov" style="border-bottom:1px solid var(--rejilla)">
        <span class="fecha">${mov.fecha.slice(5)}</span>
        <span class="detalle">${esc(mov.concepto)} <span class="apagado">· ${mov.categoria}</span></span>
        <span class="importe">${eur(mov.importe)}</span>
        <button class="mini" onclick="borrarEsporadico('${mov.id}')">×</button>
      </div>`).join('')
    : '<p class="apagado">Sin movimientos este mes.</p>'}
  </div>`;
}

function vPrecios() {
  const pid = ui.productoPrecio ?? db.productos[0].id;
  const hist = preciosDe(pid);
  const series = SUPERS.map(s => ({
    nombre: s, color: COLOR_SUPER[s],
    puntos: hist.filter(h => h.supermercado === s).map(h => ({ fecha: h.fecha, valor: h.precio })),
  })).filter(s => s.puntos.length);
  const ranking = db.productos
    .map(p => ({ p, precio: ultimoPrecio(p.id), hist: preciosDe(p.id).map(x => x.precio) }))
    .sort((a, b) => b.precio - a.precio);

  return `
  <h2>Evolución del precio</h2>
  <div class="tarjeta">
    <form class="linea" style="margin-bottom:12px"><label class="campo">Producto
      <select onchange="ui.productoPrecio=this.value; render()">
        ${db.productos.map(p => `<option value="${p.id}" ${p.id === pid ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}
      </select>
    </label></form>
    <div class="leyenda">${series.map(s => `<span><span class="punto" style="background:${s.color}"></span>${s.nombre}</span>`).join('')}</div>
    ${graficaLineas(series)}
  </div>
  <h2>Comparativa entre supermercados</h2>
  <div class="tarjeta"><table>
    <tr><th>Supermercado</th><th class="num">Último</th><th class="num">Mínimo</th><th class="num">Máximo</th></tr>
    ${SUPERS.map(s => {
      const ps = hist.filter(h => h.supermercado === s).map(h => h.precio);
      if (!ps.length) return `<tr><td><span class="punto" style="background:${COLOR_SUPER[s]}"></span>${s}</td><td class="num apagado" colspan="3">sin datos</td></tr>`;
      return `<tr><td><span class="punto" style="background:${COLOR_SUPER[s]}"></span>${s}</td>
        <td class="num">${eur(ps.at(-1))}</td><td class="num">${eur(Math.min(...ps))}</td><td class="num">${eur(Math.max(...ps))}</td></tr>`;
    }).join('')}
  </table></div>
  <h2>De más caro a más barato</h2>
  <div class="tarjeta"><table>
    <tr><th>#</th><th>Producto</th><th>Evolución</th><th class="num">Último precio</th></tr>
    ${ranking.map(({ p, precio, hist: h }, i) => `
      <tr class="clicable" onclick="irAPrecio('${p.id}')">
        <td class="apagado">${i + 1}</td><td>${esc(p.nombre)}</td><td>${chispa(h)}</td><td class="num">${eur(precio)}</td>
      </tr>`).join('')}
  </table></div>`;
}

function vCaprichos() {
  const mes = hoy().slice(0, 7), ano = mes.slice(0, 4);
  const totalMes = suma(db.esporadicos.filter(e => enPeriodo(e.fecha, mes)).map(e => e.importe));
  const totalAno = suma(db.esporadicos.filter(e => enPeriodo(e.fecha, ano)).map(e => e.importe));
  const lista = [...db.esporadicos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 20);
  return `
  <h2>Gastos esporádicos</h2>
  <div class="fichas">
    <div class="tarjeta"><div class="etiqueta">Este mes</div><div class="valor">${eur(totalMes)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Este año</div><div class="valor">${eur(totalAno)}</div></div>
  </div>
  <div class="tarjeta">
    <form class="linea" onsubmit="event.preventDefault(); anadirEsporadico(this); this.reset()">
      <label class="campo">Fecha <input type="date" name="fecha" value="${hoy()}" required></label>
      <label class="campo">Concepto <input name="concepto" required placeholder="p. ej. Cena sushi"></label>
      <label class="campo">Categoría <select name="categoria">${CATEGORIAS.map(c => `<option>${c}</option>`).join('')}</select></label>
      <label class="campo">Importe € <input type="number" name="importe" step="0.01" min="0" required></label>
      <button class="primario">Apuntar</button>
    </form>
  </div>
  <div class="tarjeta">
    ${lista.map(e => `<div class="fila-mov" style="border-bottom:1px solid var(--rejilla)">
      <span class="fecha">${e.fecha.slice(5)}</span>
      <span class="detalle">${esc(e.concepto)} <span class="apagado">· ${e.categoria}</span></span>
      <span class="importe">${eur(e.importe)}</span>
      <button class="mini" onclick="borrarEsporadico('${e.id}')">×</button>
    </div>`).join('') || '<p class="apagado">Nada apuntado aún.</p>'}
  </div>`;
}

function vIngresos() {
  const mes = hoy().slice(0, 7), ano = mes.slice(0, 4);
  const im = ingresoTotal(mes), ia = ingresoTotal(ano);
  const ahorroMes = r2(im - gastoTotal(mes)), ahorroAno = r2(ia - gastoTotal(ano));
  const lista = [...db.ingresos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 20);
  return `
  <h2>Ingresos</h2>
  <div class="fichas">
    <div class="tarjeta"><div class="etiqueta">Ingresos del mes</div><div class="valor">${eur(im)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Ingresos del año</div><div class="valor">${eur(ia)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Ahorro del mes</div><div class="valor ${ahorroMes >= 0 ? 'bien' : 'mal'}">${eur(ahorroMes)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Ahorro del año</div><div class="valor ${ahorroAno >= 0 ? 'bien' : 'mal'}">${eur(ahorroAno)}</div></div>
  </div>
  <div class="tarjeta">
    <form class="linea" onsubmit="event.preventDefault(); anadirIngreso(this); this.reset()">
      <label class="campo">Fecha <input type="date" name="fecha" value="${hoy()}" required></label>
      <label class="campo">Concepto <input name="concepto" required placeholder="p. ej. Nómina"></label>
      <label class="campo">Importe € <input type="number" name="importe" step="0.01" min="0" required></label>
      <button class="primario">Apuntar</button>
    </form>
  </div>
  <div class="tarjeta">
    ${lista.map(i => `<div class="fila-mov" style="border-bottom:1px solid var(--rejilla)">
      <span class="fecha">${i.fecha.slice(5)}</span>
      <span class="detalle">${esc(i.concepto)}</span>
      <span class="importe bien">+${eur(i.importe)}</span>
      <button class="mini" onclick="borrarIngreso('${i.id}')">×</button>
    </div>`).join('') || '<p class="apagado">Sin ingresos apuntados.</p>'}
  </div>`;
}

// ── acciones ────────────────────────────────────────────────
function anadirALista(pid) { db.lista.push({ productoId: pid, cantidad: 1 }); guardar(); render(); }
function nuevoProducto(nombre) {
  const p = { id: uid(), nombre: nombre.trim(), base: 0 };
  if (!p.nombre) return;
  db.productos.push(p); db.lista.push({ productoId: p.id, cantidad: 1 }); guardar(); render();
}
function cambiarCantidad(pid, d) {
  const it = db.lista.find(i => i.productoId === pid);
  it.cantidad = Math.max(1, it.cantidad + d); guardar(); render();
}
function quitarDeLista(pid) { db.lista = db.lista.filter(i => i.productoId !== pid); guardar(); render(); }

function totalCompraVivo() {
  let total = 0;
  for (const inp of document.querySelectorAll('[data-precio]')) {
    const item = db.lista.find(i => i.productoId === inp.dataset.precio);
    const sub = r2((+inp.value || 0) * item.cantidad);
    document.querySelector(`[data-sub="${inp.dataset.precio}"]`).textContent = eur(sub);
    total += sub;
  }
  document.getElementById('totalCompra').textContent = eur(r2(total));
}

function guardarCompra() {
  const items = db.lista.map(i => ({
    productoId: i.productoId, cantidad: i.cantidad,
    precio: r2(+document.querySelector(`[data-precio="${i.productoId}"]`).value || 0),
  }));
  db.compras.push({
    id: uid(),
    fecha: document.getElementById('fechaCompra').value || hoy(),
    supermercado: document.getElementById('superCompra').value,
    items,
    total: r2(items.reduce((s, x) => s + x.precio * x.cantidad, 0)),
  });
  db.lista = []; guardar();
  location.hash = '#/gastos';
}
function borrarCompra(id) { db.compras = db.compras.filter(c => c.id !== id); guardar(); render(); }

function anadirEsporadico(f) {
  db.esporadicos.push({ id: uid(), fecha: f.fecha.value, concepto: f.concepto.value.trim(), categoria: f.categoria.value, importe: r2(+f.importe.value) });
  guardar(); render();
}
function borrarEsporadico(id) { db.esporadicos = db.esporadicos.filter(e => e.id !== id); guardar(); render(); }

function anadirIngreso(f) {
  db.ingresos.push({ id: uid(), fecha: f.fecha.value, concepto: f.concepto.value.trim(), importe: r2(+f.importe.value) });
  guardar(); render();
}
function borrarIngreso(id) { db.ingresos = db.ingresos.filter(i => i.id !== id); guardar(); render(); }

function irAPrecio(pid) { ui.productoPrecio = pid; location.hash = '#/precios'; render(); }

// ── router ──────────────────────────────────────────────────
const RUTAS = { '/': vResumen, '/lista': vLista, '/gastos': vGastos, '/precios': vPrecios, '/caprichos': vCaprichos, '/ingresos': vIngresos };
function render() {
  const ruta = location.hash.replace('#', '') || '/';
  app.innerHTML = (RUTAS[ruta] ?? vResumen)();
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('activa', a.dataset.ruta === ruta));
  if (document.getElementById('totalCompra')) totalCompraVivo();
}
addEventListener('hashchange', render);
render();

// ── auto-chequeo (abre la consola: no debe haber errores) ───
console.assert(r2(0.1 + 0.2) === 0.3, 'redondeo de céntimos');
console.assert(gastoTotal('2026') >= gastoTotal(hoy().slice(0, 7)), 'el año contiene al mes');
console.assert(db.compras.every(c => r2(c.items.reduce((s, i) => s + i.precio * i.cantidad, 0)) === c.total), 'totales de compra cuadran');
console.assert(preciosDe('p0').every((x, i, a) => i === 0 || a[i - 1].fecha <= x.fecha), 'historial de precios ordenado');
