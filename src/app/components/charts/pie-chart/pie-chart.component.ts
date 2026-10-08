import { Component } from '@angular/core';
import { single } from './data';
// import { GraficoService } from 'src/app/services/grafico.service';
@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.scss'],
    standalone: false
})
export class PieChartComponent {
  //  single: any[];
  view: [number,number] = [700, 400];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(
    // private graficoService: GraficoService
  ) {
    // Object.assign(this, { single });
  }

  // get single(){
  //   return this.graficoService.getgraficoData();
  // }

  // onRandomData(){
  //   this.graficoService.randomData();
  // }

  // onSelect(data:any): void {
  //   console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  // }

  // onActivate(data:any): void {
  //   console.log('Activate', JSON.parse(JSON.stringify(data)));
  // }

  // onDeactivate(data:any): void {
  //   console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  // }
}
