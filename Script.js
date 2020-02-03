function Init(){
    Qva.LoadCSS("/QvAJAXZfc/QvsViewClient.aspx?public=only&name=Extensions/HorizontalBarChart/css/materialize.min.css");
    Qva.LoadScript("/QvAJAXZfc/QvsViewClient.aspx?public=only&name=Extensions/HorizontalBarChart/js/d3.v4.js", EnterPoint);
}

function EnterPoint(){
    function prepareData(hypercube){
        dataBarchart = {};
        hypercube.map(function(val){
            dataBarchart["success"]=val[1].data*100;
            dataBarchart["unsuccess"]=(1-val[1].data)*100;
        });
        return dataBarchart;
    }
    function drawBarchart(objId,heightIn,widthIn,data,colors,textLabel,textColor){
        var initStackedBarChart = {
            draw: function(config) {
                me = this,
                domEle = config.element,
                stackKey = config.key,
                data = config.data,
                margin = {top: 0, right: 20, bottom: 100, left: 20},
                parseDate = d3.timeParse("%m/%Y"),
                width = widthIn - margin.left - margin.right,
                height = heightIn - margin.top - margin.bottom,
                xScale = d3.scaleLinear().rangeRound([0, width]),
                yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
                color = d3.scaleOrdinal().domain(data).range(colors),
                xAxis = d3.axisBottom(xScale),
                yAxis =  d3.axisLeft(yScale).tickFormat(d3.timeFormat("%b")),
                svgBare = d3.select("#"+domEle).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);
            

                d3.select("#horizontalbarchart_label_"+objId).append("h4").style("color",textColor).text(textLabel);
                d3.select("#horizontalbarchart_value_"+objId).append("h4").style("color",textColor).text(Math.round(data[0]["success"])+"%");

                var stack = d3.stack()
                    .keys(stackKey)
                    .offset(d3.stackOffsetNone);
            
                var layers= stack(data);
                    data.sort(function(a, b) { return b.total - a.total; });
                    yScale.domain(data.map(function(d) { return parseDate(d.date); }));
                    xScale.domain([0, 100]);
        
        
                var iterator = 0;
        
                var defs = svgBare.append("defs").selectAll()
                      .data(layers).enter();
                defs.selectAll()
                      .data(function(d) {return d; })
                    .enter().append("clipPath").attr("id", function(d){if(d[0]==0){return "round-corner-left";}else{return "round-corner-right"}})
                    .append("rect")
                      .attr("y", function(d) { return yScale(parseDate(d.data)); })
                      .attr("x", function(d) {if(d[0]==0){return xScale(d[0]);}else{return xScale(d[0])-10;}  })
                      .attr("height", yScale.bandwidth())
                      .attr("width", function(d) { if(d[0]==0){return xScale(d[1]) - xScale(d[0])+10;}else{return xScale(d[1]) - xScale(d[0])+10;}  }).attr("rx",5).attr("ry",5);
                    
                var	svg = svgBare
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
                var layer = svg.selectAll(".layer")
                    .data(layers)
                    .enter().append("g")
                    .attr("class", "layer")
                    .style("fill", function(d, i) { return color(i); });
        
                  layer.selectAll()
                      .data(function(d) {return d; })
                    .enter().append("rect")
                      .attr("y", function(d) { return yScale(parseDate(d.data)); })
                      .attr("x", function(d) { return xScale(d[0]); })
                      .attr("height", yScale.bandwidth())
                      .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) })
                    .attr("class", function(d) { if(d[0]==0){ return "first";}else{return "second";} });
        
                    d3.select(".second").attr("clip-path","url(#round-corner-right)");
                    d3.select(".first").attr("clip-path","url(#round-corner-left)");
                
                
            }
        }
        var key = ["success","unsuccess"];
        initStackedBarChart.draw({
            data: [data],
            key: key,
            element: 'horizontalbarchart_'+objId
        });
    }
    Qv.AddExtension("HorizontalBarChart",
    function(){
        var objId = this.Layout.ObjectId.replace('\\','__');
        this.Element.innerHTML = "<div class='row'><div id='horizontalbarchart_label_"+objId+"' class='col s10'></div><div id='horizontalbarchart_value_"+objId+"' class='col s2'></div></div><div class='row'><div id='horizontalbarchart_"+objId+"'></div></div>";
        var height = this.Layout.Super.GetHeight();
        var width = this.Layout.Super.GetWidth();
        var textLabel = this.Layout.Text0.text;
        var colorsForGraph = this.Layout.Text1.text.split(';');
        var textColor = this.Layout.Text2.text;
        
        
        var data = prepareData(this.Data.Rows);  
        drawBarchart(objId,height,width,data,colorsForGraph,textLabel,textColor);
    });
}

Init();