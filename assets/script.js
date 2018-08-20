const formatNum = num=>{
    const n = String(num),
          p = n.indexOf('.')
    return n.replace(
        /\d(?=(?:\d{3})+(?:\.|$))/g,
        (m, i) => p < 0 || i < p ? `${m},` : m
    )
}
//---------



var width = 600,
	height = 300,
	margin = 50;



var chart = d3.select('.chart')
			.attr('viewBox','0 0 '+(width+margin*2)+' '+(height+margin*2))
			.append('g')
			.attr('transform','translate('+margin+','+margin+')')
			.attr('font-family','arial');


//Title
chart.append('text')
	.attr('class','title')
	.text('Monthly visitor arrivals in New Zealand, June 2008–18')
	.attr('text-anchor','middle')
	.attr('x',width/2);


d3.csv('assets/nz_trips.csv',function(d){
	var parseDate = d3.timeParse('%Y-%m-%d');

	return {
		date: parseDate(d.DateTime),
		actual: parseFloat(d.Actual),
		seasonAdjust: parseFloat(d.Seasonally_adjusted),

	}
},function(error,data){

	console.log(data);
	var minMaxDate = d3.extent(data,function(d){return d.date});
	var minMaxPrice = d3.extent(data,function(d){return d.actual});

	var xScale = d3.scaleTime()
					.domain(minMaxDate)
					.range([0,width]);

	var yScale = d3.scaleLinear()
					.domain(minMaxPrice)
					.range([height,0]);

	var lineGen = d3.line()
					.x(d=> xScale(d.date))
					.y(d=> yScale(d.actual))
					//.y(d=> yScale(d.seasonAdjust));

	var adjustedLineGen = d3.line()
					.x(d=> xScale(d.date))
					// .y(d=> yScale(d.actual))
					.y(d=> yScale(d.seasonAdjust));


//Gridlines
	  var gridlinesX = d3.axisTop()
	                    .tickFormat("")
	                    .tickSize(-height)
	                    .scale(xScale);

	  chart.append("g")
	     .attr("class", "grid")
	     .call(gridlinesX);



	  var gridlinesY = d3.axisLeft()
	                    .tickFormat("")
	                    .tickSize(-width)
	                    .scale(yScale);

	  chart.append("g")
	     .attr("class", "grid")
	     .call(gridlinesY);



//Linegen
	chart.append('path')
		.datum(data)
		.attr('d',lineGen)
		.attr('class','line')
		.attr('id','blue-line')
		.attr('fill','none')
		.attr('stroke-width',2)
		.attr('stroke','royalblue');

	var path = chart.append('path')
		.datum(data)
		.attr('d',adjustedLineGen)
		.attr('class','line')
		.attr('id','seasonal-line')
		.attr('fill','none')
		.attr('stroke-width',2)
		.attr('stroke','orange')

	var xAxisGen = d3.axisBottom(xScale).ticks(10);
	var yAxisGen = d3.axisLeft(yScale).ticks(7);

	chart.append('g')
		.attr('transform','translate(0,'+height+')')
		.call(xAxisGen)

	chart.append('g')
		.call(yAxisGen)

	
//Toggle Seasonalality
	var seasonalActive = true;

	chart.append('text')
		.attr('class','toggle-seasonal')
	 	.attr("x", 0)             
     	.attr("y", height+40)  
		.text('Toggle Seasonally Adjusted')
		.on('click',function(){
			var newOpacity = seasonalActive ? 0 : 1;
			seasonalActive = !seasonalActive;
			d3.select('#seasonal-line').transition()
										.duration(500)
										.attr('opacity',newOpacity)
		})	

//Tooltips
	var tooltip1 = chart.append('g')
						.attr('opacity',0)
			   		 	.attr('class', 'tooltip1')	
	var tooltip1Rec = tooltip1.append('rect')
			   		 	.attr('pointer-events','none')
			   		 	.attr('width',100)
						.attr('height',30)
			   		 	.attr('rx',10)
						.attr('fill','rgba(230,230,230,0.8')
						.attr('stroke','royalblue')
						.attr('stroke-width','2')		
	var tooltipText1 = tooltip1.append('text')
						.attr('class', 'tooltip1-text')	
						.attr('x',50)
						.attr('y',15)
						.attr('text-anchor','middle')	
						.attr('alignment-baseline','middle')
						.attr('fill','black')
						.attr('font-size','11px')
						.attr('font-family','arial')
	var tttline1 = tooltipText1.append('tspan');
	var tttline2 = tooltipText1.append('tspan')
								.attr('dy',8)
								.attr('x',50);

	

	var tooltip2 = chart.append('g')
						.attr('opacity',0)
						.attr('class', 'tooltip2')
	var tooltip2Rec = tooltip2.append('rect')
			   		 	.attr('pointer-events','none')
			   		 	.attr('width',100)
						.attr('height',30)
			   		 	.attr('rx',10)
						.attr('fill','rgba(230,230,230,0.8')
						.attr('stroke','orange')
						.attr('stroke-width','2')			
	var tooltipText2 = tooltip2.append('text')
						.attr('class', 'tooltip2-text')
						.attr('x',50)
						.attr('y',15)
						.attr('text-anchor','middle')	
						.attr('alignment-baseline','middle')
						.attr('fill','black')


	//Dots
	chart.selectAll('.dot')
		.data(data)
	 	.enter()
	 	.append("circle")
	    .attr("class", "dot") 
	    .attr("cx", function(d, i) { return xScale(d.date) })
	    .attr("cy", function(d) { return yScale(d.actual) })
	    .attr("r", 2.5)
	    .on('mouseover', function(d) {	

    		var mousePos = d3.mouse(this.parentNode);
			var xPos = mousePos[0];
			var yPos = mousePos[1];
			var value = yScale.invert(yPos);

           	tooltip1.attr('transform','translate('+xPos+','+yPos+')')
		            .transition()		
		            .duration(500)		
		            .attr("opacity", 1);

           	tttline1.text(moment(d.date).format("MMM YYYY"))
           	tttline2.text('Acutal: '  + formatNum(d.actual))
	
            })					
        .on('mouseout', function(d) {		
            tooltip1.transition()		
                .duration(500)		
                .attr("opacity", 0);
        });




    path.on('mousemove',function(d){
    	var mousePos = d3.mouse(this.parentNode);
    	var xPos = mousePos[0];
    	var yPos = mousePos[1];
    	var value = yScale.invert(yPos);
		d3.select('#seasonal-line').transition()
									.duration(200)
									.attr('stroke-width',3.5)
    	tooltipText2.text("Adjusted: " + formatNum(value.toFixed(0)));

    	tooltip2.attr('transform','translate('+xPos+','+yPos+')')
    			.transition()		
	        	.duration(100)		
	        	.attr("opacity", 1);

    });
	path.on('mouseout', function(d) {		
	    tooltip2.transition()		
	        .duration(200)		
	        .attr("opacity", 0);
	    d3.select('#seasonal-line').transition()
									.duration(800)
									.attr('stroke-width',2)

	});


    //Anime Drawlines
	var drawGraph = anime.timeline();

	drawGraph
		.add({		

			targets:'.chart .line',
			strokeDashoffset:[anime.setDashoffset, 0],
			duration:2000,	
			easing:'easeInOutCubic',
		})
		.add({
			targets:'.dot',
			opacity:[0,1],

		})



});
