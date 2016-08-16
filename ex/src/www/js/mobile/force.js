define([
	'mods',
	'echarts',
	'd3',
	'jsnx',
	'dt'
], function(mods, echarts, d3, jsnx){
	var React = mods.ReactPack.default;

	var d = function(){
		this.data = {};
		this.$tooltip = null;
	}

	d.prototype = {
		init: function(tar, opts){
			this.$tar = tar;

			var legData = this.data.legend;
			if(!legData){
				legData = this.data.legend = {
					categories: [],
					data: {},
					ids: {},
					cur: []
				}
			};
			if(!this.data.lv){
				this.data.lv = {
					ids: {},
					lvs: ['0'],
					cur: ''
				}
			}

			this.addData(opts.nodes, opts.edges);

			legData.cur = legData.categories.slice();
			this.data.lv.cur = this.data.lv.lvs.sort()[0];

			return this;
		},
		addData: function(nodes, edges){
			nodes.forEach(node => {
				this.addLegData(node);
				this.addLvData(node);
			});
			this.data.edges = edges || [];
		},
		addLegData: function(node){
			var legData = this.data.legend;
			// if(!legData){
			// 	legData = this.data.legend = {
			// 		categories: [],
			// 		data: {},
			// 		ids: {},
			// 		cur: []
			// 	}
			// };

			let i = legData['categories'].indexOf(node[1]['category']);
			if(i == -1){
				legData['categories'].push(node[1]['category']);
				legData['data'][node[1]['category']] = [node];
				legData['ids'][node[1]['category']] = [node[0]];
			} else {
				legData['data'][node[1]['category']].push(node);
				legData['ids'][node[1]['category']].push(node[0]);
			}
		},
		addLvData: function(node){
			var data = this.data.lv,
				nodeId = node[0],
				nodeData = node[1];
			if(data.lvs.indexOf(nodeData.$lv) == -1){
				data.lvs.push(nodeData.$lv);
				data.ids[nodeData.$lv] = [nodeId];
			} else {
				data.ids[nodeData.$lv].push(nodeId);
			}
		},
		getLegend: function(){
			return $.extend({}, this.data.legend);
		},
		getEdges: function(){
			return this.data.edges.slice();
		},
		getLv: function(){
			return $.extend({}, this.data.lv);
		},
		selectLegend: function(cat){
			this.data.legend.cur.push(cat);
		},
		unselectLegend: function(cat){
			var cur = this.data.legend.cur,
				i = cur.indexOf(cat);
			if(i != -1){
				this.data.legend.cur = [...cur.slice(0, i), ...cur.slice(i + 1)];
			}
		},
		setLv: function(lv){
			this.data.lv.cur = lv;
		},
		curLv: function(){
			return this.data.lv.cur;
		},
		curLegend: function(){
			return this.data.legend.cur.slice();
		},
		tooltip: function(){
			if(!this.$tooltip){
				this.$tooltip = d3.select(this.$tar)
				.append('div')
				.attr('class', 'd3tip');
			}
			return this.$tooltip;
		}
	}

	var Force = React.createClass({
		getInitialState: function(){
			return {
				categories: [],
				lvs: [],
				// colors: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
				colors: ['#ffcd67', '#ca9a65','#ff9a65', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
			}
		},
		componentWillReceiveProps: function(props){
			this.handlerReceiveProps(props);
		},
		handlerReceiveProps: function(props){
			var {nodes, edges} = props;
			nodes = Object.keys(nodes).map(id => {
				// console.log(nodes[id]['title'], nodes[id]['uuid']);
				return [id, {
					category: nodes[id]['mid_cat'],
					r: nodes[id]['$count'] * 5 || 3,
					artTit: nodes[id]['title'],
					uuid: nodes[id]['uuid'],
					$lv: nodes[id]['$lv'],
					midName: nodes[id]['mid_name']
				}]
			});
			edges = edges.map(edge => [edge.source, edge.target]);

			if(nodes.length > 0 && !this.state.init){
				this.setState({init: true});
				this.d = new d();
				this.d.init(this.refs.chart, {
					nodes: nodes,
					edges: edges
				});
				this.returnLegend();
				this.setState({
					categories: this.d.getLegend().categories.slice(),
					lvs: this.d.getLv().lvs.sort()
				}, () => {
					this.createChart(nodes, edges);
				})
			}
		},
		createChart: function(nodes, edges){
			var G = this.G;
			if(!G)
				G = this.G = new jsnx.Graph();

			G.addNodesFrom(nodes);
			 
			G.addEdgesFrom(edges);

			var options = {
				element: this.refs.chart,
				nodeStyle: {
					fill: d => {
						return this.state.colors[this.state.categories.indexOf(d.data.category)];
					},
					'stroke-width': 0,
					r: function(d) {
						return d.data.r + '';
					}
				},
				edgeStyle: {
					'stroke': '#fff',
					'stroke-width': 1,
					fill: '#aaa'
				},
				layoutAttr: {
					// chargeDistance: 0,
					// linkDistance: 0
				},
				weighted: false,
				panZoom: {
					scale: false
				}
			};

			var ins = jsnx.draw(G, options, true);

			this.bindEvent();
		},
		bindEvent: function(){
			var tooltip = this.d.tooltip();

			d3.select(this.refs.chart).selectAll('.node').on('mouseover', null).on("mousemove", null).on("mouseleave", null).on('click', null);

			d3.select(this.refs.chart).selectAll('.node').on("mouseover", function(d) {
				// console.log(d3.event)
				tooltip.html(d.data.category + '：' + d.data.midName + '</br><span class="f12" >' + '标题：' + d.data.artTit + '</span>')
					.style("left", (d3.event.layerX) + "px")
					.style("top", (d3.event.layerY + 20) + "px")
					.style("opacity", 1.0)
					.style("display", 'block');
			})
			.on("mousemove", function(d) {
				tooltip.style("left", (d3.event.layerX) + "px")
					.style("top", (d3.event.layerY + 20) + "px");
			})
			.on("mouseleave", function(d) {
				tooltip.style("opacity", 0.0).style("display", 'none');
			})
			.on('click', function(d){
				window.open(paths.ex.base + '/base#article?uuid=' + d.data.uuid);
			});
		},
		componentDidMount: function(){
			// $.get('http://test.com/path3.gexf').done(data => {
			// 	function draw2(){
			// 		data = echarts.dataTool.gexf.parse(data);
			// 		var nodes, edges;
			// 		nodes = data.nodes.map(dat => {
			// 			let cat = dat.attributes.modularity_class;
			// 			return [dat.id, {r: dat.symbolSize, name: dat.name, category: cat}]
			// 		});
			// 		edges = data.links.map(edge => {
			// 			return [edge.source, edge.target]
			// 		});

			// 		this.d = d.init(this.refs.chart, {
			// 			nodes,
			// 			edges
			// 		});
			// 		this.setState({categories: this.d.getLegend().categories.slice()}, () => {
			// 			this.createChart(nodes, edges);
			// 		})
			// 	}
			// 	// draw2.call(this);
			// })
		},
		componentWillUnmount: function(){
			d3.select(this.refs.chart).selectAll('.node').on('mouseover', null).on("mousemove", null).on("mouseleave", null).on('click', null);
		},
		returnLegend: function(){
			if(this.props.returnLegend)
				this.props.returnLegend(this.d.getLegend().categories.slice());
		},
		legendChange: function(e, l){
			var checked = e.target.checked, d = this.d;
			// if(!checked){
			// 	this.d.unselectLegend(l);
			// 	var ids = this.d.getLegend().ids[l];
			// 	this.G.removeNodesFrom(ids);
			// } else {
			// 	this.d.selectLegend(l);

			// 	var edges = this.d.getEdges(),
			// 		data = this.d.getLegend().data;

			// 	data[l].forEach(node => {
			// 		this.G.addNode(node[0], node[1]);
			// 	})
			// 	var nodes = this.G.nodes();

			// 	var cache = [];

			// 	edges.forEach(e => {
			// 		if(nodes.indexOf(e[0]) != -1 && nodes.indexOf(e[1]) != -1){
			// 			this.G.addEdge(e[0], e[1]);
			// 		}
			// 	});
			// }
			// this.bindEvent();

			if(!checked)
				d.unselectLegend(l);
			else
				d.selectLegend(l);

			this.redraw();
		},
		lvChange: function(lv){
			var d = this.d;
			d.setLv(lv);
			this.redraw();
		},
		redraw: function(){
			var d = this.d,
				nodes = [],
				nodeData = d.getLegend().data,
				curLeg = d.curLegend(),
				curLv = d.curLv(),
				edges = d.getEdges();

			while(curLeg.length){
				nodes = nodes.concat(nodeData[curLeg.pop()]);
			}
			if(curLv != '0')
				nodes = nodes.filter(node => node[1].$lv == curLv);
			var nodeIds = nodes.map(node => node[0]);

			this.G.clear();
			nodes.forEach(node => {
				this.G.addNode(node[0], node[1]);
			})
			edges.forEach(e => {
				if(nodeIds.indexOf(e[0]) != -1 && nodeIds.indexOf(e[1]) != -1){
					this.G.addEdge(e[0], e[1]);
				}
			});
			this.bindEvent();
		},
		render: function(){
			return (
				<div className="spread-chart-container" style={{height: '500px'}}>
					<div className="hd">
						<span className="tit">{this.props.title}</span>
					</div>
					<div className="bd">
						<div className="cf pt5 pb5">
							<div className="d3legend">
								{
									this.state.categories.map((l, i) => {
										return (
											<label className="item" key={i}>
												<input type="checkbox" defaultChecked={true} onChange={e => this.legendChange(e, l)} />
												<span style={{'backgroundColor': this.state.colors[this.state.categories.indexOf(l)]}}></span>
												<span className="txt">{l}</span>
											</label>
										)
									})
								}
							</div>
							<div className="d3select">
								<select onChange={e => this.lvChange(e.target.value)}>
								{
									this.state.lvs.map((lv, i) => <option value={lv} key={i}>{lv == '0' ? '全部层级' : "第" + lv + "层级"}</option>)
								}
								</select>
							</div>
						</div>
						<div ref="chart" className="pr chart"></div>
					</div>
				</div>
			)
		}
	})

	return Force
})