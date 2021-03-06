/**!
 * File audio-synthesis.js
 */
var synth                  = null;
var frequencyRange         = { min: 0, max: 1200 };
var part                   = new Tone.Part();
var notes                  = [];
var duration               = 0;
var oscillatorTypeName     = null;

var oscillatorTypeDropdown = document.getElementById('oscillator-type-dropdown');
var oscillatorsType        = Array.prototype.slice.call(oscillatorTypeDropdown.getElementsByClassName('link'));
var oscillatorTypeLabel    = document.getElementById('current-oscillator-type-output');

var sequenceContainer      = document.getElementById('resulted-sequence');

var playButton             = document.getElementById('playSound');

var transposeSlider        = document.getElementById('transpose');
var transpose              = transposeSlider.value;
var transposeOutput        = document.getElementById('transposeOutput');

var totalTimeLabel         = document.getElementById('total-time');
// Detect change in oscillator type dropdown
oscillatorsType.forEach( function( oscillator ) {

 		oscillator.addEventListener('click', function(e){

 			  var oscillatorTypeName = this.getAttribute('data-oscillator');
        oscillatorTypeLabel.innerHTML = oscillatorTypeName;

    }, false);
});

// Set a default oscillator if no one is choosed
if( !oscillatorTypeName ) {

  oscillatorTypeName = 'pwm';
  oscillatorTypeLabel.innerHTML = oscillatorTypeName;

}
function stopPart() {
  Tone.Transport.stop();
  console.log('stopPart() used');
}

function play_button_behaviour(state) {

  if( state == 'stopped' ) {

    playButton.dataset.state = 'start';
    playButton.innerHTML = '<span class="play"></span> Play';

  } else if( state == 'started' ) {

    playButton.dataset.state = 'stop';
    playButton.innerHTML = '<span class="stop"></span> Stop';
    part.start();
  }
}
// Fire play function or stop on click event on play/stop button
playButton.addEventListener('click', function(e) {

  if( playButton.dataset.state == 'start' ) {

    Tone.Transport.stop();
    play_sound();
    play_button_behaviour('started');

  } else if( playButton.dataset.state == 'stop' ) {

    part.stop(0);
    Tone.Transport.stop(0);
    play_button_behaviour('stopped');
  }

});
// Change sequence frequency value when user change the transpose value
transposeSlider.addEventListener('input', function() {

    Tone.Transport.stop();
		transpose = Number(transposeSlider.value);
    transposeOutput.innerHTML = transpose;


}, false);

// Build or rebuild the sound
transposeSlider.addEventListener('mouseup', function() {
    make_sound();
});

// Init the synth and load sequence into `notes`
function make_sound() {

    sequenceContainer.innerHTML = '';
    for ( var n = 1; n < transmitanceHit.length; n++ ) {

      var time =  Math.round(1000*transmitanceHit[n].transmitance)/1000;
      duration = duration + time;
    }
    if( duration > 1.99 ) {
      totalTimeLabel.innerHTML = duration + ' <span>seconds</span>';
    } else {
      totalTimeLabel.innerHTML = duration + ' <span>second</span>';
    }

    for ( var n = 1; n < transmitanceHit.length; n++ ) {

        // Transmitance value is use to mode note duration
        // we have to round it for better performance
        var time =  (Math.round(1000*transmitanceHit[n].transmitance * stepDurationFactor)/1000);
        // Change the frequency value according to transpose value
        // 1 octave = 20hertz

        var finalNote = transmitanceHit[n].frequency + ( transpose * 360);
        var note = {
          'pitch_octave_note': new Tone.Frequency(finalNote, 'midi').toNote(),
          'frequency_note': finalNote,
          'time': time
        };
        // console.log( note.frequency_note + ' => ' + finalNote );
        var visualNote = document.createElement('span');
        visualNote.id = 'note-' + n;
        visualNote.innerHTML = note.frequency_note;
        visualNote.style.width = ((note.time / duration) * 100) + '%';

        sequenceContainer.appendChild( visualNote );

        notes.push(note);
    }
}

