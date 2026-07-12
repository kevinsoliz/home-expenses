import { Component } from '@angular/core';
import { Producto } from './producto';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule } from 'lucide-angular';
import { ItemListaCompra } from './item-lista-compra';

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

  listaCompra: ItemListaCompra[] = []
  agregarProducto(producto: Producto){
    let item: ItemListaCompra = { producto, cantidad: 1}
    
    this.listaCompra = [...this.listaCompra, item]
    this.productos = this.productos.filter(p => p.id !== producto.id)
  }
}
