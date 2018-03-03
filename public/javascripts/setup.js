/*!
* getusermedia-js
* v1.0.0 - 2015-12-20
* https://github.com/addyosmani/getUserMedia.js
* (c) Addy Osmani; MIT License
*/ !(function(
	a,
	b
) {
	"use strict";
	a.getUserMedia = function(c, d, e) {
		if (void 0 !== c)
			if (
				((navigator.getUserMedia_ =
					navigator.getUserMedia ||
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia),
				navigator.getUserMedia_)
			) {
				var f,
					g,
					h,
					i,
					j,
					k = {},
					l = "";
				c.video === !0 && ((k.video = !0), (l = "video")),
					c.audio === !0 &&
						((k.audio = !0), "" !== l && (l += ", "), (l += "audio")),
					(f = b.getElementById(c.el)),
					(g = b.createElement("video")),
					(i = parseInt(f.offsetWidth, 10)),
					(j = parseInt(f.offsetHeight, 10)),
					c.width < i && c.height < j && ((c.width = i), (c.height = j)),
					(g.width = c.width),
					(g.height = c.height),
					(g.autoplay = !0),
					f.appendChild(g),
					(h = g),
					(c.videoEl = h),
					(c.context = "webrtc");
				try {
					navigator.getUserMedia_(k, d, e);
				} catch (m) {
					try {
						navigator.getUserMedia_(l, d, e);
					} catch (n) {
						return;
					}
				}
			} else if (void 0 === c.noFallback || c.noFallback === !1) {
				var o, p, q;
				(o =
					'<!--[if IE]><object id="XwebcamXobjectX" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' +
					c.width +
					'" height="' +
					c.height +
					'"><param name="movie" value="' +
					c.swffile +
					'" /><![endif]--><!--[if !IE]>--><object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="' +
					c.swffile +
					'" width="' +
					c.width +
					'" height="' +
					c.height +
					'"><!--<![endif]--><param name="FlashVars" value="mode=' +
					c.mode +
					"&amp;quality=" +
					c.quality +
					'" /><param name="allowScriptAccess" value="always" /></object>'),
					(p = b.getElementById(c.el)),
					(p.innerHTML = o),
					(function r(f) {
						(q = b.getElementById("XwebcamXobjectX")),
							void 0 !== q.capture
								? ((c.capture = function(a) {
										try {
											return q.capture(a);
										} catch (b) {}
								  }),
								  (c.save = function(a) {
										try {
											return q.save(a);
										} catch (b) {}
								  }),
								  (c.setCamera = function(a) {
										try {
											return q.setCamera(a);
										} catch (b) {}
								  }),
								  (c.getCameraList = function() {
										try {
											return q.getCameraList();
										} catch (a) {}
								  }),
								  (c.context = "flash"),
								  (c.onLoad = d))
								: 0 === f ? e() : a.setTimeout(r, 1e3 * (4 - f), f - 1);
					})(3);
			}
	};
})(this, document);

var recorderInst;
var finalBlobAudio;

$(".record-action").click(function() {
	if ($(this).hasClass("recording")) {
		try {
			$(this)
				.removeClass("recording")
				.addClass("record-btn");
			recorderInst.stop();
		} catch (e) {
			alert(e.message);
		}
	} else {
		$(this)
			.removeClass("record-btn")
			.addClass("recording");
		try {
			startRecording();
		} catch (e) {
			alert(e.message);
		}
	}
});

function startRecording() {
	function createAudioElement(blobUrl) {
		const downloadEl = document.createElement("a");
		downloadEl.style = "display: block";
		downloadEl.innerHTML = "download";
		downloadEl.download = "audio.webm";
		downloadEl.href = blobUrl;
		const audioEl = document.createElement("audio");
		audioEl.controls = true;
		const sourceEl = document.createElement("source");
		sourceEl.src = blobUrl;
		sourceEl.type = "audio/webm";
		audioEl.appendChild(sourceEl);
		$(".player").html(audioEl);
		//document.body.appendChild(audioEl);
		//document.body.appendChild(downloadEl);
	}

	// request permission to access audio stream
	getUserMedia(
		{
			audio: true,
			el: "webcam",
			video: false,
			mode: "callback"
		},
		stream => {
			// store streaming data chunks in array
			const chunks = [];
			// create media recorder instance to initialize recording

			recorderInst = new MediaRecorder(stream);
			// function to be called when data is received
			recorderInst.ondataavailable = e => {
				// add stream data to chunks
				chunks.push(e.data);
				// if recorder is 'inactive' then recording has finished
				if (recorderInst.state == "inactive") {
					console.log("heheheheh");
					// convert stream data chunks to a 'webm' audio format as a blob
					const blob = new Blob(chunks, { type: "audio/webm" });
					finalBlobAudio = blob;
					// convert blob to URL so it can be assigned to a audio src attribute
					createAudioElement(URL.createObjectURL(blob));
				}
			};
			// start recording with 1 second time between receiving 'ondataavailable' events
			recorderInst.start(500);
			// setTimeout to stop recording after 4 seconds
			// setTimeout(() => {
			//     // this will trigger one final 'ondataavailable' event and set recorder state to 'inactive'
			//     recorder.stop();
			// }, 5000);
		},
		err => console.log(err)
	);
}

var blobToBase64 = function(blob, cb) {
	var reader = new FileReader();
	reader.onload = function() {
		var dataUrl = reader.result;
		var base64 = dataUrl.split(",")[1];
		cb(base64);
	};
	reader.readAsDataURL(blob);
};

$(".schedule-btn").click(function() {
	blobToBase64(finalBlobAudio, function(base64) {
		// encode
		var update = { blob: base64 };
		$.post("/setup/configure",update).done(function(data) {
			console.log(data);
        });
        
	
	});

	// var fd = new FormData();
	// fd.append("fname", "test.wav");
	// fd.append("data", finalBlobAudio);
	// $.ajax({
	// 	type: "POST",
	// 	url: "/setup/configure",
	// 	data: fd,
	// 	processData: false,
	// 	contentType: false
	// }).done(function(data) {
	// 	console.log(data);
	// });
});
