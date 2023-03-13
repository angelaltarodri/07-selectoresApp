import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaisSmall } from '../../interfaces/paises.interface';
import { PaisesService } from '../../services/paises.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styleUrls: ['./selector-page.component.sass']
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required],
  })

  // llenar selectores
  regiones: string[]    = [];
  paises: PaisSmall[]   = [];
  // fronteras: string[]   = [];
  fronteras: PaisSmall[]   = [];

  // UI
  cargando: boolean = false;
  noFronteras: boolean = false;

  constructor(
    private fb: FormBuilder,
    private paisesService: PaisesService,
  ) {}

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    // cuando cambie la region
    this.miFormulario.get('region')?.valueChanges
      .pipe(
        tap( () => {
          this.paises= [];
          this.miFormulario.get('pais')?.reset('')
          this.noFronteras = false;
          this.cargando=true;
        }),
        switchMap( region => region ? this.paisesService.getPaisesPorRegion(region) : of([])),
        catchError(error => {
          console.log('Ocurrió un error:', error);
          return of(null); // Devuelve un valor predeterminado para continuar con el flujo del observable
        }),
        delay(200),
        )
      .subscribe(paises => {
        if (paises) { this.paises = paises; }
        this.cargando=false;
      })

    // cuando cambie el país
    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        tap(
          (res) => {
            this.fronteras= [];
            this.miFormulario.get('frontera')?.reset('');
            this.noFronteras = false;
            this.cargando=true;
          }
        ),
        switchMap(codigo => this.paisesService.getPaisPorCodigo(codigo)),
        switchMap( pais => pais ? this.paisesService.getPaisesPorCodigo(pais[0].borders) : of([])),
        catchError(error => {
          console.log('Ocurrió un error:', error);
          return of(null); // Devuelve un valor predeterminado para continuar con el flujo del observable
        }),
        delay(200),
      )
      .subscribe(paises => {
        this.fronteras = paises!;
        this.cargando=false;
        if (paises!.length === 0 && this.miFormulario.controls["pais"].valid) {
          this.noFronteras = true;
        }
        console.log('FIN.')
      })
  }

  guardar() {
    console.log(this.miFormulario.value)
  }

}