// Play sound and change the background color
// of played note into sequenceContainer
function play_sound() {
  synth = new Tone.MonoSynth({
      'oscillator' : {
        'type' : oscillatorTypeName,
        'count' : 3,
        'spread' : 30
      },
      'envelope': {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0.5,
        'release': 0.4,
        'attackCurve' : 'exponential'
      },
    }).toMaster();
    // Remove played class in case of replay
    var everyVisualNotes = Array.prototype.slice.call(sequenceContainer.getElementsByTagName('span'));
    everyVisualNotes.forEach( function(visualNote){
        visualNote.classList = '';
    });

    var now = Tone.now();
    var currentTime = now;
    var currentNote = 1;

    part = new Tone.Part( function(time, note) {

      // Highlight the current note on the sequence container
      var playedNoteId = 'note-' + currentNote;
      var playedNote = document.getElementById(playedNoteId);

      if( playedNote && playButton.dataset.state == 'stop') {

          playedNote.classList = 'played';

          // Trigger the note with the synth
          synth.triggerAttackRelease(note.frequency_note, (time + note.time), time, .15);

          // Loop through every note
          currentTime = currentTime + note.time;
          currentNote++;

      }
      Tone.Transport.schedule(function(time){
        	//use the time argument to schedule a callback with Tone.Draw
        	Tone.Draw.schedule(function(){

            play_button_behaviour('stopped');

        	}, time)
      }, time);

    }, notes);

    // part.loop = 8;
    // part.humanize = 'true';
    // part.stop(now + duration);

    Tone.Transport.start();
}

/**!
 * File: dropdown.js
 */

var dropdowns =  Array.prototype.slice.call(document.getElementsByClassName('dropdown-button'));

dropdowns.forEach(function( dropdown ) {

    var links = Array.prototype.slice.call(document.getElementsByClassName('link'));

    dropdown.addEventListener('click', function(e){

        e.preventDefault();
        var targetId = this.parentElement.id;
        document.getElementById(targetId).classList.toggle('active');
        stopPart();

    }, false);

    links.forEach(function( link ) {

        link.addEventListener('click', function(e){

            e.preventDefault();
            var targetId = this.parentElement.parentElement.parentElement.parentElement.id;
            document.getElementById(targetId).classList.remove('active');

        });
    });
});

/**!
 * File light-synthesis.js
 */

var canvasWrapper = document.getElementById('canvas-3d-wrapper');
var canvasWidth = canvasWrapper.clientWidth;
var canvasHeight = canvasWrapper.clientHeight;
/*
var loader = new THREE.FileLoader();
loader.load( 'data/json/app.json', function ( text ) {

		var player = new APP.Player();
		player.load( JSON.parse( text ) );
		player.setSize( canvasWidth, canvasHeight );
		player.play();

		canvasWrapper.appendChild( player.dom );


} );
*/
var camera, scene, renderer;
var lights = [];
var lightsPositions = [
	[ 3, 3.4, -23], [ -7, 3.4, -23],
	[ 3, 3.4, -16.6], [ -7, 3.4, -16.6],
	[ 3, 3.4, -9.7], [ -7, 3.4, -9,7],
	[ 3, 3.4, -3.2], [ -7, 3.4, -3.2],
	[ 3, 3.4, 3.2], [ -7, 3.4, 3.2],
	[ 3, 3.4, 9.7],	[ -7, 3.4, 9,7]];
init();
animate();

function init() {

		camera = new THREE.PerspectiveCamera( 45, canvasWidth / canvasHeight, 1, 2000 );
		camera.position.set( 1.48, 1, 12 );

		// scene
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xffffff, 0.5, 40);

		for( var i = 0; i < lightsPositions.length; i++) {

			lights[i] = new THREE.PointLight( 0xffffff, Math.random(0, .5), 0 );
			lights[i].position.set( lightsPositions[i][0], lightsPositions[i][1], lightsPositions[i][2]);
			scene.add( lights[i] );
		}

		// BEGIN Clara.io JSON loader code
		var objectLoader = new THREE.ObjectLoader();

		objectLoader.load("data/json/room-model.json", function ( object ) {
				//object.scale.set(5, 5, 5);
				object.receiveShadow = true;
				object.castShadow = true;
				scene.add( object );
		} );
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( canvasWidth, canvasHeight );
		canvasWrapper.appendChild( renderer.domElement );

		window.addEventListener( 'resize', function () {
				renderer.setSize( canvasWidth, canvasHeight );
		} );
}

