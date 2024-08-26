window.onload = function(){ 
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

        //Fill the List of Train Types
        for(var i in result){
          typelist.push(result[i].type);
        }

        //Fill the List of Places
        for(var i in result){
          citylist.push(result[i].to_name);
        }



        for(var i in result){
          datelist.push(new Date(result[i].sched_dep_ts * 1000));
        }


        for(var i in datelist){
          hourlist.push(datelist[i].getHours());
        }


        //Variable that counts all rides
        var allrides = typelist.length;

        //Make a List with removed Duplicates (e.g. ["ICE"],["ICE"],["RE"],["ICE"],["RE"] > ["ICE"],["RE"])
        typelistsorted =new Set(typelist)
        citylistsorted =new Set(citylist)
        hourlistsorted =new Set(hourlist)

        //Create a List of Traintypes with a counter of its occurances
        var typelistwithcounter = [];

        for (type of typelistsorted){

          var typecounter = 0;

          for (currentitem of result){
            if(currentitem.type == type){
              typecounter++;
            }
          }
          typelistwithcounter.push([typecounter,type]);

        }

        var hourlistwithcounter = [];

        for (hour of hourlistsorted){

          var hourcounter = 0;

          for (currentitem of hourlist){
            if(currentitem == hour){
              hourcounter++;
            }
          }
          hourlistwithcounter.push([hour,hourcounter]);

        }

        console.log(hourlistwithcounter);

        //Create a Places of Traintypes with a counter of its occurances
        var citylistwithcounter = [];

        for (city of citylistsorted){

          var citycounter = 0;

          for (currentitem of result){
            if(currentitem.to_name == city){
              citycounter++;
            }
          }
          citylistwithcounter.push([citycounter,city]);
        }

        //Create Sorted List that sorts the list descending by the counter
        sortedhourlistwithcounter = hourlistwithcounter.sort(function(a,b) { return a[0] - b[0]; })
        sortedtypelistwithcounter = typelistwithcounter.sort(function(a,b) { return b[0] - a[0]; });
        sortedcitylistwithcounter = citylistwithcounter.sort(function(a,b) { return b[0] - a[0]; });


        //function to round number to 2 decimals 
        function roundToTwo(num) {
          return +(Math.round(num + "e+2")  + "e-2");
        }

        //Create List for Verkehrsklassifizierung
        var Klassifizierung = [];

        //Filters for Classification
        var FVFilter = ["ICE","IC","FLX","EC","ECE","THA","RJ","RJX","WB","NJ","D","TGV","UEX","R","EST","FR","ICN","EN","ICD","EIC"];
        var NVFilter = ["RB","HLB","S","RE","VIA","RT","TL","FEX","ME","WFB","TLX","Os","OPB","ERX","NBE","NWB","AKN","TRI","EB","EVB","STx","ENO","DWE","ARV","FEX"];
        var BusFilter = ["Bus"];
        var STRFilter = ["STR"];
        var UFilter = ["U-Bahn", "U"];

        //Adding the Fernverkehr Counter to the List
        var Fernverkehr = 0;
        for (type of FVFilter){
          for (currentitem of result){
            if(currentitem.type == type){
              Fernverkehr++;
            }
          }

        }
        Klassifizierung.push(["Fernverkehr",Fernverkehr]);

        //Adding the Nahverkehr Counter to the List
        var Nahverkehr = 0;
        for (type of NVFilter){
          for (currentitem of result){
            if(currentitem.type == type){
              Nahverkehr++;
            }
          }

        }
        Klassifizierung.push(["Nahverkehr",Nahverkehr]);

        //Adding the Bus-SEV Counter to the List
        var Bus = 0;
        for (type of BusFilter){


          for (currentitem of result){
            if(currentitem.type == type){
              Bus++;
            }
          }

        }
        Klassifizierung.push(["Bus",Bus]);

        var Str = 0;
        for (type of STRFilter){


          for (currentitem of result){
            if(currentitem.type == type){
              Str++;
            }
          }

        }
        Klassifizierung.push(["Straßenbahn",Str]);

        //Adding the U-Bahn Counter to the List
        var UBahn = 0;
        for (type of UFilter){
          for (currentitem of result){
            if(currentitem.type == type){
              UBahn++;
            }
          }

        }
        Klassifizierung.push(["U-Bahn",UBahn]);

        //Create the table for the Train Types
        for (item of sortedtypelistwithcounter){

          var table = document.getElementById("traintypetable");

          var cell = document.createElement("td");
          var celltext = document.createTextNode(item[1]);
          cell.appendChild(celltext);

          var countercell = document.createElement("td");
          var countercelltext = document.createTextNode(item[0]);
          countercell.appendChild(countercelltext);

          var percentagecell = document.createElement("td");
          var percentagecelltext = document.createTextNode(roundToTwo((100*item[0])/allrides)+"%");
          percentagecell.appendChild(percentagecelltext);

          var row = document.createElement("tr");
          row.appendChild(cell);
          row.appendChild(countercell);
          row.appendChild(percentagecell);

          table.appendChild(row);

        }

        //Create the Table for the Places
        for (item of sortedcitylistwithcounter){

          var table = document.getElementById("citytable");
        
          var cell = document.createElement("td");
          var celltext = document.createTextNode(item[1]);
          cell.appendChild(celltext);
        
          var countercell = document.createElement("td");
          var countercelltext = document.createTextNode(item[0]);
          countercell.appendChild(countercelltext);

          var percentagecell = document.createElement("td");
          var percentagecelltext = document.createTextNode(roundToTwo((100*item[0])/allrides)+"%");
          percentagecell.appendChild(percentagecelltext);

          var row = document.createElement("tr");
          row.appendChild(cell);
          row.appendChild(countercell);
          row.appendChild(percentagecell);

          table.appendChild(row);

        }

        //Load google charts script
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {

          //Data for Zugarten Pie Chart
          var datatype = new google.visualization.DataTable();
          datatype.addColumn('string', 'word');
          datatype.addColumn('number', 'count');
          for (item of sortedtypelistwithcounter){
            datatype.addRow([item[1] , item[0]]);
          }

          //Options for Zugarten Pie Chart
          var optionstype = {
            title:'Zugarten',
            chartArea: {left:"5%", width:"70%"}
          };

          //Creation of Zugarten Pie Chart
          var charttype = new google.visualization.PieChart(document.getElementById('TypeChart'));
          charttype.draw(datatype, optionstype);

          //Data for City Pie Chart
          var datacity = new google.visualization.DataTable();
          datacity.addColumn('string', 'word');
          datacity.addColumn('number', 'count');
          for (item of sortedcitylistwithcounter){
            datacity.addRow([item[1] , item[0]]);
          }

          //Options for City Pie Chart
          var optionscity = {
            title:'Städte',
            chartArea: {left:"5%", width:"80%"}
          };

          //creation of city pie chart
          var chartcity = new google.visualization.PieChart(document.getElementById('CityChart'));
          chartcity.draw(datacity, optionscity);

          //data for klassifizierungs chart
          var datacomparison = new google.visualization.DataTable();
          datacomparison.addColumn('string', 'word');
          datacomparison.addColumn('number', 'Anzahl Fahrten');
          datacomparison.addColumn({ role: 'style' });

          console.log(Klassifizierung);

          for (item of Klassifizierung){
            if(item[0] == "Fernverkehr"){
              datacomparison.addRow([item[0] , item[1],'purple']);
            }
            else if (item[0] == "Nahverkehr"){
              datacomparison.addRow([item[0] , item[1],'#C1121C']);
            }
            else{
              datacomparison.addRow([item[0] , item[1],'#ffbf00']);
            }
          }

          //options for klassifizierungschart
          var optionsccomparison = {
            title:'Fahrten in Zugklasse',
            legend: { position: "none" },
            width: 1000
          };

          //creation of klassifizierungschart
          var chart = new google.visualization.BarChart(document.getElementById('myChart'));
          chart.draw(datacomparison, optionsccomparison);


          var stundendata = new google.visualization.DataTable();
          stundendata.addColumn('string', 'Stunde');
          stundendata.addColumn('number', 'Anzahl Fahrten');
          stundendata.addColumn({ role: 'style' });

          console.log(sortedhourlistwithcounter);

          for (item of sortedhourlistwithcounter){
            stundendata.addRow([item[0]+ " Uhr" , item[1],'pink']);
          }

          //stundendata.sort(function(a,b) { return a[0] - b[0]; });
          var histogramoptions = {
            title:'Fahrten pro Tagesstunde',
            legend: { position: "none" }
          };

          var visualization = new google.visualization.ColumnChart(document.getElementById('histogram'));
          visualization.draw(stundendata, histogramoptions);

        }
      };

      fr.readAsText(files.item(0));
    };
};
