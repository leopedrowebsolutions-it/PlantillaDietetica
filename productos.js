let todosLosProductos = [];

// Función para cargar productos desde JSON
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        todosLosProductos = await response.json();
        mostrarProductos(todosLosProductos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        document.getElementById('productos-container').innerHTML = 
            '<div class="col-12"><div class="alert alert-danger">Error al cargar los productos</div></div>';
    }
}

// Función para mostrar productos en el DOM
function mostrarProductos(productos) {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    
    if (productos.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">No se encontraron productos</div></div>';
        return;
    }
    
    productos.forEach(producto => {
        // Calcular precio con descuento si está en oferta
        const precioOriginal = producto.precio;
        const precioConDescuento = producto.oferta ? 
            Math.round(precioOriginal * (1 - producto.descuento / 100)) : 
            precioOriginal;
        
        const badgeOferta = producto.oferta ? 
            `<span class="position-absolute top-0 end-0 badge bg-danger m-2">-${producto.descuento}%</span>` : 
            '';
        
        const precioHTML = producto.oferta ? 
            `<p class="mb-1"><span class="text-decoration-line-through text-muted">$${precioOriginal.toLocaleString()}</span></p>
             <p class="fw-bold text-success fs-5 mb-2">$${precioConDescuento.toLocaleString()}</p>` :
            `<p class="fw-bold text-success fs-5 mb-2">$${precioOriginal.toLocaleString()}</p>`;
        
        const productoHTML = `
            <div class="col">
                <div class="card h-100 position-relative">
                    ${badgeOferta}
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text flex-grow-1">${producto.descripcion}</p>
                        ${precioHTML}
                        <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productoHTML;
    });
}

// Función para filtrar productos
function filtrarProductos() {
    const busqueda = document.getElementById('buscar').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    
    let productosFiltrados = todosLosProductos;
    
    // Filtrar por categoría
    if (categoria !== 'todos') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
    }
    
    // Filtrar por búsqueda de texto
    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(busqueda) || 
            p.descripcion.toLowerCase().includes(busqueda)
        );
    }
    
    mostrarProductos(productosFiltrados);
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    
    // Agregar event listeners a los filtros
    document.getElementById('buscar').addEventListener('input', filtrarProductos);
    document.getElementById('filtro-categoria').addEventListener('change', filtrarProductos);
});