function animate() {
		for(var i = 0; i < lights.length; i++ ){
			lights[i].power = Math.random(0, 1);
		}
		requestAnimationFrame( animate );
		render();
}
function render() {
		//camera.lookAt( scene.position );
		renderer.render( scene, camera );
}

/**
 * Infrared spectrum reinterpretation
 *
 * @link https://github.com/nclslbrn/infrared-spectrum-reinterpretation
 * @author Nicolas Lebrun
 * @license MIT
 * @version 1.0.0
 */

var moleculeIrData = new Array();
var transmitanceHit = [];
var moleculeDropdown = document.getElementById('molecule-dropdown');
var molecules_entry = Array.prototype.slice.call(moleculeDropdown.getElementsByClassName('link'));

var transmitanceThresholdSlider = document.getElementById('transmitanceThreshold');
var transmitanceThreshold = transmitanceThresholdSlider.value / 1000;
var transmitanceThresholdOutput = document.getElementById('transmitanceThresholdOutput');

var stepDurationFactorSlider = document.getElementById('stepDurationFactor');
var stepDurationFactor = stepDurationFactorSlider.value / 10;
var stepDurationFactorOutput = document.getElementById('stepDurationFactorOutput');

// If a molecule is selected load the file
molecules_entry.forEach( function( molecule ) {

		molecule.addEventListener('click', function(e){

			  var file = this.getAttribute('data-file');
				// reinit html markup
				document.getElementById('canvas-wrapper').innerHTML = "";
				document.getElementById('data-comments').innerHTML = "";

				get_JDX_data(file,  filter_JDX_data);
				getTransmitanceHit();
				make_sound();

		}, false);
});

// Return input range value
// 1. Transmitance threshold
transmitanceThresholdSlider.addEventListener('input', function() {
		transmitanceThreshold = transmitanceThresholdSlider.value / 1000;
    transmitanceThresholdOutput.innerHTML = transmitanceThreshold;

}, false);
transmitanceThresholdSlider.addEventListener('mouseup', function() {
		getTransmitanceHit();
		make_sound();
});

// 2. Step duration factor
stepDurationFactorSlider.addEventListener('input', function() {

		stepDurationFactor = stepDurationFactorSlider.value / 10;
    stepDurationFactorOutput.innerHTML = stepDurationFactor;

}, false);

stepDurationFactorSlider.addEventListener('mouseup', function() {
    make_sound();
});


// Gt the content of the .jdx file
get_JDX_data = function loadJDX(filePath, success, error) {

		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType('text/plain');
		xhr.onreadystatechange = function() {

				if (xhr.readyState === XMLHttpRequest.DONE) {
						if (xhr.status === 200) {
								if (success)
										success(xhr.responseText);
				} else {
						if (error)
								error(xhr);
						}
				}

		};
		xhr.open("GET", filePath, true);
		xhr.send();

}

// Load a default file
// Usefull for development
get_JDX_data('data/jdx/7732-18-5-IR.jdx',  filter_JDX_data);

// Filter the source file
function filter_JDX_data(data) {

		moleculeIrData = new Array();
	  //split raw text by line
	  var lines = data.split( "\n" );

	  // loop throught each line (-1 = don't get the last blank line)
	  for( var n = 0; n < lines.length - 1; n++ ) {

				//Line is not empty
				if( typeof(lines[n]) !== undefined && lines[n] !== '') {

						// Check if first character of the line
						var firstChar = lines[n].charAt(0);

				    // is a number, so it is not a comment
				    if( firstChar % 1 === 0 ) {

								var data_column = lines[n].split(" ");

								// Store data in global var
								moleculeIrData.push({
									frequency: parseFloat(data_column[0]),
									value: parseFloat(data_column[1])
								});

				    } else {

					      // Show data origin and comments
					      var container = document.getElementById('data-comments');
								var modal 		= document.getElementById('comment-source-file-modal');
								var extract 	= document.createElement('p');
								var content 	= document.createElement('p');

								// But delete the two first # before adding to the html markup
								if( firstChar == "#" ) {

										if( n < 9 ) {
												extract.innerHTML = lines[n].substring(2);
										}

										content.innerHTML = lines[n].substring(2);


								} else {

										if( n < 9 ) {
												extract.innerHTML = lines[n].substring(2);
										}

										content.innerHTML = lines[n];

								}
					      container.append( extract );
								modal.appendChild( content );
				    }
				}
	  }
		// Once the whole document is parsed

		//get transmitance hit (depends to threshold slider value)
		getTransmitanceHit();

		// fire our function to make a chart
		chart_this( moleculeIrData );

		// fire our function to make sound
		make_sound();

		// fire our function to make 3D
}


