// Función para cargar productos destacados en el carrusel
async function cargarProductosDestacados() {
    try {
        const response = await fetch('productos.json');
        const productos = await response.json();
        
        // Seleccionar los primeros 3 productos para el carrusel
        const productosDestacados = productos.slice(0, 3);
        
        // Generar los indicadores del carrusel
        const indicadores = document.querySelector('.carousel-indicators');
        indicadores.innerHTML = '';
        
        productosDestacados.forEach((producto, index) => {
            const indicador = document.createElement('button');
            indicador.type = 'button';
            indicador.setAttribute('data-bs-target', '#carouselExampleDark');
            indicador.setAttribute('data-bs-slide-to', index);
            indicador.setAttribute('aria-label', `Slide ${index + 1}`);
            
            if (index === 0) {
                indicador.classList.add('active');
                indicador.setAttribute('aria-current', 'true');
            }
            
            indicadores.appendChild(indicador);
        });
        
        // Generar los items del carrusel
        const carouselInner = document.querySelector('.carousel-inner');
        carouselInner.innerHTML = '';
        
        productosDestacados.forEach((producto, index) => {
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            
            if (index === 0) {
                item.classList.add('active');
            }
            
            item.setAttribute('data-bs-interval', '5000');
            
            // Calcular precio con descuento si está en oferta
            const precioOriginal = producto.precio;
            const precioConDescuento = producto.oferta ? 
                Math.round(precioOriginal * (1 - producto.descuento / 100)) : 
                precioOriginal;
            
            const badgeOferta = producto.oferta ? 
                `<span class="badge bg-danger fs-6 mb-2">¡OFERTA! -${producto.descuento}%</span>` : 
                '';
            
            const precioHTML = producto.oferta ? 
                `<p class="mb-1"><span class="text-decoration-line-through text-light">$${precioOriginal.toLocaleString()}</span></p>
                 <p class="fw-bold text-warning fs-3 mb-2">$${precioConDescuento.toLocaleString()}</p>` :
                `<p class="fw-bold text-warning fs-3 mb-2">$${precioOriginal.toLocaleString()}</p>`;
            
            item.innerHTML = `
                <img src="${producto.imagen}" class="d-block w-100" alt="${producto.nombre}" style="height: 500px; object-fit: cover;">
                <div class="carousel-caption d-none d-md-block bg-opacity-75 p-3 rounded descripcionProductoDestacado">
                    ${badgeOferta}
                    <h5>${producto.nombre}</h5>
                    <p>${producto.descripcion}</p>
                    ${precioHTML}
                    <button class="btn btn-primary btn-lg" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
                </div>
            `;
            
            carouselInner.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
    }
}

// Función para cargar productos en oferta
async function cargarProductosEnOferta() {
    try {
        const response = await fetch('productos.json');
        const productos = await response.json();
        
        // Filtrar solo productos en oferta y tomar los primeros 4
        const productosEnOferta = productos.filter(p => p.oferta).slice(0, 4);
        
        const container = document.getElementById('ofertas-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        productosEnOferta.forEach(producto => {
            const precioOriginal = producto.precio;
            const precioConDescuento = Math.round(precioOriginal * (1 - producto.descuento / 100));
            
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100 position-relative shadow-sm">
                    <span class="position-absolute top-0 end-0 badge bg-danger m-2 fs-6">-${producto.descuento}%</span>
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text flex-grow-1 small">${producto.descripcion}</p>
                        <div class="mb-2">
                            <p class="mb-0"><small class="text-muted text-decoration-line-through">$${precioOriginal.toLocaleString()}</small></p>
                            <p class="fw-bold text-success fs-4 mb-0">$${precioConDescuento.toLocaleString()}</p>
                        </div>
                        <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${producto.id})">
                            <i class="bi bi-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error al cargar productos en oferta:', error);
    }
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDestacados();
    cargarProductosEnOferta();
});
