// 1. Estado inicial de la caja
const caja = [
  { tipo: "billete", valor: 500, cantidad: 0 },
  { tipo: "billete", valor: 200, cantidad: 0 },
  { tipo: "billete", valor: 100, cantidad: 0 },
  { tipo: "billete", valor: 50, cantidad: 1 },
  { tipo: "billete", valor: 20, cantidad: 4 },
  { tipo: "billete", valor: 10, cantidad: 8 },
  { tipo: "billete", valor: 5, cantidad: 2 },
  { tipo: "moneda", valor: 2, cantidad: 5 },
  { tipo: "moneda", valor: 1, cantidad: 4 },
  { tipo: "moneda", valor: 0.5, cantidad: 0 },
  { tipo: "moneda", valor: 0.2, cantidad: 0 },
  { tipo: "moneda", valor: 0.1, cantidad: 1 },
  { tipo: "moneda", valor: 0.05, cantidad: 2 },
  { tipo: "moneda", valor: 0.02, cantidad: 3 },
  { tipo: "moneda", valor: 0.01, cantidad: 1 }
];

// 2. Calcular total dinámicamente
function calcularTotalCaja() {
  return caja.reduce((sum, item) => sum + item.valor * item.cantidad, 0);
}

// 3. Mostrar el estado de la caja
function mostrarEstadoCaja() {
  const total = calcularTotalCaja();
  const lineas = caja
    .map(item => `- ${item.cantidad} x ${item.tipo} de €${item.valor.toFixed(2)}`)
    .join("\n");
  const mensaje = `Estado de la caja:\n${lineas}\n\nTotal: €${total.toFixed(2)}`;
  document.getElementById("resultado").textContent = mensaje;
}

// 4. Calcular el desglose de cambio
function calcularCambio(cambio, cajaLocal) {
  let restante = Math.round(cambio * 100);
  const resultado = [];
  const copia = cajaLocal.map(item => ({ ...item }));
  copia
    .sort((a, b) => b.valor - a.valor)
    .forEach(item => {
      if (restante === 0) return;
      const cent = Math.round(item.valor * 100);
      const usar = Math.min(item.cantidad, Math.floor(restante / cent));
      if (usar > 0) {
        restante -= usar * cent;
        resultado.push({ tipo: item.tipo, valor: item.valor, cantidad: usar });
      }
    });
  return restante === 0 ? resultado : [];
}

// 5. Actualizar la caja tras el pago y el cambio
function actualizarCaja(entregado, cambioDevuelto) {
  caja.forEach(item => {
    const ent = entregado.find(e => e.tipo === item.tipo && e.valor === item.valor);
    const dev = cambioDevuelto.find(d => d.tipo === item.tipo && d.valor === item.valor);
    item.cantidad += (ent ? ent.cantidad : 0) - (dev ? dev.cantidad : 0);
  });
}

// 6. Mostrar solo el cambio 'ojo' sin actualizar la caja
function calcularCambioHTML() {
  const precioInput = document.getElementById("precio").value;
  const precio = parseFloat(precioInput);
  if (!precioInput || isNaN(precio)) {
    document.getElementById("resultado").textContent =
      "Por favor, introduce el precio del artículo.";
    return;
  }

  const entregado = recogerEntregado();
  const totalEntregado = entregado.reduce((sum, item) => sum + item.valor * item.cantidad, 0);
  const cambio = +(totalEntregado - precio).toFixed(2);
  let mensaje = `Precio del artículo: €${precio.toFixed(2)}\n`;
  mensaje += `Total entregado: €${totalEntregado.toFixed(2)}\n`;

  if (cambio < 0) {
    mensaje += `Pago insuficiente. Faltan €${Math.abs(cambio).toFixed(2)}.`;
  } else if (cambio === 0) {
    mensaje += "Pago justo. No hay cambio que devolver.";
  } else {
    const desglose = calcularCambio(cambio, caja);
    if (desglose.length === 0) {
      mensaje += "No se puede devolver el cambio exacto con la caja actual.";
    } else {
      mensaje += `Se debe devolver €${cambio.toFixed(2)} de cambio:\n`;
      desglose.forEach(d => {
        mensaje += `- ${d.cantidad} x ${d.tipo} de €${d.valor.toFixed(2)}\n`;
      });
    }
  }
  document.getElementById("resultado").textContent = mensaje;
}

/// 7. Procesar pago y actualizar la caja
function procesarPago() {
  const precioInput = document.getElementById("precio").value;
  const precio = parseFloat(precioInput);
  if (!precioInput || isNaN(precio)) {
    document.getElementById("resultado").textContent =
      "Por favor, introduce el precio del artículo.";
    return;
  }

  const entregado = recogerEntregado();
  const totalEntregado = entregado.reduce((sum, item) => sum + item.valor * item.cantidad, 0);
  const cambio = +(totalEntregado - precio).toFixed(2);
  let mensaje = `Precio del artículo: €${precio.toFixed(2)}\n`;
  mensaje += `Total entregado: €${totalEntregado.toFixed(2)}\n`;

  if (cambio < 0) {
    mensaje += `Pago insuficiente. Faltan €${Math.abs(cambio).toFixed(2)}.`;
  } else {
    const desglose = calcularCambio(cambio, caja);
    if (desglose.length === 0 && cambio > 0) {
      mensaje += "No se puede devolver el cambio exacto con la caja actual.";
    } else {
      mensaje += cambio > 0
        ? `Se devuelve €${cambio.toFixed(2)} de cambio.\n` : "Pago justo. No hay cambio que devolver.\n";
      if (desglose.length) {
        desglose.forEach(d => {
          mensaje += `- ${d.cantidad} x ${d.tipo} de €${d.valor.toFixed(2)}\n`;
        });
      }
      actualizarCaja(entregado, desglose);
      mensaje += "\nCompra procesada. Caja actualizada.";
    }
  }
  document.getElementById("resultado").textContent = mensaje;
}

//  recoger billetes y monedas que se entrega el comprador 
function recogerEntregado() {
  const entregado = [];
  [500,200,100,50,20,10,5].forEach(v => {
    const c = parseInt(document.getElementById(`billete${v}`).value) || 0;
    if (c) entregado.push({ tipo: "billete", valor: v, cantidad: c });
  });
  [2,1,0.5,0.2,0.1,0.05,0.02,0.01].forEach(v => {
    const id = v.toString().replace('.', '');
    const c = parseInt(document.getElementById(`moneda${id}`).value) || 0;
    if (c) entregado.push({ tipo: "moneda", valor: v, cantidad: c });
  });
  return entregado;
}
