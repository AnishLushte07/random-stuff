var BOSH_SERVICE = 'http://ejabberd.quezx.test:5280/bosh';
var connection = null;

function log(msg) {
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

function getOldMsg() {
	connection.mam.query("noble-at-quetzal.in-at-quezx.in@ejabberd.quezx.test", {
	  "with": "dfa-at-quezx.in@ejabberd.quezx.test",
	  max: 5,
	  before: '',
	  onMessage: function(message) {
	  	console.log('Message')
				// console.log("Message from ", $(message).find("forwarded message").attr("from"),
				// 	": ", $(message).find("forwarded message body").text());
				return true;
	  },
	  onComplete: function(response) {
				console.log("Got all the messages");
	  },
	});
}

function onConnect(status, a,b ,c) {
    if (status == Strophe.Status.CONNECTING) {
	log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
	log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
	log('Strophe is disconnected.');
	$('#connect').get(0).value = 'connect';
    } else if (status === Strophe.Status.AUTHFAIL){
    log('Invalid auth token.');
    } else if (status == Strophe.Status.CONNECTED) {
	log('Strophe is connected.');
	console.log($pres);
	connection.addHandler(onMessage, null, 'message'); 
	connection.send($pres().tree());

 	connection.si_filetransfer.addFileHandler(fileHandler);
  connection.ibb.addIBBHandler(ibbHandler);
  connection.muc.init(connection);
  connection.httpUpload.init(connection);
  connection.chatstates.init(connection);

  console.log(connection.chatstates)

  connection.chatstates.statusChanged(Strophe.Status.CONNECTED);
  

	setTimeout(() => {
		console.log('timeout ran')
getOldMsg();
	}, 2000);
    }
}


function sendMessage (messgeTo, message, type) {
	var messagetype = (type) ? type : 'chat';
	var reply;


	reply = $msg({
		to: messgeTo,
		from: connection.jid,
		type: messagetype
	}).c("body").t(message);

	connection.send(reply.tree());

	log('I sent ' + messgeTo + ': ' + message, reply.tree());
}

function onMessage(msg) {
	console.log(msg)
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
	var body = elems[0];
	console.log(body);

	log('ECHOBOT: I got a message from ' + from + ': ' + 
	    Strophe.getText(body));
    }

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;
}


$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE, {
    	mechanisms: [Strophe.SASLXOAuth2]
    });

    // Uncomment the following lines to spy on the wire traffic.
    //connection.rawInput = function (data) { log('RECV: ' + data); };
    //connection.rawOutput = function (data) { log('SEND: ' + data); };

    // Uncomment the following line to see all the debug output.
    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };
$('#message').bind('click', function () {
  sendMessage('dfa-at-quezx.in@ejabberd.quezx.test', 'Hi anish 2')
  connection.send($pres().tree());
});

$('#room').bind('click', function () {
  // createRoom('anishasdhfjk@conference.ejabberd.quezx.test')
  fileTran();
});

function getUploadUrl(iq) {
  var ansNodes = iq.querySelectorAll("item");
  for ( i=0; i<ansNodes.length; i++ ) {
    var jid = ansNodes[i].getAttribute ( "jid" );
    if( jid.indexOf( "upload" ) !== -1 ) {
      return jid;
    }
  }
}

function uplodaFile(url) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          console.log('done upload')
        }
  };

  xhr.open("PUT", url, true);
  // var formData = new FormData();
  // formData.append("thefile", file);
  xhr.setRequestHeader('Content-Type', 'text/plain');
  xhr.send(file);
}

function getSlot(service) {
  console.log('getSlot')
  connection.httpUpload.getSlot(
    service,
    file,
    (data) => {
      console.log(data);
      console.log(data.querySelector("put"))
      var put = data.querySelector("put").getAttribute("url");
      var get = data.querySelector("get").getAttribute("url");
      console.log('put ', put);
      console.log('get ', get);

      window.putUrl = put;
      // uplodaFile(put);
    },
    (err) => {
      console.log(err);
    });
}

