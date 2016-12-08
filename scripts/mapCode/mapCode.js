
     
      //global variables
      var data;
var chartTitle;
var barColors = new Array;
var justSearched;
var blClearGraphics;
var csvRows = [];
var chartSubTitle;
var vAxisLabel = "Traffic Count (Average Daily Total)"; //initialize
var blChartDrawn;
//begin basic google charts code

google.load("visualization", "1", { packages: ["corechart"] });
//google.setOnLoadCallback(drawChart);

function drawChart() {

    var datatable;
    var options = {
        title: chartTitle,
        //chartArea: {width:'85%',height:'80%'},
        fontName: 'Open Sans',
        legend: { position: 'none' },
        colors: barColors,
        hAxis: {
            title: 'Year',
            showTextEvery: 1,
            titleTextStyle: { italic: 'false', bold: 'true' }

        },
        vAxis: {
            title: vAxisLabel, //this gets shortened when the screen size is small
            titleTextStyle: { italic: 'false', bold: 'true' },
            slantedText: 'true'
        }
    };


	document.getElementById('dl-csv').style.display = 'block';//ASDF
	document.getElementById('visualization_div').style.display = 'block';//ASDF
    var chart = new google.visualization.ColumnChart(document.getElementById('visualization_div'));
    datatable = google.visualization.arrayToDataTable(data);
    chart.draw(datatable, options);
}
//below is the 'material' chart' configuration.  It's in Beta and it totally broke the app when they apparaently tweaked the code
//benefits of the material chart are the ability to rotate the x axis labels for viewing on small screens and better popup windows.  
//if we find the current problem with the material charts, we should reenable the matrial charts and block the rest
/*
//google.load("visualization", "1.1", { packages: ["bar"] });
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
    // the uses google's new "material charts"  More info: https://developers.google.com/chart/interactive/docs/gallery/barchart#Material
    // the old chart configuration is available in N:\MPCprojects\Transportation\TrafficCounts\JavaScriptMap\JSMapAndCharts\BackUp\20150902
    var datatable;
    var options = {
        title: chartTitle,
        subtitle: chartSubTitle,
        fontName: 'Open Sans',
        legend: { position: 'none' },
        colors: barColors,
        hAxis: {
            title: 'Year',
            showTextEvery: 1,
            titleTextStyle: { italic: 'false', bold: 'true' },
            slantedText: 'true'

        },
        vAxis: {
            title: vAxisLabel,
            titleTextStyle: { italic: 'false', bold: 'true' },
            format: 'decimal'
        },
        bars: 'vertical'
    };

    var chart = new google.charts.Bar(document.getElementById('visualization_div'));
    datatable = google.visualization.arrayToDataTable(data);
    //chart.draw(datatable, google.charts.Bar.convertOptions(options));
    chart.draw(datatable, options);
}
*/

    //this starts the ERSI JS Code.  It's based on https://developers.arcgis.com/javascript/jssamples/popup_sidepanel.html, but is heavily modified
    require([
        "dojo/ready",
        "dojo/on",
        "dojo/_base/connect",
        "dojo/dom",
        "dijit/registry",
        "dojo/dom-construct",
        "dojo/parser",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane", "dijit/TitlePane",
        "esri/map",
        "esri/arcgis/utils",
        "esri/domUtils",
        "esri/dijit/Popup", "esri/dijit/BasemapGallery", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/renderers/SimpleRenderer",
        "esri/Color", "esri/symbols/Symbol", "esri/symbols/SimpleMarkerSymbol", "esri/renderers/UniqueValueRenderer", "esri/layers/LabelLayer",
        "esri/symbols/TextSymbol", "esri/symbols/SimpleLineSymbol", "esri/dijit/Search", "esri/symbols/PictureMarkerSymbol", "esri/tasks/locator",
        "esri/dijit/HomeButton", "esri/geometry/Extent"
    ], function (
        ready,
        on,
        connect,
        dom,
        registry,
        domConstruct,
        parser,
        BorderContainer,
        ContentPane, TitlePane,
        Map,
        arcgisUtils,
        domUtils,
        Popup, BasemapGallery, FeatureLayer, InfoTemplate, SimpleRenderer,
        Color, Symbol, SimpleMarkerSymbol, UniqueValueRenderer, LabelLayer,
        TextSymbol, SimpleLineSymbol, Search, PictureMarkerSymbol, Locator,
        HomeButton, Extent
    ) {
        ready(function () {
            parser.parse();
            var map = new Map("map", {
                basemap: "gray",
                center: [-83.942, 35.9728],
                zoom: 9
            });


            //initialize the search box
            var s = new Search({
                map: map,
                zoomScale: 24000
            }, "search");

            //this sets the functionality of the search box
            //see https://geonet.esri.com/message/549810?et=watches.email.thread
            var defaultSource = s.defaultSource;
            defaultSource.countryCode = "US";
            //limits to area where there are count stations
            defaultSource.searchExtent = new Extent({
                xmin: -9433102.5652,
                ymin: 4232556.948,
                xmax: -9233957.949,
                ymax: 4356720.4646,
                spatialReference: {
                    wkid: 102100
                }
            });
            defaultSource.highlightSymbol = new PictureMarkerSymbol('https://cdn0.iconfinder.com/data/icons/20-flat-icons/128/location-pointer.png', 26, 33).setOffset(0, 15)
            s.startup();


            //set up the unique values renderer and the symbology for the traffic count points
            var tpoSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_DIAMOND).setSize("12").setColor(new Color([2, 148, 1, 1]));
            var tdotSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_DIAMOND).setSize("12").setColor(new Color([57, 103, 168, 1]));
            var renderer = new UniqueValueRenderer(tpoSymbol, "AGENCY");
            renderer.addValue("2", tpoSymbol);
            renderer.addValue("3", tdotSymbol);

            var template = new InfoTemplate();
            template.setTitle("<b>${STATIONID}</b>");

            //add the counts layer to the map
            var featureLayer = new FeatureLayer("http://services2.arcgis.com/Gypl21NmiWS1cM7h/arcgis/rest/services/TrafficCounts/FeatureServer/0", {
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: template,
                outFields: ["*"]
            });
            featureLayer.setOpacity(0.5);
            featureLayer.setSelectionSymbol(selSymbol); //attempt to set the selection symbol
            featureLayer.setRenderer(renderer); //set the renderer defined above

            //set up the county outlines
            //var countiesUrl = "https://services2.arcgis.com/Gypl21NmiWS1cM7h/arcgis/rest/services/Population_Indicators/FeatureServer/0";
            var countiesUrl = "http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties/FeatureServer/0"; //this is hosted by ESRI
            var countyOutlines = new FeatureLayer(countiesUrl, {
                "id": "countyOutlines",
                "mode": FeatureLayer.MODE_ONDEMAND,
                "outFields": ["NAME"]//,
                //"minScale": app.layerChangeThreshold,
            });
            countyOutlines.setDefinitionExpression("STATE_NAME = 'Tennessee' AND NAME IN ('Anderson', 'Blount', 'Cocke', 'Grainger', 'Hamblen','Knox', 'Loudon', 'Roane', 'Sevier', 'Roane', 'Union')");
            //var outline = new esri.symbol.SimpleLineSymbol().setColor(dojo.Color(255, 255, 255, 1)).setWidth(3);
            var outline = new SimpleLineSymbol(
                         SimpleLineSymbol.STYLE_SOLID,
                         new Color([100, 100, 100]),
                         2
                );
            var sym = new esri.symbol.SimpleFillSymbol()
                  .setOutline(outline)
                  .setColor(dojo.Color(0, 0, 0, 0));
            var outlineRenderer = new esri.renderer.SimpleRenderer(sym);
            countyOutlines.setRenderer(outlineRenderer);
            countyOutlines.disableMouseEvents();

            //add county labels
            // create a text symbol to define the style of labels
            var cntyLabel = new TextSymbol().setColor([255, 255, 255]);
            cntyLabel.font.setSize("15pt");
            cntyLabel.font.setFamily("Oswald");

            cntyLabelRenderer = new SimpleRenderer(cntyLabel);
            var labels = new LabelLayer({ id: "labels", maxScale: 1000000 });
            // tell the label layer to label the countries feature layer 
            var labelField = "NAME";
            labels.addFeatureLayer(countyOutlines, cntyLabelRenderer, "{" + labelField + "}");
            //add the label layer to the map in the next block

     

            //make the traffic count labels, partially based off of https://developers.arcgis.com/javascript/jshelp/tutorial_label_layer.html        
            var countLabels = new LabelLayer({ id: "countLabels" });

            var tpoLabel = new TextSymbol().setColor(new Color([2, 148, 1, 1]));
            tpoLabel.font.setSize("10pt");
            tpoLabel.font.setFamily("Oswald");

            var tdotLabel = new TextSymbol().setColor(new Color([57, 103, 168, 1]));
            tdotLabel.font.setSize("10pt");
            tdotLabel.font.setFamily("Oswald");

            var colorLabelRenderer = new UniqueValueRenderer(tpoLabel, "AGENCY");
            colorLabelRenderer.addValue("2", tpoLabel)
            colorLabelRenderer.addValue("3", tdotLabel);

            countLabels.setMinScale(75000);
           
            var labelField = "SMALL_SCALE_LABEL"
            countLabels.addFeatureLayer(featureLayer, colorLabelRenderer, "{" + labelField + "}");
            map.addLayer(countLabels);
            map.addLayer(featureLayer);
            map.addLayer(countyOutlines);

            map.addLayer(labels);

            //the traffic count points are set at opacity = 0.5 (50% ) when the map opens to make the county labels more visible
            //remove the opacity setting as user zooms in 
            map.on("zoom-end", ScaleChanged);
            function ScaleChanged() {

                var curScale = map.getScale();
                console.log(curScale);
                console.log(featureLayer.opacity);
                if (curScale < 1000000) {
                    featureLayer.setOpacity(1);
                } else {
                    featureLayer.setOpacity(0.5);
                }

            }
            
            //this block of code clears the graphic that's placed on the map when the search results are found 
            s.on("search-results", SearchResults); //trap the event that's called when search results are 
            function SearchResults() {
                justSearched = true;
                setTimeout(UpdateJustSearched, 2000) //delay setting justSearched to false by 2 seconds
            }
            
            function UpdateJustSearched(){
                justSearched = false;
            }
            map.on("extent-change", ExtentChanged); //fired whenever the map moves
            function ExtentChanged() {
                if (!justSearched) { //if justSearched is falsae
                    map.graphics.clear(); //clear the graphics
                } 
            }

         

            // selection symbol when a station is clicked.  
            var selSymbol = new SimpleMarkerSymbol(
              SimpleMarkerSymbol.STYLE_CIRCLE,
              18,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([0, 255, 255, 1]),
                2
              ),
              new Color([207, 34, 171, 0]) //this makes it hollow fill
            );
  

            initializeSidebar(map);

            //set up the basemap switcher ("gallery")
            var basemapGallery = new esri.dijit.BasemapGallery({
                showArcGISBasemaps: true,
                map: map
            }, "basemapGallery");
            basemapGallery.startup();
            dojo.connect(basemapGallery, "onError", function (msg) { console.log(msg); });



            function initializeSidebar(map) {
                map.infoWindow.set("popupWindow", false);
                var popup = map.infoWindow;
                popup.markerSymbol = selSymbol;
                //when the selection changes update the chart to display the popup info for the 
                //currently selected feature. 
                connect.connect(popup, "onSelectionChange", function () {
                    displayPopupContent(popup.getSelectedFeature());
                });

            }

            function displayPopupContent(feature) {
                //there's no popup, but this function gets the data for the station that was clicked and then generates the 
                //JS array that gets sent to the charts and csv file
                if (feature) {


                    if (feature.attributes["score"] > -1) {

                        map.setLevel(16);
                        return;
                    } else {
                        blChartDrawn = true;
                    }
                    csvRows = []; //empty the array
                    csvRows.push(["Primary Street", feature.attributes["PRIMARY_STREET"]]);
                    csvRows.push(["Cross Street", feature.attributes["CROSS_STREET"]]);
                    var tempArr = new Array;
                    tempArr.push("Year");
                    tempArr.push("Traffic Count");

                    data = []; //Reset this array that holds the traffic counts to be sent to Google chart.  
                    data.push(tempArr);

                    // EDIT THIS FOR LOOP CODE WHEN IT'S TIME TO ADD ANOTHER YEAR OF TRAFFIC COUNTS (e.g., add 2016 data). 
                    // i is the minimum year to display, c is the max year to display. 
                    //get the field values              
                    for (var i = 2001, c = 2015; i <= c; i++) {  
                        var thisYear = "Y" + i;
                        var thisArray = new Array;
                        thisArray.push(i.toString()); //this forces the h-axis of the chart to be strings and therefore "discrete", needed for good labels
                        if (feature.attributes[thisYear] !== undefined) {
                            thisArray.push(feature.attributes[thisYear]);
                        } else {
                            thisArray.push(undefined);
                        }
                        data.push(thisArray);
                        csvRows.push(thisArray);
                    }

                    //build the chart title (e.g., "Chapman Hwy - S of Moody Ave")
                    if ((feature.attributes["PRIMARY_STREET"] !== null) & (feature.attributes["CROSS_STREET"] !== null)) {
                        chartTitle = feature.attributes["PRIMARY_STREET"] + " - " + feature.attributes["CROSS_STREET"]
                    } else if ((feature.attributes["PRIMARY_STREET"] == null) & (feature.attributes["CROSS_STREET"] !== null)) {
                        chartTitle = feature.attributes["CROSS_STREET"];
                    } else {
                        chartTitle = feature.attributes["PRIMARY_STREET"];
                    }


                    //set the color of the bars in the chart
                    //also list the data source
                    barColors = [];
                    if (feature.attributes["AGENCY"] == 2) {
                        barColors.push('#029401');
                        chartSubTitle = "Data Source: TPO";
                    } else {
                        barColors.push('#3967A8');
                        chartSubTitle = "Data Source: TDOT";
                    }
                    drawChart(); // draw/refresh the chart
                }
            }
        });
    });

    function downloadCSV() { //generates the csv file for download


        //code from http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        var csvFile = csvRows.join("\n");
        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, chartTitle.trim() + ".csv"); //this is necessary to work in IE
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", chartTitle.trim() + ".csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
