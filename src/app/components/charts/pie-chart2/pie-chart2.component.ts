import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-pie-chart2',
    templateUrl: './pie-chart2.component.html',
    styleUrls: ['./pie-chart2.component.css'],
    standalone: false
})
export class PieChart2Component implements OnChanges {
  public chart: Chart;
  isLoading:boolean = false;
  @Input() projects: any[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projects'] && this.projects) {
      this.updateChart();
    }
  }

  

  updateChart() {
    const paidCount = this.projects.filter(p => p.notificado === true).length;
    const debtCount = this.projects.filter(p => p.notificado === false).length;
    const data = {
      labels: ['Con Presentación', 'Sin Presentación'],
      datasets: [
        {
          label: 'Comportamiento',
          data: [paidCount, debtCount],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)', // greenish for paid
            'rgba(255, 99, 132, 0.6)'  // reddish for debt
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    

    if (this.chart) {
      this.chart.data = data;
      this.chart.update();
    } else {
      this.chart = new Chart('pieChart', {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Comportamiento'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
    
  }
}
