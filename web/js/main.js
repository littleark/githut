d3.csv("web/data/languages.csv",function(d){
			
	d["Year"]=+d["Year"];
	d["name_lc"]=d["Name"].toLowerCase();

	return d;

},function(data){

	var programming_languages={};
	data.forEach(function(lang){
		programming_languages[lang["name_lc"]]=lang["Year"];
	})

	var last_quarter="q4-2014";
	var unknonw=[];

	d3.csv("server/exports/"+last_quarter+".csv",function(q){
		
		q.active_repos_by_url=+q.active_repos_by_url;
		q.events=+q.events;
		
		if(!programming_languages[q.repository_language.toLowerCase()]) {
			if(unknonw.indexOf(q.repository_language.toLowerCase())==-1) {
				unknonw.push(q.repository_language.toLowerCase())
			}
		}
		
		q.year=programming_languages[q.repository_language.toLowerCase()] || 1970;

		return q;
	},function(data){

		var events={};
		data.forEach(function(d){

			if(!events[d["repository_language"]]) {
				events[d["repository_language"]]={
					repository_language:d["repository_language"]
				};
			}
			switch(d["type"]) {
				case "CreateEvent":
					events[d["repository_language"]][d["type"]]=d["active_repos_by_url"];
				break;
				case "ForkEvent":
					events[d["repository_language"]][d["type"]]=d["events"]/d["active_repos_by_url"];
				break;
				case "PushEvent":
					events[d["repository_language"]][d["type"]+"Repo"]=d["active_repos_by_url"];
					events[d["repository_language"]][d["type"]+"All"]=d["events"];
					events[d["repository_language"]][d["type"]]=d["events"]/d["active_repos_by_url"];
				break;
				default:
					events[d["repository_language"]][d["type"]]=d["events"]/d["active_repos_by_url"];
				break;
			}
			
			events[d["repository_language"]].year=d.year;
			
		})
		
		pc=new ParallelCoordinates(d3.values(events),{
			programming_languages:programming_languages,
			container:"#pc",
			scale:"linear",
			columns:["name","PushEventRepo","PushEventAll","PushEvent","ForkEvent","IssuesEvent","WatchEvent","year"],
			ref:"lang_usage",
			title_column:"name",
			scale_map:{
				"year":"linear",
				"name":"ordinal",
				"name2":"ordinal",
				"created":"ordinal",
				"CreateEvent":"ordinal",
				"PushEvent":"ordinal",
				"PushEventAll":"ordinal",
				"PushEventRepo":"ordinal",
				"active_repos_by_url":"ordinal",
				"events_per_repo":"ordinal",
				"lang_usage":"ordinal",
				"sum_rep_size":"ordinal",
				"ForkEvent":"ordinal",
				"IssuesEvent":"ordinal",
				"WatchEvent":"ordinal"
			},
			use:{
				"name":"PushEventRepo"
			},
			sorting:{
				"name":d3.descending
			},
			formats:{
				"year":"d"
			},
			dimensions:["created","CreateEvent","PushEventRepo","PushEventAll","PushEvent","ForkEvent","IssuesEvent","WatchEvent","active_repos_by_url","lang_usage","events_per_repo","year","name"],
			column_map:{
				"name":["Repository","Language"],
				"active_repos_by_url":"Active",
				"created":"Created",
				"CreateEvent":"New Repositories",
				"PushEvent":["Pushes","per Repository"],
				"PushEventAll":["Total","Pushes"],
				"PushEventRepo":["Active","Repositories"],
				"lang_usage":"Events",
				"year":["Appeared","in Year"],
				"events_per_repo":"Events/Repo",
				"ForkEvent":["New Forks","per Repository"],
				"IssuesEvent":["Opened Issues","per Repository"],
				"WatchEvent":["New Watchers","per Repository"]
			},
			help:{
				"name":"<h4>Repository Language</h4>Programmin language of the Repositories.<br/>Ordered by activity rank.",
				"PushEventAll":"<h4>Total Pushes</h4>Total number of changes pushed to repositories with a defined language in the selected period of time.",
				"PushEventRepo":"<h4>Active Repositories</h4>Number of active repositories with a defined language in the selected period.<br/>A repository is considered active if at least one change has been pushed during the selected period of time.",
				"PushEvent":"<h4>Pushes per Repository</h4>Average number of changes pushed per repository in the selected period of time.",
				"year":"<h4>Appeared in Year</h4>Year in which the programming language was released.",
				"ForkEvent":"<h4>New Forks per Repository</h4>Average number of forks per repository in the selected period of time.",
				"IssuesEvent":"<h4>Opened Issues per Repository</h4>Average number of opened issues per repository in the selected period of time.",
				"WatchEvent":"<h4>New Watchers per Repository</h4>Average number of new watchers per repository in the selected period of time."
			},
			duration:1000,
			path:"server/exports/",
			extension:"csv"
		});
	});

	d3.csv("server/exports/active_quarters.csv?12345",function(d){

		d.active_repos_by_url=+d.active_repos_by_url;
		d.date=new Date(d.year,((+d.quarter)*3-3),1)

		return d;
	},function(data){

		var extents={
			date:[
				new Date(2012,3,1),
				new Date(2014,9,1)
			]
		};

		var sums={};
		data.filter(function(d){
			return d.repository_language!="null"
		}).forEach(function(d){
			if(!sums[d.repository_language]) {
				sums[d.repository_language]=d3.sum(data.filter(function(l){
					return l.repository_language==d.repository_language && ((l.date>=extents.date[0]) && (l.date<=extents.date[1]))
				}),function(d){
					return d.active_repos_by_url
				})
			}
		})
		
		
		var sums_quarter={};
		data.forEach(function(d){
			if(!sums_quarter[d.year+"-"+d.quarter]) {
				sums_quarter[d.year+"-"+d.quarter]=d3.sum(data.filter(function(l){
					return d.year+"-"+d.quarter==l.year+"-"+l.quarter
				}),function(d){
					return d.active_repos_by_url
				})
			}	
		})
		
		qc=new LineChart(d3.entries(sums_quarter).map(function(d){
			var date=d.key.split("-")
			return {
				date:new Date(date[0],((+date[1])*3-3),1),
				d:date,
				value:d.value
			}
		}).sort(function(a,b){
			return d3.ascending(a.date,b.date)
		}),{
			container:"#qc",
			extents:extents,
			selector:"#timeselect",
			callback:function(d){
				pc.loadData(d);
			}
		});

					

		var nested_data=d3.nest()
							.key(function(d){
								return d.repository_language
							})
							.key(function(d){
								return new Date(d.year,((+d.quarter)*3-3),1)
							})
							.rollup(function(leaves){
								return {
									repositories:{
										active_repos_by_url:d3.sum(leaves,function(d){
											return d.active_repos_by_url
										}),
										active_repos_by_url_perc:d3.sum(leaves,function(d){
											if(sums_quarter[d.year+"-"+d.quarter]==0) {
												return 0;
											}
											return (d.active_repos_by_url/sums_quarter[d.year+"-"+d.quarter])
										}),
										active_repos_by_name:d3.sum(leaves,function(d){
											return d.active_repos_by_name
										})	
									}	
									
								}
							})
							.entries(data.filter(function(d){
								return d.repository_language!="null" && sums[d.repository_language]>0 && (d.date>=extents.date[0]) && (d.date<=extents.date[1]);
							}).sort(function(a,b){
								return d3.descending(sums[a.repository_language],sums[b.repository_language]);
							}));
		
		sm=new SmallMultiples(nested_data.slice(0,49),{
			extents:extents,
			container:"#sm",
			indicator:"repositories",
			metric:"num",
			metrics:{
				"num":"active_repos_by_url",
				"perc":"active_repos_by_url_perc"
			},
			metric_titles:{
				"num":"Repos",
				"perc":"% Repos on total"	
			},
			scales:{
				"num":"sqrt",
				"perc":"linear"
			},
			title:"New repositories"
		});

		d3.select("#sm_select")
			.selectAll("a")
			.data(["num","perc"])
			.on("click",function(d){
				d3.event.preventDefault();
				d3.selectAll("#sm_select a")
					.classed("selected",false);
				d3.select(this).classed("selected",true)
				
				sm.switchScale(d)
			})
			.on("mouseover",function(d){
				d3.selectAll("#sm_select span.visible")
					.classed("visible",false)
				d3.select("#sm_select")
					.selectAll("span[rel="+d+"]")
					.classed("visible",true)
			})
	});

		
});