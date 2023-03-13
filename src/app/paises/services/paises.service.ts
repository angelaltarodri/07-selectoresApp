import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pais, PaisSmall } from '../interfaces/paises.interface';
import { combineLatest, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  private baseUrl: string = 'https://restcountries.com/v3.1'
  private _regiones: string[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  get regiones () : string [] {
    return [...this._regiones];
  }

  constructor(
    private http: HttpClient
  ) { }

  getPaisesPorRegion(region:string): Observable<PaisSmall[]> {
    const url = `${this.baseUrl}/region/${region}?fields=name`;
    return this.http.get<PaisSmall[]>(url);
  }

  getPaisPorCodigo (codigo:string): Observable<Pais[] | null> {

    if (!codigo) {
      return of(null)
    }

    const url = `${this.baseUrl}/alpha/${codigo}`
    return this.http.get<Pais[]>(url)
  }

  getPaisPorCodigoSmall (codigo:string): Observable<PaisSmall> {
    const url = `${this.baseUrl}/alpha/${codigo}?fields=name`
    return this.http.get<PaisSmall>(url)
  }

  getPaisesPorCodigo(borders: string[]) : Observable<PaisSmall[]> {
    if (!borders) {
      return of([]);
    }
    // un arreglo de observables
    const peticiones: Observable<PaisSmall>[] = []

    borders.forEach(codigo => {
      const peticion = this.getPaisPorCodigoSmall(codigo);
      peticiones.push(peticion);
    })

    return combineLatest(peticiones);

  }

}
