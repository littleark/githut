function LineChart(data,options) {

	var WIDTH=500,
		HEIGHT=WIDTH/5;

	var margins={
		top:15,
		bottom:15,
		left:35,
		right:10
	}

	var padding={
		top:0,
		bottom:0,
		left:0,
		right:0
	}

	if(options.extents.date) {
		data=data.filter(function(d){
			return d.date>=options.extents.date[0] && d.date<=options.extents.date[1]
		})
	}

	var svg=d3.select(options.container)
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



	console.log("DAAAAAAAATAAAAAAA",data);
	
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


	var circles=linechart.selectAll("circle")
				.data(data)
				.enter()
				.append("g")
					.attr("transform",function(d){
						var x=xscale(d.date),
							y=yscale(d.value);
						return "translate("+x+","+y+")";
					})
					.on("mouseover",function(d){

					})


	var w=(xscale.range()[1])/(circles.data().length-1)
	circles.append("rect")
				.attr("class","ix")
				.attr("x",-w/2)
				.attr("y",function(d){
					return -yscale(d.value)
				})
				.attr("width",w)
				.attr("height",yscale.range()[0])


	circles.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",2);

	circles.append("text")
				.attr("class","label")
				.attr("x",0)
				.attr("y",-8)
				.style("text-anchor",function(d,i){
					var position="middle";
					if(i==0)
						position="start";
					if(i==circles.data().length-1)
						position="end";
					return position;
				})
				.text(function(d){
					return d.value;
				});

	circles.append("line")
				.attr("class","dropline")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",0)
				.attr("y2",function(d){
					return yscale.range()[0] - yscale(d.value);
				})


	var xAxis = d3.svg.axis().scale(xscale).tickSize(3);//.tickValues(extents.date);
	var yAxis = d3.svg.axis().scale(yscale).orient("left").tickValues(yscale.ticks(3).filter(function(d){return d>0;}));

	var xtickFormat=function(value){
		var q= Math.ceil(+d3.time.format("%m")(value)/3);
		return d3.time.format("Q"+q+"/%y")(value)
	}
	var ytickFormat=d3.format(",.f");
	
	xAxis.tickFormat(xtickFormat);
	yAxis.tickFormat(ytickFormat);

	axes.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+padding.left+",0)")
      .call(xAxis);


    axes.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,"+(-(HEIGHT-(margins.bottom+margins.top)))+")")
      .call(yAxis);


}