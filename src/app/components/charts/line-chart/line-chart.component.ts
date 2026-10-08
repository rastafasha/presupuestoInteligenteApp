import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Cliente } from 'src/app/models/cliente';

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.css'],
    standalone: false
})
export class LineChartComponent implements OnChanges {
  @Input() projects: Cliente[] = [];

  public chart: Chart;

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(()=>{
      // console.log('LineChartComponent ngOnChanges projects:', this.projects);
    if (changes['projects'] && this.projects && this.projects.length > 0) {
      this.createChart();
    }
    }, 2000)
  }

  createChart() {
    // console.log('LineChartComponent createChart projects:', this.projects);

    const labels = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];


    // Filter projects with status true
    // const activeProjects = this.projects.filter(project => project.status === true);

    // // Group projects by name and count occurrences per month (dummy example)
    // const grouped: { [key: string]: number[] } = {};

    // activeProjects.forEach(project => {
    //   const projectName = project.nombre || 'Unknown';
    //   if (!grouped[projectName]) {
    //     grouped[projectName] = new Array(12).fill(0);
    //   }
    //   const dataArray = grouped[projectName];
    //   // Use deliveryDate to get month index
    //   const createdAt = project.dateAprobado ? new Date(project.dateAprobado) : null;
    //   const monthIndex = createdAt ? createdAt.getMonth() : 0;
    //   dataArray[monthIndex] += 1; // Count projects per month
    // });

    // const datasets = Object.keys(grouped).map((projectName) => ({
    //   label: projectName,
    //   data: grouped[projectName],
    //   fill: false,
    //   borderColor: this.getRandomColor(),
    //   tension: 0.1,
    // }));

    // const data = {
    //   labels: labels,
    //   datasets: datasets,
    // };

    if (this.chart) {
      this.chart.destroy();
    }

    // this.chart = new Chart('lineChart', {
    //   type: 'line',
    //   data: data,
    //   options: {
    //     scales: {
    //       y: {
    //         beginAtZero: true,
    //       },
    //     },
    //   },
    // });
  }


    // Helper function to generate random color
    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
}
