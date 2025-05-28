import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls:['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  private map: any;

  public sentimentType: string = 'RandomValue';
  public sentimentOptions: string[] = ['RandomValue', 'Second', 'Third', 'Fourth'];

  private sentimentMap: { [key: string]: number } = {};
  private sentimentRawData: any[] = [];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadCSVData(); 
  }

  private loadCSVData(): void {
    Papa.parse('/assets/data/geo_sentiments.csv', {
      download: true,
      header: true,
      complete: (result) => {
        this.sentimentRawData = result.data as any[];
        this.updateSentimentMap();
        this.initMap();
      }
    });
  }

  private updateSentimentMap(): void {
    this.sentimentMap = {};
    for (const row of this.sentimentRawData) {
      const region = row.Region?.trim();
      const value = row[this.sentimentType];
      if (region && value !== undefined && !isNaN(parseInt(value))) {
        this.sentimentMap[region] = parseInt(value);
      }
    }
  }

  public onSentimentTypeChange(): void {
    this.updateSentimentMap();
    this.initMap();
  }

  private getRegionSentimentBreakdown(region: string): string {
    const entry = this.sentimentRawData.find(r => r.Region?.trim() === region);
    if (!entry) return 'No data available.';
    let breakdown = '';
    for (const key of this.sentimentOptions) {
      if (entry[key] !== undefined && entry[key] !== '') {
        breakdown += `<div><strong>${key}:</strong> ${entry[key]}</div>`;
      }
    }
    return breakdown;
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [37.8, -96],
      zoom: 4
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'OpenStreetMap '
    }).addTo(this.map);

    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: (feature) => {
            const state = feature.properties.name;
            const value = this.sentimentMap[state] ?? -1;
            return {
              color: 'black',
              weight: 1,
              fillColor: this.colorBySentiment(value),
              fillOpacity: 0.6
            };
          },
          onEachFeature: (feature, layer) => {
            const state = feature.properties.name;
            const value = this.sentimentMap[state];
            let label = 'Not Added';
            if (value === 0) label = 'Negative';
            if (value === 1) label = 'Neutral';
            if (value === 2) label = 'Positive';

            layer.bindPopup(`${state} - ${label}`);
            layer.on('mouseover', function () { this.openPopup(); });
            layer.on('mouseout', function () { this.closePopup(); });
            layer.on('click', () => {
              const breakdown = this.getRegionSentimentBreakdown(state);
              layer.bindPopup(`<strong>${state}</strong><br>${breakdown}`).openPopup();
            });
          }
        }).addTo(this.map);
      });
  }

  private colorBySentiment(value: number): string {
    switch (value) {
      case 0: return 'red';
      case 1: return 'yellow';
      case 2: return 'green';
      default: return 'gray';
    }
  }
}
