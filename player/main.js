import SuperpoweredModule from './superpowered.js'

var audioContext = null; // Reference to the audio context.
var audioNode = null;    // This example uses one audio node only.
var Superpowered = null; // Reference to the Superpowered module.
var content = null;      // The <div> displaying everything.
var pitchShift = 0;      // The current pitch shift value.

// onclick by the pitch shift minus and plus buttons
function changePitchShift(e) {
    // limiting the new pitch shift value
    let value = parseInt(e.target.value);
    pitchShift += value;
    if (pitchShift < -12) pitchShift = -12; else if (pitchShift > 12) pitchShift = 12;
    // displaying the value
    document.getElementById('pitchShiftDisplay').innerText = '变调: ' + ((pitchShift < 1) ? pitchShift : '+' + pitchShift) + ' ';
    // sending the new value to the audio node
    audioNode.sendMessageToAudioScope({ 'pitchShift': pitchShift });
}

// on change by the rate slider
function changeRate() {
    // displaying the new rate
    let value = document.getElementById('rateSlider').value, text;
    if (value == 10000) text = '原始速度';
    else if (value < 10000) text = '-' + (100 - value / 100).toPrecision(2) + '%';
    else text = '+' + (value / 100 - 100).toPrecision(2) + '%';
    document.getElementById('rateDisplay').innerText = text;
    // sending the new rate to the audio node
    audioNode.sendMessageToAudioScope({ rate: value });
}

// double click on the rate slider
function changeRateDbl() {
    document.getElementById('rateSlider').value = 10000;
    changeRate();
}

// click on play/pause
function togglePlayback(e) {
    let button = document.getElementById('playPause');
    if (button.value == 1) {
        button.value = 0;
        button.innerText = '播放';
        audioContext.suspend();
    } else {
        button.value = 1;
        button.innerText = '暂停';       
        audioContext.resume();
				var myVar = setInterval(myTimer, 2000);
				
				function myTimer() { ////don't send speed control if it's not playing, or the progress can't update
		      audioNode.sendMessageToAudioScope({ rate: document.querySelectorAll("input[name=speedoptions]:checked")[0].value });
				  clearTimeout(myVar);
				}        
    }
}

function toggleHLSType(e) {
	if ( event.target && event.target.matches("input[type='radio']") ) {
		audioNode.sendMessageToAudioScope({ 'pitchShift': e.target.value });
	  //console.log(e.target.value);
	}
}

function toggleSpeedOptions(e) {
	if ( event.target && event.target.matches("input[type='radio']") ) {
		if ( document.getElementById('playPause').value == 1 )
		{  //don't send speed control if it's not playing, or the progress can't update
    		audioNode.sendMessageToAudioScope({ rate: e.target.value });
    		//console.log(e.target.value);
    }
    //console.log(document.querySelectorAll("input[name=speedoptions]:checked")[0].value);
	}
}