function getMaxFile(service) {
  console.log('getMaxFile')
  connection.httpUpload.getMaxSize(
    service,
    (data) => {
      console.log(data);
      getSlot(service);
    },
    (err) => {
      console.log(err);
    });
}

function fileTran() {
  /*connection.httpUpload.discover(
    (data) => {
      console.log(data);
      const url = getUploadUrl(data);
      console.log(url);
      getMaxFile(url)
    },
    (err) => {
      console.log(err);
    });*/

  connection.httpUpload.getUrls(
    file,
    (data) => {
      console.log(data);
      window.putUrl = data.put;
      // uplodaFile(data.put);
    },
    (err) => {
      console.log(err);
    });
}


$('#btnSendFile').bind('click', function() {
    console.log('File clicked:');
    sendFileClick();
  });

$(document).on('composing.chatstates', (data) => {
  console.log('composing.chatstates', data)
})

$(document).on('paused.chatstates', (data) => {
  console.log('paused.chatstates', data)
})

$(document).on('active.chatstates', (data) => {
  console.log('active.chatstates', data)
})

 document.getElementById('file').addEventListener('change', handleFileSelect, false);

 document.getElementById('active').addEventListener('click', () => { 
    connection.chatstates.sendActive('noble-at-quetzal.in-at-quezx.in@ejabberd.quezx.test')
 }, false);

 document.getElementById('composing').addEventListener('click', () => { 
    connection.chatstates.sendComposing('noble-at-quetzal.in-at-quezx.in@ejabberd.quezx.test')
 }, false); 

 document.getElementById('paused').addEventListener('click', () => { 
    connection.chatstates.sendPaused('noble-at-quetzal.in-at-quezx.in@ejabberd.quezx.test')
 }, false);

    $('#connect').bind('click', function () {
	var button = $('#connect').get(0);
	if (button.value == 'connect') {
	    button.value = 'disconnect';

	    // connection.rawInput = rawInput;
    	// connection.rawOutput = rawOutput;

	    // connection.connect($('#jid').get(0).value,
			  //      $('#pass').get(0).value,
			  //      onConnect);

	    connection.connect('noble-at-quetzal.in-at-quezx.in@ejabberd.quezx.test',
			       'lXljXkQAqyMevo41HHKjY12twf49eZop',
			       onConnect);
	    

	} else {
	    button.value = 'connect';
	    connection.disconnect();
	}


    });
});

function room_msg_handler(a, b, c) {
  log('MUC: room_msg_handler');
  return true;
}

function room_pres_handler(a, b, c) {
  log('MUC: room_pres_handler');
  return true;
}

function onCreateRoomSuccess(stanza) {
  log('MUC: onCreateRoomSuccess: '+stanza);
  return true;
}

function onCreateRoomError(stanza) {
  log('MUC: onCreateRoomError: '+stanza);
  return true;
}

function createRoom(room, descr, subject) {
  log("createRoom: " + room);
  // join the room
  connection.muc.join(room, 'dfa-at-quezx.in@ejabberd.quezx.test', room_msg_handler, room_pres_handler);
  console.log('joined room')
  var config = {"muc#roomconfig_publicroom": "1", "muc#roomconfig_persistentroom": "1"};
  if (descr)  config["muc#roomconfig_roomdesc"] = descr;
  if (subject)  config["muc#roomconfig_subject"] = subject;
  console.log('configuring room')
  connection.muc.createConfiguredRoom(room, config, onCreateRoomSuccess, onCreateRoomError);
  console.log('configured room')
}


function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
    file = files[0];

    window.fileDoc = file
    console.log(window.fileDoc)
    console.log(file)
}

function sendFileClick() {
	sendFile(file);
	
	readAll(file, function(data) {
		log("handleFileSelect:");
		log("	>data="+data);
		log("	>data.len="+data.length);
	});
}

