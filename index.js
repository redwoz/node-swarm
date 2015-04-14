var moment = require('moment')
var crypto = require('crypto')

var WebSocket = require('ws')
var WebSocketServer = WebSocket.Server

function doJob(ws){
	clog('do things...')
	
}

function clog(txt){
	console.log(moment().format('DD/MM/YY HH:mm:ss') + '   ' + txt);
}

module.exports = nodeswarm;

function nodeswarm(options){
	
	options = options || {};
	var wsport		= options.wsport || 8080;
	var nodelist	= options.nodelist || [];
	
	var connectedlist = []
	
	var guid = crypto.createHash("md5").update(
			JSON.stringify(options) +
			moment().format('DD/MM/YY HH:mm:ss')
		).digest("hex").substring(0,6)
	
	//logger
	function log(txt, id){
		if(typeof id === 'undefined') id = ' '
		clog(guid + '.' + id + '   ' + txt)
	}
		
	//listen WS
	//
	var wss = new WebSocketServer({ port: wsport })
	wss
	.on('connection', function(ws){
		var remoteAddress = ws.upgradeReq.connection.remoteAddress
		if(JSON.stringify(nodelist).indexOf(remoteAddress) < 0){
			log('ip reject:' + remoteAddress, 'S')
			this.close()
		} else {
			log('accept:' + remoteAddress, 'S')
			ws
			.on('message', function(data){
				var msg = JSON.parse(String(data))
				log('cxi_rx:' + JSON.stringify(msg), 'S')
				//check guid
				if(typeof msg['guid'] != 'undefined'){
					if(msg['guid'] === guid){
						log('self reject:' + guid, 'S')
						this.close()
					} else if(connectedlist.indexOf(msg['guid']) > -1){
						log('dup reject: ' + remoteAddress, 'S')
						this.close()
					} else {
						log('client unique: ' + remoteAddress, 'S')
						connectedlist.push(msg['guid'])
						this.send(JSON.stringify({guid:guid})) //send our own
					}
				}
			})
			.on('close', function(){
				log('cxi_c', 'S')
			});
		}
	});
	
	//try connect to things
	//
	nodelist.forEach(function(wsuri, id){
		function go(){
			connect({wsuri:wsuri, id:id},function(e){
				if(e){
					setTimeout(function(){
						go()
					},250)
				} else {
					//we are in!
				}
			})
		}
		go()
	})
	function connect(opts, cb){
		(new WebSocket(opts.wsuri))
		.on('open', function(){
			log('cxo:' + opts.wsuri, opts.id)
			this.send(JSON.stringify({guid:guid}))
			cb()
		})
		.on('error', function(e){
			log('cxo_er:' + e, opts.id)
			cb(e)
		})
		.on('message', function(data) {
			var msg = JSON.parse(String(data))
			log('cxo_rx:' + JSON.stringify(msg), opts.id)
			//check guid
			if(typeof msg['guid'] != 'undefined'){
				log('server unique: ' + msg['guid'], opts.id)
				connectedlist.push(msg['guid'])
				
				//do stuffffs
				log('    ' + guid + ' <<------>> ' + msg['guid'], opts.id)
				doJob(this)
				
			} // else we already booted
		})
		.on('close', function() {
			log('cxo_c', opts.id)
		})
	}
	
}
