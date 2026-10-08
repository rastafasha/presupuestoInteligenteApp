import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.css'],
    standalone: false
})
export class BarChartComponent implements OnInit {
  public chart: Chart;
  monthlyData: any[] = [];
  selectedYear: number;
  selectedMonth: number = 1; // Default Enero (1-based)
  years: number[] = [];
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  isLoading = false;

  // Crea una variable para el reporte
  reportData: any = null;

  constructor(
    // private paymentService: PaymentService
  ) {
    this.selectedYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.generateYears();
    // this.loadData();
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let year = currentYear - 4; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  // loadData(): void {
  //   this.isLoading = true;
  //   this.paymentService.getMontlyReport(this.selectedMonth, this.selectedYear).subscribe({
  //     next: (resp: any) => {
  //       // Si el backend responde que no hay pagos, reportData debe ser null
  //       if (resp.ok && resp.report && resp.report.cantidadPagos > 0) {
  //         this.reportData = resp.report;
  //       } else {
  //         this.reportData = null;
  //       }

  //       this.createChart(); // Se llama siempre para destruir el viejo o pintar el nuevo
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       this.reportData = null;
  //       this.isLoading = false;
  //     }
  //   });
  // }

  onYearChange(year: number): void {
    this.selectedYear = year;
    // this.loadData();
  }

  onMonthChange(month: number): void {
    this.selectedMonth = month;
    // this.loadData();
  }

  private createChart(): void {
    // 1. Limpiar gráfico previo si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // 2. Si no hay datos, no hacemos nada
    if (!this.reportData || this.reportData.cantidadPagos === 0) {
      return;
    }

    // 3. Esperar a que Angular termine de renderizar el HTML
    setTimeout(() => {
      const el = document.getElementById('barChart') as HTMLCanvasElement;

      if (!el) {
        console.error("No se encontró el canvas 'barChart'");
        return;
      }

      this.chart = new Chart(el, {
        type: 'bar',
        data: {
          labels: ['Vendedores', 'Admins', 'CEOs', 'Total General'],
          datasets: [{
            label: 'Montos Acumulados (€)',
            data: [
              Number(this.reportData.totalVendedores) || 0,
              Number(this.reportData.totalAdmins) || 0,
              Number(this.reportData.totalCEOs) || 0,
              Number(this.reportData.granTotal) || 0
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Importante para que llene el contenedor
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }, 100); // 100ms es suficiente para que el DOM esté listo
  }
}
