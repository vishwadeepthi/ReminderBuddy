var mic, recorder, soundFile;

var state = 0; // mousePress will increment from Record, to Stop, to Play
//var P5 = new p5();
function initializeMic() {
	// create an audio in
	mic = new p5.AudioIn();

	// users must manually enable their browser microphone for recording to work properly!
	mic.start();

	// create a sound recorder
	recorder = new p5.SoundRecorder();

	// connect the mic to the recorder
	recorder.setInput(mic);

	// create an empty sound file that we will use to playback the recording
	soundFile = new p5.SoundFile();
}

function mousePressed() {
	
	// use the '.enabled' boolean to make sure user enabled the mic (otherwise we'd record silence)
	if (state === 0 && mic.enabled) {
		// Tell recorder to record to a p5.SoundFile which we will use for playback
		recorder.record(soundFile);
		console.log("RECORDING");
		state++;
	} else if (state === 1) {
		console.log("STOPED");
		recorder.stop(); // stop recorder, and send the result to soundFile
		state++;
	} else if (state === 2) {
		console.log("SAVED");
		//soundFile.play();
		//return; // play the result!
		saveFile(soundFile, "mySound.wav"); // save file
		state++;
	}
}
function writeUTFBytes(view, offset, string) {
	var lng = string.length;
	for (var i = 0; i < lng; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

function interleave(leftChannel, rightChannel) {
	var length = leftChannel.length + rightChannel.length;
	var result = new Float32Array(length);

	var inputIndex = 0;

	for (var index = 0; index < length; ) {
		result[index++] = leftChannel[inputIndex];
		result[index++] = rightChannel[inputIndex];
		inputIndex++;
	}
	return result;
}

function saveFile(soundFile, name) {
	var leftChannel, rightChannel;
	leftChannel = soundFile.buffer.getChannelData(0);

	// handle mono files
	if (soundFile.buffer.numberOfChannels > 1) {
		rightChannel = soundFile.buffer.getChannelData(1);
	} else {
		rightChannel = leftChannel;
	}

	var interleaved = interleave(leftChannel, rightChannel);

	// create the buffer and view to create the .WAV file
	var buffer = new window.ArrayBuffer(44 + interleaved.length * 2);
	var view = new window.DataView(buffer);

	// write the WAV container,
	// check spec at: https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
	// RIFF chunk descriptor
	writeUTFBytes(view, 0, "RIFF");
	view.setUint32(4, 36 + interleaved.length * 2, true);
	writeUTFBytes(view, 8, "WAVE");
	// FMT sub-chunk
	writeUTFBytes(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	// stereo (2 channels)
	view.setUint16(22, 2, true);
	view.setUint32(24, 44100, true);
	view.setUint32(28, 44100 * 4, true);
	view.setUint16(32, 4, true);
	view.setUint16(34, 16, true);
	// data sub-chunk
	writeUTFBytes(view, 36, "data");
	view.setUint32(40, interleaved.length * 2, true);

	// write the PCM samples
	var lng = interleaved.length;
	var index = 44;
	var volume = 1;
	for (var i = 0; i < lng; i++) {
		view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
		index += 2;
	}
	var fd = new FormData();
	const params = new URLSearchParams(location.search);

	fd.append(
		"audiofile",
		new Blob([new Uint8Array(view.buffer)], { type: "audio/x-wav" }),
		"something.webm"
	);
	fd.append("callid", params.get("callid"));

	$.ajax({
		type: "POST",
		url: "/setup/configure",
		data: fd,
		cache: false,
		processData: false,
		contentType: false
	}).done(function(data) {
		console.log(data);
	});
	///public/recordings/audiofile_27310.wav
	//debugger;
	//p5.prototype.writeFile([view], name, "wav");
}
//Initialize();
$(".test-btn").click(function() {
	//mousePressed();
	// //For making test call.
	// const params = new URLSearchParams(location.search);
	// alert(params.get("callid"));
	// $.ajax({
	// 	type: "POST",
	// 	url: "/setup/configure",
	// 	data: fd,
	// 	cache: false,
	// 	processData: false,
	// 	contentType: false
	// }).done(function(data) {
	// 	console.log(data);
	// });
	//
});

$(".record-action").click(function() {
	if ($(this).hasClass("recording")) {
		try {
			$(this)
				.removeClass("recording")
				.addClass("record-btn");
				
				mousePressed();
				setTimeout(function() {
					mousePressed();
				},500);

		} catch (e) {
			alert(e.message);
		}
	} else {
		$(this)
			.removeClass("record-btn")
			.addClass("recording");
		try {
			initializeMic()
			setTimeout(function() {
				mousePressed();
			},500);
		} catch (e) {
			alert(e.message);
		}
	}
});

$(".schedule-btn").click(function() {
	// blobToBase64(finalBlobAudio, function(base64) {
	// 	// encode
	// 	var update = { blob: base64 };
	// 	$.post("/setup/configure", update).done(function(data) {
	// 		console.log(data);
	// 	});
	// });

	var fd = new FormData();
	const params = new URLSearchParams(location.search);

	fd.append("audiofile", finalBlobAudio, "something.webm");
	fd.append("callid", params.get("callid"));

	$.ajax({
		type: "POST",
		url: "/setup/configure",
		data: fd,
		cache: false,
		processData: false,
		contentType: false
	}).done(function(data) {
		console.log(data);
	});
});
