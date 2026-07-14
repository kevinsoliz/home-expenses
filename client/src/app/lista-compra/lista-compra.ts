import { Component, inject, OnInit, signal } from '@angular/core';
import { Producto } from './producto';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule } from 'lucide-angular';
import { ItemListaCompra } from './item-lista-compra';
import { ProductosService } from './productos.service';

@Component({
  selector: 'app-lista-compra',
  templateUrl: 'lista-compra.html',
  imports: [HlmButtonImports, LucideAngularModule]
})
export class ListaCompra implements OnInit {
  ngOnInit(): void {
    this.productosService.getProductos().subscribe(productos => this.productos.set(productos))
  }

  productos = signal<Producto[]>([]);

  private productosService = inject(ProductosService);

  listaCompra: ItemListaCompra[] = []
  agregarProducto(producto: Producto){
    const existente = this.listaCompra.find(i => i.producto.id === producto.id)
    if (existente) {
      existente.cantidad++
      this.listaCompra = [existente, ...this.listaCompra.filter(i => i !== existente)]
    } else {
      this.listaCompra = [{ producto, cantidad: 1 }, ...this.listaCompra]
    }
  }

  quitarProducto(item: ItemListaCompra){
    item.cantidad--
    this.listaCompra = item.cantidad <= 0
      ? this.listaCompra.filter(i => i.producto.id !== item.producto.id)
      : [...this.listaCompra]
  }

  muestraInput = signal(false);

  agregarNuevoProducto(nombre: string) {
    this.productosService.crearProducto(nombre).subscribe(producto => {
      this.productos.update(productos => [...productos, producto])
      this.muestraInput.set(false)
    })
  }


  
}

