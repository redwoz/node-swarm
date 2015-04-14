//imitates 4 separate nodes all connecting and doing 'something' in a full-mesh

var nodeswarm = require('./index')

var nodelist = [
                'ws://127.0.0.1:8081/',
                'ws://127.0.0.1:8082/',
                'ws://127.0.0.1:8083/',
                'ws://127.0.0.1:8084/'
                ]

setTimeout(function(){
	var node1 = nodeswarm({
		wsport: 8081,
		wsallow: '127.0.0.1',
		nodelist: nodelist
	})
}, 100)

setTimeout(function(){
	var node2 = nodeswarm({
		wsport: 8082,
		wsallow: '127.0.0.1',
		nodelist: nodelist
	})
}, 200)

setTimeout(function(){
	var node2 = nodeswarm({
		wsport: 8083,
		wsallow: '127.0.0.1',
		nodelist: nodelist
	})
}, 250)

setTimeout(function(){
	var node2 = nodeswarm({
		wsport: 8084,
		wsallow: '127.0.0.1',
		nodelist: nodelist
	})
}, 250)