// function  (file) {
// 	var to = 'shruthi@staging-ejabberd.quezx.com'; //$('#to').get(0).value;
// 	var filename = file.name;
// 	var filesize = file.size;
// 	var mime = file.type;
// 	chunksize = filesize;
// 	sid = connection._proto.sid;
// 	log('sendFile: to=' + to);
// 	// send a stream initiation
// 	connection.si_filetransfer.send(to, sid, filename, filesize, mime, function(err) {
// 		fileTransferHandler(file, err);
// 	});
// }

function fileHandler(from, sid, filename, size, mime) {
  // received a stream initiation
  // save to data and be prepared to receive the file.
  log("fileHandler: from=" + from + ", file=" + filename + ", size=" + size + ", mime=" + mime);
  mimeFile = mime;
  fileName = filename;
  return true;
}

function ibbHandler(type, from, sid, data, seq) {
  log("ibbHandler: type=" + type + ", from=" + from);
  switch (type) {
    case "open":
      // new file, only metadata
      aFileParts = [];
      break;
    case "data":
      log("	>seq=" + seq);
      log("	>data=" + data);
      aFileParts.push(data);
      // data
      break;
    case "close":
      // and we're done
      var data = "data:" + mimeFile + ";base64,";
      for (var i = 0; i < aFileParts.length; i++) {
        data += aFileParts[i].split(",")[1];
      }
      log("	>data=" + data);
      log("	>data.len=" + data.length);
      if (mimeFile.indexOf("png") > 0) {
        var span = document.createElement('span');
        span.innerHTML = ['<img class="thumb" src="', data, '" title=""/>'].join('');
      } else {
        var span = document.createElement('span');
        span.innerHTML = ['<a class="link" download="' + fileName + '" href="', data, '" title="">download</a>'].join('');
      }
      document.getElementById('list').insertBefore(span, null);
    default:
      throw new Error("shouldn't be here.")
  }
  return true;
}

function fileTransferHandler(file, err) {
  log("fileTransferHandler: err=" + err);
  if (err) {
    return console.log(err);
  }
  var to = $('#to').get(0).value;
  chunksize = file.size;

  chunksize = 20 * 1024;

  // successfully initiated the transfer, now open the band
  connection.ibb.open(to, sid, chunksize, function(err) {
    log("ibb.open: err=" + err);
    if (err) {
      return console.log(err);
    }


    readChunks(file, function(data, seq) {
      sendData(to, seq, data);
    });
  });
}

function readAll(file, cb) {
    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        cb(evt.target.result);
      }
    };

    reader.readAsDataURL(file);
}

function readChunks(file, callback) {
  var fileSize = file.size;
  var chunkSize = 20 * 1024; // bytes
  var offset = 0;
  var block = null;
  var seq = 0;

  var foo = function(evt) {
    if (evt.target.error === null) {
      offset += chunkSize; //evt.target.result.length;
      seq++;
      callback(evt.target.result, seq); // callback for handling read chunk
    } else {
      console.log("Read error: " + evt.target.error);
      return;
    }
    if (offset >= fileSize) {
      console.log("Done reading file");
      return;
    }

    block(offset, chunkSize, file);
  }

  block = function(_offset, length, _file) {
    log("_block: length=" + length + ", _offset=" + _offset);
    var r = new FileReader();
    var blob = _file.slice(_offset, length + _offset);
    r.onload = foo;
    r.readAsDataURL(blob);
  }

  block(offset, chunkSize, file);
}

function sendData(to, seq, data) {
  // stream is open, start sending chunks of data
  connection.ibb.data(to, sid, seq, data, function(err) {
    log("ibb.data: err=" + err);
    if (err) {
      return console.log(err);
    }
    // ... repeat calling data
    // keep sending until you're ready you've reached the end of the file
    connection.ibb.close(to, sid, function(err) {
      log("ibb.close: err=" + err);
      if (err) {
        return console.log(err);
      }
      // done
    });
  });
}
