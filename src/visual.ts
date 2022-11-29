/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { VisualFormattingSettingsModel } from "./settings";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import Plotly from 'plotly.js-dist'

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

// Table objects
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewTable = powerbi.DataViewTable;
import DataViewTableRow = powerbi.DataViewTableRow;
import PrimitiveValue = powerbi.PrimitiveValue;

// Object selectors
import ISelectionManager = powerbi.extensibility.ISelectionManager; 
import ISelectionId = powerbi.visuals.ISelectionId; 
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

// Visual object class
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private textNode: Text;

    // Settings
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private host: IVisualHost;
    private selectionManager: ISelectionManager;

    // Constructor - Runs once when loaded
    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);1

        // Selector manager
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();

        // Debugging card
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.updateCount = 0;
        if (document) {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Debugging:"));
            const new_em: HTMLElement = document.createElement("em");
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);
        }
    }

    // Update method - Runs every time the chart changes
    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);

        //Increment debug counter
        //console.log('Visual update', options);
        if (this.textNode) {
            this.textNode.textContent = (this.updateCount++).toString();
        }

        // Extract data from table format
        const tableDataView: DataViewTable = options.dataViews[0].table;
        const data_y = []; const data_x = []; const data_t = []; const data_c = [];
        tableDataView.rows.forEach((row: DataViewTableRow) => {
            data_y.push(row[0]); 
            data_x.push(row[1]); 
            data_t.push(row[2]); 
            switch(true){
                case row[0] >= 1 && row[1] >= 1:
                    data_c.push(this.formattingSettings.dataPointCard.upperRight.value.value);
                    break;
                case row[0] <= 1 && row[1] >= 1:
                    data_c.push(this.formattingSettings.dataPointCard.lowerRight.value.value);
                    break;
                case row[0] >= 1 && row[1] <= 1:
                    data_c.push(this.formattingSettings.dataPointCard.upperLeft.value.value);
                    break;
                case row[0] <= 1 && row[1] <= 1:
                    data_c.push(this.formattingSettings.dataPointCard.lowerLeft.value.value);
                    break;
                default:
                    data_c.push("#ff0000");
            }
        });

        // Log element indices for cross-filtering
        let records = tableDataView.rows;
        const map2 = data_t.map(function(element, index){
            let selectionId: ISelectionId = this.host.createSelectionIdBuilder()
                .withCategory(records, index)
                .createSelectionId();
            return [index, element, selectionId]
        }, this) //add index of value
        console.log(map2);

        //Plotly chart
        var gd = document.querySelector("div");
        var data = [{
        y: data_y,
        x: data_x,
        mode: 'lines+markers',
        type: 'scatter',
        text: data_t,
        marker: {
            size: 10, 
            color: data_c,
            opacity: 1,
            line: {
                color: '#000000',
                width: 1
              }
        },
        line: {
            shape: "spline",
            color: "#888888",
            width: 1
        },
        hovertemplate: '<b>%{text}</b>' + 
        '<br><i>Actual</i>: %{y:.0%}' +
        '<br><i>Effort</i>: %{x:.0%}' +
        '<extra></extra>',
        }];

        var layout = {
        clickmode: 'event+select',
        dragmode: 'select',
        margin: {
            l: 50,
            r: 25,
            b: 50,
            t: 25,
            pad: 4
        },
        xaxis:{
            text: 'Effort',
            zeroline:false, 
            tickformat: ".0%", 
            tickvals: [1]
        },
        yaxis:{
            text: 'Actual',
            zeroline:false, 
            tickformat: ".0%", 
            tickvals: [1]
        },
        //title:'Quadrant chart: Plan attainment vs. lead indicators',
        annotations: [
            {
              x: 1.5, y: 1.5,
              xref: 'x', yref: 'y',
              text: this.formattingSettings.quadrantCard.upperRightText.value,
              showarrow: false,
              font: {
                family: 'Courier New, monospace',
                size: this.formattingSettings.quadrantCard.fontSize.value,
                color: '#070707'
              },
            },
            {
                x: 0.5, y: 1.5,
                xref: 'x', yref: 'y',
                text: this.formattingSettings.quadrantCard.upperLeftText.value,
                showarrow: false,
                font: {
                    family: 'Courier New, monospace',
                    size: this.formattingSettings.quadrantCard.fontSize.value,
                    color: '#070707'
                  },
              },
              {
                x: 1.5, y: 0.5,
                xref: 'x', yref: 'y',
                text: this.formattingSettings.quadrantCard.lowerLeftText.value,
                showarrow: false,
                font: {
                    family: 'Courier New, monospace',
                    size: this.formattingSettings.quadrantCard.fontSize.value,
                    color: '#070707'
                  },
              },
              {
                x: 0.5, y: 0.5,
                xref: 'x', yref: 'y',
                text: this.formattingSettings.quadrantCard.lowerRightText.value,
                showarrow: false,
                font: {
                    family: 'Courier New, monospace',
                    size: this.formattingSettings.quadrantCard.fontSize.value,
                    color: '#707070'
                  },
              }
          ]
        };
        Plotly.newPlot(gd, data, layout);

        // Event handling
        //$('div').on('plotly_selected', function(eventData){
        //    console.log('Selected!');
        //    console.log('Event Data:',eventData);
        //    console.log('JQuery attributes:',$(eventData.target).attr);
        //    console.log('JQuery value:',$(eventData.target).val());
        //    console.log('getElementById selectedpoints', document.getElementById('w.Event'))
        //    console.log('querySelectorAll selectedpoints', document.querySelectorAll('w.Event'))
        //    var d = document.querySelectorAll("g.cartesianlayer > g > g.plot > g > g > g.points > path");
        //    for(var i=0; i < d.length; i++){
        //        console.log(d[i]);
        //    };
        //});

        // #sandbox-host > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g > g.points > path:nth-child(1)
        // #sandbox-host > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g > g.points > path:nth-child(2)
        // #sandbox-host > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g > g.points > path:nth-child(9)

        // 148 items from:
        // g.cartesianlayer > g > g.plot > g > g > g.points > path
        // Create selector object
        //var d = document.querySelectorAll("g.cartesianlayer > g > g.plot > g > g > g.points > path");
        //console.log('Begin!')
        //for (let i = 0; i < d.length; i++){
        //    //d[i].setAttribute("style","pointer-events: all;"); //Add CSS element to change cursor to pointer
        //    d[i].attributes[0].ownerElement["sid"] = map2[i][2];
        //    d[i].addEventListener('plotly_click', function emit(event){ //Listener event for clicking object
        //        this.selectionManager.select(this.attributes[0].ownerElement["sid"]);
        //        console.log(this.attributes[0].ownerElement['sid'])
        //    })
            //console.log(d[i].attributes)
        //}

        // Add formatting settings
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);

        

    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}