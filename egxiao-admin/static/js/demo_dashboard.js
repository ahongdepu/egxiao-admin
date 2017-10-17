$(function(){        
    /* reportrange */
    if($("#reportrange").length > 0){   
        $("#reportrange").daterangepicker({                    
            ranges: {
               'Today': [moment(), moment()],
               'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
               'Last 7 Days': [moment().subtract(6, 'days'), moment()],
               'Last 30 Days': [moment().subtract(29, 'days'), moment()],
               'This Month': [moment().startOf('month'), moment().endOf('month')],
               'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            opens: 'left',
            buttonClasses: ['btn btn-default'],
            applyClass: 'btn-small btn-primary',
            cancelClass: 'btn-small',
            format: 'MM.DD.YYYY',
            separator: ' to ',
            startDate: moment().subtract('days', 29),
            endDate: moment()            
          },function(start, end) {
              $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        });
        
        $("#reportrange span").html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
    }
    /* end reportrange */
    
    /* Rickshaw dashboard chart */
    var seriesData = [ [], [] ];
    var random = new Rickshaw.Fixtures.RandomData(1000);

    for(var i = 0; i < 100; i++) {
        random.addData(seriesData);
    }

    var rdc = new Rickshaw.Graph( {
            element: document.getElementById("dashboard-chart"),
            renderer: 'area',
            width: $("#dashboard-chart").width(),
            height: 250,
            series: [{color: "#33414E",data: seriesData[0],name: 'New'}, 
                     {color: "#3FBAE4",data: seriesData[1],name: 'Returned'}]
    } );

    rdc.render();

    var legend = new Rickshaw.Graph.Legend({graph: rdc, element: document.getElementById('dashboard-legend')});
    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({graph: rdc,legend: legend});
    var order = new Rickshaw.Graph.Behavior.Series.Order({graph: rdc,legend: legend});
    var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {graph: rdc,legend: legend} );        

    var rdc_resize = function() {                
            rdc.configure({
                    width: $("#dashboard-chart").width(),
                    height: $("#dashboard-chart").height()
            });
            rdc.render();
    }

    var hoverDetail = new Rickshaw.Graph.HoverDetail({graph: rdc});

    window.addEventListener('resize', rdc_resize);        

    rdc_resize();
    /* END Rickshaw dashboard chart */
    
    /* Donut dashboard chart */
    Morris.Donut({
        element: 'dashboard-donut-1',
        data: [
            {label: "自然来电", value: 2},
            {label: "转介绍", value: 5},
            {label: "渠道合作", value: 1},
            {label: "活动填单", value: 0},
            {label: "自然来访", value: 1},
            {label: "其他", value: 5}
        ],
        colors: ['#33414E', '#3FBAE4', '#FEA223','#ff3c00','#e1f724','#23d28a'],
        resize: true
    });
    /* END Donut dashboard chart */
    
    /* Bar dashboard chart */
    Morris.Bar({
        element: 'dashboard-bar-1',
        data: [
            { y: '十月 10', a: 75, b: 35 },
            { y: '十月 11', a: 64, b: 26 },
            { y: '十月 12', a: 78, b: 39 },
            { y: '十月 13', a: 82, b: 34 },
            { y: '十月 14', a: 86, b: 39 },
            { y: '十月 15', a: 94, b: 40 },
            { y: '十月 16', a: 96, b: 41 }
        ],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['消耗课时', '消耗天数'],
        barColors: ['#33414E', '#3FBAE4'],
        gridTextSize: '10px',
        hideHover: true,
        resize: true,
        gridLineColor: '#E5E5E5'
    });
    /* END Bar dashboard chart */
    
    /* Line dashboard chart */
    Morris.Line({
      element: 'dashboard-line-1',
      data: [
        { y: '2016-10-10', a: 109342,b: 35673},
        { y: '2016-10-11', a: 113650,b: 40654},
        { y: '2016-10-12', a: 117890,b: 44560},
        { y: '2016-10-13', a: 122030,b: 46778},
        { y: '2016-10-14', a: 128840,b: 51670},
        { y: '2016-10-15', a: 134560,b: 54680},
        { y: '2016-10-16', a: 145420,b: 63790}
      ],
      xkey: 'y',
      ykeys: ['a','b'],
      labels: ['已收学费','教学收入'],
      resize: true,
      hideHover: true,
      xLabels: 'day',
      gridTextSize: '10px',
      lineColors: ['#3FBAE4','#33414E'],
      gridLineColor: '#E5E5E5'
    });   
    /* EMD Line dashboard chart */
    
//  /* Vector Map */
//  var jvm_wm = new jvm.WorldMap({container: $('#dashboard-map-seles'),
//                                  map: 'world_mill_en', 
//                                  backgroundColor: '#FFFFFF',                                      
//                                  regionsSelectable: true,
//                                  regionStyle: {selected: {fill: '#B64645'},
//                                                  initial: {fill: '#33414E'}},
//                                  markerStyle: {initial: {fill: '#3FBAE4',
//                                                 stroke: '#3FBAE4'}},
//                                  markers: [{latLng: [50.27, 30.31], name: 'Kyiv - 1'},                                              
//                                            {latLng: [52.52, 13.40], name: 'Berlin - 2'},
//                                            {latLng: [48.85, 2.35], name: 'Paris - 1'},                                            
//                                            {latLng: [51.51, -0.13], name: 'London - 3'},                                                                                                      
//                                            {latLng: [40.71, -74.00], name: 'New York - 5'},
//                                            {latLng: [35.38, 139.69], name: 'Tokyo - 12'},
//                                            {latLng: [37.78, -122.41], name: 'San Francisco - 8'},
//                                            {latLng: [28.61, 77.20], name: 'New Delhi - 4'},
//                                            {latLng: [39.91, 116.39], name: 'Beijing - 3'}]
//                              });    
//  /* END Vector Map */

    
    $(".x-navigation-minimize").on("click",function(){
        setTimeout(function(){
            rdc_resize();
        },200);    
    });
    
    
});

