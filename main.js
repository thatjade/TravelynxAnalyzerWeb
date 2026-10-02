window.onload = function() {
    document.getElementById('import').onclick = function() {

        var files = document.getElementById('customFile').files;

        document.getElementById('import').disabled = true;

        if (files.length <= 0) {
            alert("Fehlerhafte Datei/Eingabe");
            document.getElementById('import').disabled = false;
        }

        var fr = new FileReader();

        fr.onload = function(e) {
            console.log(e);

            //Parse JSON into result variable
            var result = JSON.parse(e.target.result);

            //List of Train Types (e.g. ICE)
            var typelist = [];
            //List of Places (e.g. Frankfurt (Main) Flughafen Fernbahnhof)
            var citylist = [];

            var datelist = [];

            var hourlist = [];
            //List of operators (e.g. DB Fernverkehr AG)
            var operatorlist = [];

            //Fill the List of Train Types
            for (var i in result) {
                typelist.push(result[i].type);
            }

            //Fill the List of Places
            for (var i in result) {
                citylist.push(result[i].to_name);
            }

            for (var i in result) {
                datelist.push(new Date(result[i].sched_dep_ts * 1000));
            }

            for (var i in datelist) {
                hourlist.push(datelist[i].getHours());
            }

            //Fill the list of operators
            for (var i in result) {
                if (result[i].user_data) {
                    var userData = result[i].user_data;

                    // DBRIS & HAFAS Backends
                    if (Array.isArray(userData.operators)) {
                        operatorlist.push(...userData.operators);
                    }
                    // EFA & MOTIS Backends
                    else if (typeof userData.operator === 'string') {
                        operatorlist.push(userData.operator);
                    }
                }
            }

            //Variable that counts all rides
            var allrides = typelist.length;

            //Make a List with removed Duplicates (e.g. ["ICE"],["ICE"],["RE"],["ICE"],["RE"] > ["ICE"],["RE"])
            typelistsorted = new Set(typelist)
            citylistsorted = new Set(citylist)
            hourlistsorted = new Set(hourlist)
            operatorlistsorted = new Set(operatorlist)

            //Create a List of Traintypes with a counter of its occurances
            var typelistwithcounter = [];

            for (type of typelistsorted) {

                var typecounter = 0;

                for (currentitem of result) {
                    if (currentitem.type == type) {
                        typecounter++;
                    }
                }
                typelistwithcounter.push([typecounter, type]);

            }

            var hourlistwithcounter = [];

            for (hour of hourlistsorted) {

                var hourcounter = 0;

                for (currentitem of hourlist) {
                    if (currentitem == hour) {
                        hourcounter++;
                    }
                }
                hourlistwithcounter.push([hour, hourcounter]);

            }

            console.log(hourlistwithcounter);

            //Create a Places of Traintypes with a counter of its occurances
            var citylistwithcounter = [];

            for (city of citylistsorted) {

                var citycounter = 0;

                for (currentitem of result) {
                    if (currentitem.to_name == city) {
                        citycounter++;
                    }
                }
                citylistwithcounter.push([citycounter, city]);
            }

            //Create a List of Trainoperators with a counter of its occurances
            var operatorlistwithcounter = [];

            for (let operator of operatorlistsorted) {
                let operatorcounter = 0;

                for (let currentitem of result) {
                    if (currentitem.user_data) {
                        const userData = currentitem.user_data;

                        // DBRIS & HAFAS Backends
                        if (
                            Array.isArray(userData.operators) &&
                            userData.operators.includes(operator)
                        ) {
                            operatorcounter++;
                        }
                        // EFA & MOTIS Backends
                        else if (
                            typeof userData.operator === 'string' &&
                            userData.operator === operator
                        ) {
                            operatorcounter++;
                        }
                    }
                }
                operatorlistwithcounter.push([operatorcounter, operator]);
            }

            //Create Sorted List that sorts the list descending by the counter
            sortedhourlistwithcounter = hourlistwithcounter.sort(function(a, b) {
                return a[0] - b[0];
            });
            sortedtypelistwithcounter = typelistwithcounter.sort(function(a, b) {
                return b[0] - a[0];
            });
            sortedcitylistwithcounter = citylistwithcounter.sort(function(a, b) {
                return b[0] - a[0];
            });
            sortedoperatorlistwithcounter = operatorlistwithcounter.sort(function(a, b) {
                return b[0] - a[0];
            });


            //function to round number to 2 decimals
            function roundToTwo(num) {
                return +(Math.round(num + "e+2") + "e-2");
            }

            //Create List for Verkehrsklassifizierung
            var Klassifizierung = [];

            //Filters for Classification
            var FVFilter = [ "D", "ECB", "EC", "EC ", "ECD", "ECE", "EIC", "EIP", "EN", "ES", "EST", "EUR", "FLX", "FR", "GV", "HIGHSPEED_RAIL", "IC", "ICD", "ICE", "ICE ", "ICN", "LE", "LONG_DISTANCE", "NIGHT_RAIL", "NJ", "NZ", "OGV", "RJ", "RJX", "TGV", "THA", "UEX", "UEX", "WB" ];
            var NVFilter = [ "ABR", "ag", "AKN", "ALX", "ARV", "AVG", "BRB", "CAN", "CB", "CJX", "DWE", "EB", "ENO", "ERB", "erx", "EVB", "FEX", "HLB", "IR", "IR ", "IRE", "MDS", "ME", "MEX", "MRB", "NBE", "NWB", "NX", "OE", "OPB", "Os", "R", "R-Bahn", "RB", "RB ", "RE", "REGIONAL_FAST_RAIL", "REGIONAL_RAIL", "Regionalzug", "REX", "RRB", "RS", "RT", "RTB", "S", "SBB", "SBH", "SCB", "SCF", "SMD", "STN", "STx", "SWE", "TER", "TL", "TLX", "TRI", "VBG", "VIA", "vlx", "WBA", "WFB" ];
            var BusFilter = [ "BSV", "BUS", "Bus", "Buslinie", "ExpressBus", "Landbus", "MetroBus", "NachtBus", "Niederflurbus", "Omnibus", "PlusBus", "RegionalBus", "Regionalbus", "RegioBus", "RVV-Bus-Linie", "SB", "StadtBus", "Stadtbus" ];
            var STRFilter = [ "NachtTram", "Niederflurstrab", "RNV", "STB", "Stadtbahn", "Strb", "STR", "Straßenbahn", "Stb", "TRAM", "Tram", "Trm" ];
            var UFilter = [ "M", "METRO", "Metro", "SUBWAY", "U", "U-Bahn", "UBAHN" ];
            var FerryFilter = [ "FERRY", "Fäh", "Fähre", "KAT", "SCH", "Schiff" ];

            //Adding the Fernverkehr Counter to the List
            var Fernverkehr = 0;
            for (type of FVFilter) {
                for (currentitem of result) {
                    if (currentitem.type == type) {
                        Fernverkehr++;
                    }
                }

            }
            Klassifizierung.push(["Fernverkehr", Fernverkehr]);

            //Adding the Nahverkehr Counter to the List
            var Nahverkehr = 0;
            for (type of NVFilter) {
                for (currentitem of result) {
                    if (currentitem.type == type) {
                        Nahverkehr++;
                    }
                }

            }
            Klassifizierung.push(["Nahverkehr", Nahverkehr]);

            //Adding the Bus-SEV Counter to the List
            var Bus = 0;
            for (type of BusFilter) {


                for (currentitem of result) {
                    if (currentitem.type == type) {
                        Bus++;
                    }
                }

            }
            Klassifizierung.push(["Bus", Bus]);

            var Str = 0;
            for (type of STRFilter) {


                for (currentitem of result) {
                    if (currentitem.type == type) {
                        Str++;
                    }
                }

            }
            Klassifizierung.push(["Straßenbahn", Str]);

            //Adding the U-Bahn Counter to the List
            var UBahn = 0;
            for (type of UFilter) {
                for (currentitem of result) {
                    if (currentitem.type == type) {
                        UBahn++;
                    }
                }
            }
            Klassifizierung.push(["U-Bahn", UBahn]);

            //Adding the Ferry Counter to the List
            var Ferry = 0;
            for (type of FerryFilter) {
                for (currentitem of result) {
                    if (currentitem.type == type) {
                        Ferry++;
                    }
                }
            }
            Klassifizierung.push(["Fähre", Ferry]);

            //Create the table for the Train Types
            for (item of sortedtypelistwithcounter) {

                var table = document.getElementById("traintypetable");

                var cell = document.createElement("td");
                var celltext = document.createTextNode(item[1]);
                cell.appendChild(celltext);

                var countercell = document.createElement("td");
                var countercelltext = document.createTextNode(item[0]);
                countercell.appendChild(countercelltext);

                var percentagecell = document.createElement("td");
                var percentagecelltext = document.createTextNode(roundToTwo((100 * item[0]) / allrides) + "%");
                percentagecell.appendChild(percentagecelltext);

                var row = document.createElement("tr");
                row.appendChild(cell);
                row.appendChild(countercell);
                row.appendChild(percentagecell);

                table.appendChild(row);
            }

            //Create the Table for the Places
            for (item of sortedcitylistwithcounter) {

                var table = document.getElementById("citytable");

                var cell = document.createElement("td");
                var celltext = document.createTextNode(item[1]);
                cell.appendChild(celltext);

                var countercell = document.createElement("td");
                var countercelltext = document.createTextNode(item[0]);
                countercell.appendChild(countercelltext);

                var percentagecell = document.createElement("td");
                var percentagecelltext = document.createTextNode(roundToTwo((100 * item[0]) / allrides) + "%");
                percentagecell.appendChild(percentagecelltext);

                var row = document.createElement("tr");
                row.appendChild(cell);
                row.appendChild(countercell);
                row.appendChild(percentagecell);

                table.appendChild(row);
            }

            //Create a table for the operators
            for (item of sortedoperatorlistwithcounter) {
                var table = document.getElementById("operatortable");

                var cell = document.createElement("td");
                var celltext = document.createTextNode(item[1]);
                cell.appendChild(celltext);

                var countercell = document.createElement("td");
                var countercelltext = document.createTextNode(item[0]);
                countercell.appendChild(countercelltext);

                var percentagecell = document.createElement("td");
                var percentagecelltext = document.createTextNode(roundToTwo((100 * item[0]) / allrides) + "%");
                percentagecell.appendChild(percentagecelltext);

                var row = document.createElement("tr");
                row.appendChild(cell);
                row.appendChild(countercell);
                row.appendChild(percentagecell);

                table.appendChild(row);
            }

            //Load google charts script
            google.charts.load('current', {
                'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {

                //Data for Zugarten Pie Chart
                var datatype = new google.visualization.DataTable();
                datatype.addColumn('string', 'word');
                datatype.addColumn('number', 'count');
                for (item of sortedtypelistwithcounter) {
                    datatype.addRow([item[1], item[0]]);
                }

                //Options for Zugarten Pie Chart
                var optionstype = {
                    title: 'Zugarten',
                    chartArea: {
                        left: "5%",
                        width: "70%"
                    }
                };

                //Creation of Zugarten Pie Chart
                var charttype = new google.visualization.PieChart(document.getElementById('TypeChart'));
                charttype.draw(datatype, optionstype);

                //Data for City Pie Chart
                var datacity = new google.visualization.DataTable();
                datacity.addColumn('string', 'word');
                datacity.addColumn('number', 'count');
                for (item of sortedcitylistwithcounter) {
                    datacity.addRow([item[1], item[0]]);
                }

                //Options for City Pie Chart
                var optionscity = {
                    title: 'Städte',
                    chartArea: {
                        left: "5%",
                        width: "80%"
                    }
                };

                //creation of city pie chart
                var chartcity = new google.visualization.PieChart(document.getElementById('CityChart'));
                chartcity.draw(datacity, optionscity);

                //Data for Operator Pie Chart
                var dataoperator = new google.visualization.DataTable();
                dataoperator.addColumn('string', 'word');
                dataoperator.addColumn('number', 'count');
                for (item of sortedoperatorlistwithcounter) {
                    dataoperator.addRow([item[1], item[0]]);
                }

                //Options for City Pie Chart
                var optionsoperator = {
                    title: 'Betreiber',
                    chartArea: {
                        left: "5%",
                        width: "80%"
                    }
                };

                //creation of city pie chart
                var chartoperator = new google.visualization.PieChart(document.getElementById('OperatorChart'));
                chartoperator.draw(dataoperator, optionsoperator);

                //data for klassifizierungs chart
                var datacomparison = new google.visualization.DataTable();
                datacomparison.addColumn('string', 'word');
                datacomparison.addColumn('number', 'Anzahl Fahrten');
                datacomparison.addColumn({
                    role: 'style'
                });

                console.log(Klassifizierung);

                for (item of Klassifizierung) {
                    if (item[0] == "Fernverkehr") {
                        datacomparison.addRow([item[0], item[1], 'purple']);
                    } else if (item[0] == "Nahverkehr") {
                        datacomparison.addRow([item[0], item[1], '#C1121C']);
                    } else {
                        datacomparison.addRow([item[0], item[1], '#ffbf00']);
                    }
                }

                //options for klassifizierungschart
                var optionsccomparison = {
                    title: 'Fahrten in Zugklasse',
                    legend: {
                        position: "none"
                    },
                    width: 1000
                };

                //creation of klassifizierungschart
                var chart = new google.visualization.BarChart(document.getElementById('classesChart'));
                chart.draw(datacomparison, optionsccomparison);


                var stundendata = new google.visualization.DataTable();
                stundendata.addColumn('string', 'Stunde');
                stundendata.addColumn('number', 'Anzahl Fahrten');
                stundendata.addColumn({
                    role: 'style'
                });

                console.log(sortedhourlistwithcounter);

                for (item of sortedhourlistwithcounter) {
                    stundendata.addRow([item[0] + " Uhr", item[1], 'pink']);
                }

                //stundendata.sort(function(a,b) { return a[0] - b[0]; });
                var histogramoptions = {
                    title: 'Fahrten pro Tagesstunde',
                    legend: {
                        position: "none"
                    }
                };

                var visualization = new google.visualization.ColumnChart(document.getElementById('histogram'));
                visualization.draw(stundendata, histogramoptions);
            }
        };

        fr.readAsText(files.item(0));
    };

};
