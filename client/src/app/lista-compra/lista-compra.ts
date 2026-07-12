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
    let item: ItemListaCompra = { producto, cantidad: 1}

    this.listaCompra = [...this.listaCompra, item]
    this.productos.update(productos => productos.filter(p => p.id !== producto.id))
  }


  
}

