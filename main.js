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

        var typelist = [];
        var citylist = [];

        for(var i in result){
          typelist.push(result[i].type);
        }
        for(var i in result){
          citylist.push(result[i].to_name);
        }

        var allrides = typelist.length;

        typelistsorted =new Set(typelist)
        citylistsorted =new Set(citylist)

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
        
        
        sortedtypelistwithcounter = typelistwithcounter.sort(function(a,b) { return b[0] - a[0]; });
        sortedcitylistwithcounter = citylistwithcounter.sort(function(a,b) { return b[0] - a[0]; });
        
        function roundToTwo(num) {
          return +(Math.round(num + "e+2")  + "e-2");
        }

        var Klassifizierung = [];

        

        var FVFilter = ["ICE","IC","FLX","EC","ECE"];
        var NVFilter = ["RB","HLB","S","RE","VIA","RT","TL","FEX","ME","WFB","TLX"];
        var BusFilter = ["Bus"];

        var Fernverkehr = 0;
        for (type of FVFilter){

          
          for (currentitem of result){          
            if(currentitem.type == type){
              Fernverkehr++;
            }
          }

        }
        Klassifizierung.push(["Fernverkehr",Fernverkehr]);

        var Nahverkehr = 0;
        for (type of NVFilter){

          
          
          for (currentitem of result){          
            if(currentitem.type == type){
              Nahverkehr++;
            }
          }

        }
        Klassifizierung.push(["Nahverkehr",Nahverkehr]);

        var Bus = 0;
        for (type of BusFilter){

          
          for (currentitem of result){          
            if(currentitem.type == type){
              Bus++;
            }
          }

        }
        Klassifizierung.push(["Bus",Bus]);

        console.log(Klassifizierung);

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
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {

          var datatype = new google.visualization.DataTable();
          datatype.addColumn('string', 'word');
          datatype.addColumn('number', 'count');
          for (item of sortedtypelistwithcounter){
            datatype.addRow([item[1] , item[0]]);
          }

          var optionstype = {
            title:'Zugarten'
          };
          
          var charttype = new google.visualization.PieChart(document.getElementById('TypeChart'));
          charttype.draw(datatype, optionstype);


          var datacity = new google.visualization.DataTable();
          datacity.addColumn('string', 'word');
          datacity.addColumn('number', 'count');
          for (item of sortedcitylistwithcounter){
            datacity.addRow([item[1] , item[0]]);
          }

          var optionscity = {
            title:'Städte'
          };
          
          var chartcity = new google.visualization.PieChart(document.getElementById('CityChart'));
          chartcity.draw(datacity, optionscity);
          
          var datacomparison = new google.visualization.DataTable();
          datacomparison.addColumn('string', 'word');
          datacomparison.addColumn('number', 'Anzahl Fahrten');
          for (item of Klassifizierung){
            datacomparison.addRow([item[0] , item[1]]);
          }

          var optionsccomparison = {
            title:'Zugklasse'
          };
          
          var chart = new google.visualization.BarChart(document.getElementById('myChart'));
          chart.draw(datacomparison, optionsccomparison);

          
        }
      };

      fr.readAsText(files.item(0));
    };
};