function getTransmitanceHit() {

		var ir_data = Array.prototype.slice.call(moleculeIrData);
		// reinit var
		transmitanceHit = [];

		for ( var n = 1; n < ir_data.length; n++ ) {

	      if(
	        ir_data[n].value  > ( ir_data[n-1].value + transmitanceThreshold )
	        ||
	        ir_data[n].value  < ( ir_data[n-1].value - transmitanceThreshold )
	      ) {

					var hit = {
						transmitance: ir_data[n].value,
						frequency: Math.round(ir_data[n].frequency)
					};

					transmitanceHit.push( hit );

				}
		}

		return transmitanceHit;
}

/**!
 * File: modal.js
 */

var modalButtons =  Array.prototype.slice.call(document.getElementsByClassName('modal-button'));

modalButtons.forEach(function( button ) {

  button.addEventListener('click', function(e){

      e.preventDefault();
      var modalId = this.getAttribute('data-toggle');
      console.log( modalId );
      var modal = document.getElementById(modalId)
      modal.classList.toggle('active');

  }, false);

});

/**!
 * File: p5_interpreter.js
 */
/*
var container_name = 'canvas-wrapper';
var container = document.getElementById(container_name);
var canvas;

function setup(){
  canvas = createCanvas(container.offsetWidth, 800);
  canvas.parent(container_name);
}

function draw(){
  background(0);

  moleculeIrData.forEach( function( data ) {
    console.log( data.value );
  });
}
*/

/**!
 * File: wavelength.js
 */

function chart_this( moleculeIrData ) {

  var ir_data = Array.prototype.slice.call(moleculeIrData);
  var container = document.getElementById('canvas-wrapper');
  var button = document.getElementsByClassName('button')[0];
  var waveColor = document.defaultView.getComputedStyle( button ,null).getPropertyValue('background-color');

  ir_data.forEach(function(d) {
      d.frequency = d.frequency;
      d.value = d.value;
  });

  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = container.offsetWidth - margin.left - margin.right,
      height = container.offsetHeight - margin.top - margin.bottom;

  var x = d3.scaleLinear().rangeRound([width, 0]);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  var area = d3.area()
      .x(function(d) { return x(d.frequency); })
      .y1(function(d) { return y(d.value); });

  var svg = d3.select("body #canvas-wrapper").insert("svg").attr('class', 'area-chart')
      .datum(ir_data)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " "  + (height + margin.top + margin.bottom ) )
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // gridlines in x axis function
  function make_x_gridlines() {
      return d3.axisBottom(x)
          .ticks(5)
  }

  // gridlines in y axis function
  function make_y_gridlines() {
      return d3.axisLeft(y)
          .ticks(5)
  }
  x.domain([ir_data[0].frequency, ir_data[ir_data.length - 1].frequency]);
  y.domain([0, d3.max(ir_data, function(d) { return d.value; })]);
  area.y0(y(0));
  svg.append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(0))
      .attr("x2", width).attr("y2", y(1))
  .selectAll("stop")
      .data([
        {offset: "0%", color: waveColor },
        {offset: "50%", color: waveColor },
        {offset: "100%", color: waveColor }
      ])
  .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

   // Add the area.
  svg.append("path")
      .data([ir_data])
      .attr("class", "area")
      .attr("d", area);

  svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
        .tickSize(-height)
          .tickFormat("")
      )

   // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .attr("class", "axisWhite")
      .append("text")
      .attr("transform", "translate(" + ( width - 60 ) + ", -10)")
      .attr("class", 'legend')
      .text("Wavelength");
   // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y))
      .attr("class", "axisWhite")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .attr("class", 'legend')
      .text("Transmitance");

}
