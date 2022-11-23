/*
 *  Power BI Visualizations
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

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {
    upperLeft = new formattingSettings.ColorPicker({
        name: "upperLeft",
        displayName: "Upper Left",
        value: {value: "#2d7274"}
    });
    upperRight = new formattingSettings.ColorPicker({
        name: "upperRight",
        displayName: "Upper Right",
        value: {value: "#3cb575"}
    });
    lowerRight = new formattingSettings.ColorPicker({
        name: "lowerRight",
        displayName: "Lower Right",
        value: {value: "#96bcd6"}
    });
    lowerLeft = new formattingSettings.ColorPicker({
        name: "lowerLeft",
        displayName: "Lower Left",
        value: {value: "#af5343"}
    });

    name: string = "dataPoint";
    displayName: string = "Data colors";
    slices: Array<FormattingSettingsSlice> = [this.upperLeft, this.upperRight, this.lowerLeft, this.lowerRight];
}

class QuadrantCardSettings extends FormattingSettingsCard {

    upperLeftText = new formattingSettings.TextInput({
        name: "upperLeftText",
        displayName: "Upper Left",
        value: "Lucky",
        placeholder: "Lucky"
    });
    upperRightText = new formattingSettings.TextInput({
        name: "upperRightText",
        displayName: "Upper Right",
        value: "Earned",
        placeholder: "Earned"
    });
    lowerLeftText = new formattingSettings.TextInput({
        name: "lowerLeftText",
        displayName: "Lower Left",
        value: "Deserved",
        placeholder: "Deserved"
    });
    lowerRightText = new formattingSettings.TextInput({
        name: "lowerRightText",
        displayName: "Lower Right",
        value: "Patient",
        placeholder: "Patient"
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 20
    });

    name: string = "quadrants";
    displayName: string = "Quadrants";
    slices: Array<FormattingSettingsSlice> = [this.upperLeftText, this.upperRightText, this.lowerLeftText, this.lowerRightText, this.fontSize];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    dataPointCard = new DataPointCardSettings();
    quadrantCard = new QuadrantCardSettings();

    cards = [this.dataPointCard, this.quadrantCard];
}
