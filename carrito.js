// Sistema de carrito de compras

// Obtener carrito desde localStorage
function obtenerCarrito() {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : [];
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// Agregar producto al carrito
function agregarAlCarrito(productoId) {
    // Cargar productos desde JSON
    fetch('productos.json')
        .then(response => response.json())
        .then(productos => {
            const producto = productos.find(p => p.id === productoId);
            
            if (!producto) {
                alert('Producto no encontrado');
                return;
            }
            
            const carrito = obtenerCarrito();
            
            // Calcular precio con descuento si está en oferta
            const precioFinal = producto.oferta ? 
                Math.round(producto.precio * (1 - producto.descuento / 100)) : 
                producto.precio;
            
            // Verificar si el producto ya está en el carrito
            const productoExistente = carrito.find(item => item.id === productoId);
            
            if (productoExistente) {
                // Verificar si hay stock disponible
                if (productoExistente.cantidad >= producto.stock) {
                    mostrarNotificacion(`No hay más stock disponible de ${producto.nombre}`, 'warning');
                    return;
                }
                productoExistente.cantidad++;
            } else {
                // Verificar stock antes de agregar por primera vez
                if (producto.stock < 1) {
                    mostrarNotificacion(`${producto.nombre} no tiene stock disponible`, 'warning');
                    return;
                }
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: precioFinal,
                    precioOriginal: producto.precio,
                    imagen: producto.imagen,
                    stock: producto.stock,
                    oferta: producto.oferta,
                    descuento: producto.descuento,
                    cantidad: 1
                });
            }
            
            guardarCarrito(carrito);
            mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
        })
        .catch(error => {
            console.error('Error al agregar producto:', error);
            alert('Error al agregar el producto al carrito');
        });
}

// Eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito(carrito);
    
    // Si estamos en la página del carrito, recargar la vista
    if (document.getElementById('carrito-container')) {
        mostrarCarrito();
    }
}

// Actualizar cantidad de un producto
function actualizarCantidad(productoId, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(productoId);
        return;
    }
    
    const carrito = obtenerCarrito();
    const producto = carrito.find(item => item.id === productoId);
    
    if (producto) {
        // Verificar que no exceda el stock disponible
        if (nuevaCantidad > producto.stock) {
            mostrarNotificacion(`Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`, 'warning');
            return;
        }
        
        producto.cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        
        // Si estamos en la página del carrito, recargar la vista
        if (document.getElementById('carrito-container')) {
            mostrarCarrito();
        }
    }
}

// Vaciar carrito completo
function vaciarCarrito() {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
        
        // Si estamos en la página del carrito, recargar la vista
        if (document.getElementById('carrito-container')) {
            mostrarCarrito();
        }
    }
}

// Actualizar contador del carrito en el navbar
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    const contador = document.getElementById('carrito-contador');
    if (contador) {
        contador.textContent = totalItems;
        
        // Mostrar u ocultar el badge según la cantidad
        if (totalItems > 0) {
            contador.style.display = 'inline-block';
        } else {
            contador.style.display = 'none';
        }
    }
}

// Calcular total del carrito
function calcularTotal() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// Mostrar notificación temporal
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    const claseAlerta = tipo === 'warning' ? 'alert-warning' : 'alert-success';
    notificacion.className = `alert ${claseAlerta} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notificacion.style.zIndex = '9999';
    notificacion.style.minWidth = '300px';
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

// Mostrar carrito en la página dedicada
function mostrarCarrito() {
    const container = document.getElementById('carrito-container');
    if (!container) return;
    
    const carrito = obtenerCarrito();
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <h4>Tu carrito está vacío</h4>
                <p>Agrega productos para comenzar tu compra</p>
                <a href="productos.html" class="btn btn-primary">Ver productos</a>
            </div>
        `;
        return;
    }
    
    let html = '<div class="row">';
    
    carrito.forEach(item => {
        const badgeOferta = item.oferta ? 
            `<span class="badge bg-danger ms-2">-${item.descuento}%</span>` : 
            '';
        
        const precioInfo = item.oferta && item.precioOriginal ? 
            `<p class="text-muted mb-0">
                <small>Precio original: <span class="text-decoration-line-through">$${item.precioOriginal.toLocaleString()}</span></small>
             </p>
             <p class="text-success mb-0 fw-bold">Precio con descuento: $${item.precio.toLocaleString()}</p>` :
            `<p class="text-muted mb-0">Precio: $${item.precio.toLocaleString()}</p>`;
        
        html += `
            <div class="col-12 mb-3">
                <div class="card">
                    <div class="row g-0">
                        <div class="col-md-2 position-relative">
                            <img src="${item.imagen}" class="img-fluid rounded-start" alt="${item.nombre}" style="height: 150px; object-fit: cover;">
                        </div>
                        <div class="col-md-10">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-4">
                                        <h5 class="card-title">${item.nombre}${badgeOferta}</h5>
                                        ${precioInfo}
                                        <p class="text-info mb-0"><small>Stock disponible: ${item.stock}</small></p>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="input-group">
                                            <button class="btn btn-outline-secondary" onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                                            <input type="number" class="form-control text-center" value="${item.cantidad}" min="1" max="${item.stock}" onchange="actualizarCantidad(${item.id}, parseInt(this.value))">
                                            <button class="btn btn-outline-secondary" onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1})" ${item.cantidad >= item.stock ? 'disabled' : ''}>+</button>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <p class="fw-bold text-success fs-5 mb-0">$${(item.precio * item.cantidad).toLocaleString()}</p>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-danger w-100" onclick="eliminarDelCarrito(${item.id})">
                                            <i class="bi bi-trash"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Agregar resumen del carrito
    const total = calcularTotal();
    html += `
        <div class="card mt-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h4>Total: <span class="text-success">$${total.toLocaleString()}</span></h4>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-outline-danger me-2" onclick="vaciarCarrito()">Vaciar carrito</button>
                        <button class="btn btn-success" onclick="finalizarCompra()">Finalizar compra</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Finalizar compra
function finalizarCompra() {
    const carrito = obtenerCarrito();
    
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const total = calcularTotal();
    
    // Aquí puedes agregar la lógica para procesar el pago
    alert(`Compra finalizada!\nTotal: $${total.toLocaleString()}\n\nGracias por tu compra!`);
    
    // Vaciar carrito después de la compra
    localStorage.removeItem('carrito');
    actualizarContadorCarrito();
    
    // Redirigir a la página principal
    window.location.href = 'index.html';
}

// Inicializar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    
    // Si estamos en la página del carrito, mostrar los productos
    if (document.getElementById('carrito-container')) {
        mostrarCarrito();
    }
});
