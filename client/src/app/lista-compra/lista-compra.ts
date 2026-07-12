import { Component } from '@angular/core';
import { Producto } from './producto';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-lista-compra',
  templateUrl: 'lista-compra.html',
  imports: [HlmButtonImports, LucideAngularModule]
})
export class ListaCompra {
  productos: Producto[] = [
    { id: 1, nombre: 'Leche' },
    { id: 2, nombre: 'Pan' },
    { id: 3, nombre: 'Huevos' },
    { id: 4, nombre: 'Manzanas' },
    { id: 5, nombre: 'Arroz' },
  ];

  listaCompra: Producto[] = []
  agregarProducto(producto: Producto){
    this.listaCompra = [...this.listaCompra, producto]
    this.productos = this.productos.filter(p => p.id !== producto.id)
  }
}
