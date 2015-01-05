function LineChart(data,options) {

	var WIDTH=500,
		HEIGHT=70;

	var margins={
		top:16,
		bottom:15,
		left:15,
		right:20
	}

	var padding={
		top:0,
		bottom:0,
		left:0,
		right:0
	}
	var timeSelector;

	if(options.extents.date) {
		data=data.filter(function(d){
			return d.date>=options.extents.date[0] && d.date<=options.extents.date[1]
		})
	}

	var svg=d3.select(options.container)
			//.style("width",Math.round(window.innerWidth*(window.innerWidth<=960?1:0.8))+"px")
			.append("svg")
				.attr("width",WIDTH)
				.attr("height",HEIGHT);

	var defs=svg.append("defs")
			.append("pattern")
				.attr({
					id:"diagonalHatch",
					width:3,
					height:3,
					patternTransform:"rotate(-45 0 0)",
					patternUnits:"userSpaceOnUse"
				});
	defs.append("rect")
					.attr({
						x:0,
						y:0,
						width:4,
						height:4
					})
					.style({
						stroke:"none",
						fill:"#fff"
					})
	defs
		.append("line")
		.attr({
			x0:0,
			y1:0,
			x2:0,
			y2:4
		})
		.style({
			stroke:"#A06535",
			"stroke-width":1
		})

	var axes=svg.append("g")
				.attr("id","axes")
				.attr("transform","translate("+margins.left+","+(HEIGHT-margins.bottom)+")");

	var linechart=svg.append("g")
			.attr("class","linechart")
			.attr("transform","translate("+margins.left+","+margins.top+")");

	
	var extents={
		date:d3.extent(data,function(d){
			return d.date;
		}),
		y:d3.extent(data,function(d){
			return d.value;
		})
	}

	var xscale=d3.time.scale().domain(extents.date).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);
	var yscale=d3.scale.linear()
					.domain([0,extents.y[1]])
					.range([HEIGHT-(margins.bottom+margins.top),0]).nice();

	var line = d3.svg.line()
				    .x(function(d) { return xscale(d.date); })
				    .y(function(d) { return yscale(d.value); })
	var area = d3.svg.area()
					.x(function(d) { return xscale(d.date); })
					.y0(HEIGHT-(margins.bottom+margins.top))
				    .y1(function(d) { return yscale(d.value); })

	linechart
			.append("path")
			.attr("class","area")
			.attr("d",area(data))
			.style({
				fill:"url(#diagonalHatch)"
			})

	linechart
			.append("path")
			.attr("class","line")
			.attr("d",line(data))


	var circles=linechart.selectAll("g.circle")
				.data(data)
				.enter()
				.append("g")
					.attr("class","circle")
					.classed("selected",function(d,i){
						return d.date==extents.date[1]
					})
					.attr("transform",function(d){
						var x=xscale(d.date),
							y=yscale(d.value);
						return "translate("+x+","+y+")";
					})
					.on("mouseover",function(d){
						d3.select(".x.axis")
							.selectAll(".tick")
								.classed("highlight",function(t){
									return d.date.getTime()==t.getTime();
								})
					})
					.on("mouseout",function(d){
						d3.select(".x.axis")
							.selectAll(".tick")
								.classed("highlight",false)
					})


	var w=(xscale.range()[1])/(circles.data().length-1)
	circles.append("rect")
				.attr("class","ix")
				.attr("x",-w/2)
				.attr("y",function(d){
					return -yscale(d.value)
				})
				.attr("width",w)
				.attr("height",yscale.range()[0]+margins.bottom)


	circles.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",4);

	var text=circles.append("text")
				.attr("class","label")
				.attr("x",5)
				.attr("y",14)
				.style("text-anchor",function(d,i){
					var position="middle";
					if(i==0)
						position="start";
					if(i==circles.data().length-1)
						position="end";
					return position;
				})
				
	text.append("tspan")
			.attr("class","click")
			.style("text-anchor",function(d,i){
				var position="start";
				if(i==circles.data().length-1)
					position="end";
				return position;
			})
			.text(function(d){
				return "click to select"
			});
			
	text.append("tspan")
			.attr("x",5)
			.attr("y",-8)
			.text(function(d){
				return d3.format(",.2s")(d.value);
			});

	circles.append("line")
				.attr("class","dropline")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",0)
				.attr("y2",function(d){
					return yscale.range()[0] - yscale(d.value);
				})


	var xAxis = d3.svg.axis().scale(xscale).tickSize(3);
	var yAxis = d3.svg.axis().scale(yscale).orient("left").tickValues(yscale.ticks(3).filter(function(d){return d>0;}));

	var xtickFormat=function(value){
		var q= Math.ceil(+d3.time.format("%m")(value)/3);
		return d3.time.format("Q"+q+"/%y")(value)
	}
	var ytickFormat=function(d,i){
		var title="";
		if(i==yAxis.tickValues().length-1) {
			title=" ACTIVE REPOSITORIES";
		}
		return d3.format("s")(d)+title;
	}
	
	xAxis.tickFormat(xtickFormat);
	yAxis.tickFormat(ytickFormat);

	axes.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+padding.left+",0)")
      .call(xAxis)

    
    

    axes.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,"+(-(HEIGHT-(margins.bottom+margins.top)))+")")
      .call(yAxis)
      	.selectAll("text")
      		.attr("dx",margins.left-22)
      		.attr("dy",-3)

    axes.selectAll("line.ygrid")
			.data(yscale.ticks(3).filter(function(d){return d>0;}))
    		.enter()
    		.append("line")
    			.attr("class","ygrid")
    			.attr("x1",0)
    			.attr("x2",WIDTH-(margins.left+margins.right))
    			.attr("y1",function(d){
    				return  - ((HEIGHT - (margins.top+margins.bottom)) - yscale(d));
    			})
    			.attr("y2",function(d){
    				return  - ((HEIGHT - (margins.top+margins.bottom)) - yscale(d));
    			});

    function TimeSelector() {
    	var container=d3.select(options.selector),
    		current=xscale.ticks().length-1,
    		dates=xscale.ticks(),
    		to=null;

    	container.append("a")
    			.attr("class","arrow")
    			.attr("title","Previous Quarter")
    			.attr("href","#")
    			.html("&lt;")
    			.on("click",function(d){
    				d3.event.preventDefault();
    				if(current>0) {
    					current--;
	    				selectDate(dates[current]);
	    			}
    			});

    	container.append("ul")
    			.selectAll("li")
    			.data(dates)
    			.enter()
    				.append("li")
    				.classed("selected",function(d,i){
						return d.getTime()==dates[current].getTime()
					})
    				.text(function(d){
    					return xtickFormat(d);
    				})
    	container.append("a")
    			.attr("class","arrow")
    			.attr("title","Next Quarter")
    			.attr("href","#")
    			.html("&gt;")
    			.on("click",function(d){
    				d3.event.preventDefault();
    				if(current<dates.length-1) {
    					current++;
	    				selectDate(dates[current]);
	    			}
    			});

    	this.select=function(date) {
    		selectDate(date,true)
    	}
    	function selectDate(date,no_callback) {
    		if(to) {
    			clearTimeout(to);
    		}
    		to=setTimeout(function(){

    			current=dates.map(function(d){return d.getTime()}).indexOf(date.getTime());
    			
    			container
    				.selectAll("li")
    				.classed("selected",function(d,i){
						return d.getTime()==date.getTime()
					})
    			if(!no_callback) {
    				selectTick(date);
					options.callback({date:date});	
    			}

    		},200);
    	}
    }

    timeSelector = new TimeSelector();

    linechart.selectAll("g.circle")				
		.on("click",function(d){
			selectTick(d.date);
			options.callback(d);
		})
	function selectTick(time) {

		linechart
			.selectAll("g.circle")
			.classed("selected",function(t){
				return time.getTime()==t.date.getTime();
			});

		svg.select(".x.axis")
			.selectAll(".tick")
				.classed("selected",function(t){
					return time.getTime()==t.getTime();
				});

		timeSelector.select(time);
	}
	selectTick(xscale.ticks()[xscale.ticks().length-1]);
}
