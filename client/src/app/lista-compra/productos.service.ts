import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from './producto';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  // TODO: mover a environment/variable cuando se despliegue.
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getProductos() {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }
}