// we have the audio system created, let's display the UI and start playback
function onAudioDecoded(buffer) {
    // send the PCM audio to the audio node
    if ( buffer.numberOfChannels == 1 )
    {
        audioNode.sendMessageToAudioScope({
            left: buffer.getChannelData(0),
            right: buffer.getChannelData(0) }
       );   
    }
    else if ( buffer.numberOfChannels == 2 )
    {
        audioNode.sendMessageToAudioScope({
            left: buffer.getChannelData(0),
            right: buffer.getChannelData(1) }
       );   
    }
    else
    {
        console.log("error!! channel number:"+buffer.numberOfChannels);
    }

    // audioNode -> audioContext.destination (audio output)
    audioContext.suspend();
    audioNode.connect(audioContext.destination);

    //document.getElementById("name").value php way
    // UI: innerHTML may be ugly but keeps this example small
    var song_name = decodeURIComponent(getQueryString("name"));
    var str='<center><h4>'+song_name+'</h4><center>';
    document.title = "葫芦丝："+song_name;
   
    var param_str1 = getQueryString("compose");
    var param_str2 = getQueryString("play");

    if ( param_str1 || param_str2 )
    {
        str += '<center><p>';
        if ( param_str1 != null && param_str1.length > 0  )
        {
            str += '作曲：';
            str += decodeURI(param_str1);
        }

				if ( param_str1 != null && param_str1.length > 0 && param_str2 != null && param_str2.length > 0 )
				{
				    str += "　　　";
				}
				
        if ( param_str2 != null && param_str2.length > 0 )
        {
            str += '演奏：';
            str += decodeURI(param_str2);
        }                
        str += '</p></center>';
    }

    var text_rate;
    param_str2 = getQueryString("rate"); 

    if (param_str2 == 10000 || param_str2 == null) text_rate = '原始速度';
    else if (param_str2 < 10000) text_rate = '-' + (100 - param_str2 / 100).toPrecision(2) + '%';
    else text_rate = '+' + (param_str2 / 100 - 100).toPrecision(2) + '%';

    str += '<p>速度</p>' /*+text_rate*/;
    
    
    str += '<div class="radio-group" id="speedoptions"><input type="radio" value="9000" id="sp_option-1" name="speedoptions"><label for="sp_option-1">慢</label><input type="radio" value="10000" id="sp_option-2" name="speedoptions" checked><label for="sp_option-2">正常</label><input type="radio" value="11000" id="sp_option-3" name="speedoptions"><label for="sp_option-3">快</label></div>';
    
    param_str1 = getQueryString("pitch"); 

    if (param_str1 != null)
    {
        str += '<p>调式：'+ decodeURI(param_str1)+'</p>';	    
    } 
    
    
    param_str1 = getQueryString("pitchOptions"); 
    if (param_str1 != null)
    {
    	  str += '<p>调式</p>';
    	  str += '<div class="radio-group" id="hlstype">';
        var shiftOptions = param_str1.split("z");
        shiftOptions.forEach(shiftOptionsForEach);
				function shiftOptionsForEach(value, index, array) {
				  //txt = txt + value + "<br>";
				  var pos = value.indexOf("x");
				  if ( pos > 0 )
				  {
						 str += '<input type="radio" value="'+value.substring(pos+1,value.length)+'" id="option-'+index+'" name="hlstype" >'; 	
						 str += '<label for="option-'+index+'">'+value.substr(0, pos).replace("bb","bB").replace("a","A")+'</label>';
				  }
				  pos = value.indexOf("X");
				  if ( pos > 0 )
				  {
				  	 var shiftValue = value.substring(pos+1,value.length);
						 str += '<input type="radio" value="'+value.substring(pos+1,value.length)+'" id="option-'+index+'" name="hlstype" checked>'; 	
						 str += '<label for="option-'+index+'">'+value.substr(0, pos).replace("bb","bB").replace("a","A")+'</label>';
						 audioNode.sendMessageToAudioScope({ 'pitchShift': shiftValue });
				  }
				  //console.log(value.substr(0, pos)+":"+value.substring(pos+1,value.length));
				}    	
        str += '</div>';
    }
    
    content.innerHTML = str+'\
        <h3> </h3>\
        <div id="progress" stype="margin:30px;"><div style="position: relative;height:40;width:100%;border:solid 0px #EEC286;background-color:gainsboro;"><div style="position:absolute;height:40;width:0%; background-color: #EEC286;text-align:right;">0%</div></div></div>\
        <h2> </h2>\
        <center><button id="playPause" class="round_btn" value="0">播放</button></center>\
        <button id="playReset"  onClick="window.location.reload();" class="small_round_btn" value="0">重播</button>\
    ';
    /*
    document.getElementById('rateSlider').addEventListener('input', changeRate);
    document.getElementById('rateSlider').addEventListener('dblclick', changeRateDbl);
    document.getElementById('pitchMinus').addEventListener('click', changePitchShift);
    document.getElementById('pitchPlus').addEventListener('click', changePitchShift);
    */
   document.getElementById('playPause').addEventListener('click', togglePlayback);
   document.getElementById('speedoptions').addEventListener('click', toggleSpeedOptions);
   document.getElementById('hlstype').addEventListener('click', toggleHLSType);   
}

// when the START button is clicked
function start() {
    content.innerText = '创建音频处理器....';
    audioContext = Superpowered.getAudioContext(44100);
    let currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

    Superpowered.createAudioNode(audioContext, currentPath + '/processor.js', 'MyProcessor',
        // runs after the audio node is created
        function(newNode) {
            audioNode = newNode;
            var song_name = decodeURIComponent(getQueryString("name"));
            if ( song_name == null ) {song_name="";};
            content.innerText = '下载曲子"'+song_name +'"...';

            // downloading the music
            let request = new XMLHttpRequest();
            let full_path = 'https://player.fivepiano.com/songs/'+getQueryString("file");

            //request.open('GET', encodeURIComponent('test.mp3'), true);
            request.open('GET', full_path, true);
            request.setRequestHeader("Access-Control-Allow-Origin", "*");            
            request.setRequestHeader("Cache-Control", "public");  
            request.responseType = 'arraybuffer';
            request.onprogress = function(evt) 
            {
               if (evt.lengthComputable) 
               {  
                 var percentComplete = (evt.loaded / evt.total) * 100;  
                 content.innerText = '下载曲子"'+song_name +'"...'+Math.round(percentComplete)+'%';
                 //$('#progressbar').progressbar( "option", "value", percentComplete );
               } 
            } 
            request.onload = function() {
                content.innerText = '解码音频...';
                audioContext.decodeAudioData(request.response, onAudioDecoded);
            }
            request.send();
        },

        // runs when the audio node sends a message
        function(message) {
            if( message.message_type == 'frame_pos' )
            {
                let play_pos = message.frame_pos/message.frame_total;
                document.getElementById('progress').innerHTML='<div style="position: relative;height:40;width:100%;border:solid 0px #EEC286;background-color:gainsboro;"><div style="position:absolute;height:40;width:'+play_pos*100+'%; background-color: #EEC286;text-align:right;">'+Math.round(play_pos*100)+'% </div></div>';
                //console.log('frame_pos message' + play_pos);
            }
        }
    );
}

Superpowered = SuperpoweredModule({
    licenseKey: 'ExampleLicenseKey-WillExpire-OnNextUpdate',
    enableAudioTimeStretching: true,

    onReady: function() {
        content = document.getElementById('content');
        content.innerHTML = '<button id="startButton">开始</button>';
        //document.getElementById('startButton').addEventListener('click', start);
        start();
    }
});
