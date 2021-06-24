/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["cta-radio"] = (function() {

    var plugin = {};
    plugin.info = {
        name: 'cta-radio',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.STRING,
                array: true,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The HTML string to be displayed'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the stimulus.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show trial before it ends.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when subject makes a response.'
            },

        }
    }

    plugin.trial = function(display_element, trial) {

        var new_html = '<div id="jspsych-html-keyboard-response-stimulus"><form>' +
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 768 576" style="max-width: 610px; width:95%; max-height: 95vh; margin: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">' +
            '    <rect height="576" width="768" style="height: 576px; width: 768px; fill: rgb(255,255,255); stroke-width:3px;stroke:rgb(0,0,0)"></rect>' +
            '    <foreignObject x="0"  y="120" width="768px" height="100">' +
            '        <div style="text-align: center; font-size: 50px; font-style: italic; margin-top: 5px;"><b>Decide</b></div>' +
            '    </foreignObject>' +
            '    <foreignObject x="0" y="246" width="768px" height="300">' +
            '        <div>' +
            '           <div style="float: left; font-size: 40px; margin-left: 5%;margin-top: 5px;">' + trial.stimulus[0] + '</div>' +
            '            <div style="float: right; font-size: 40px; margin-right: 5%;margin-top: 5px;">' + trial.stimulus[1] + '</div>' +
            '        </div>' +
            '    </foreignObject>' +
            '    <foreignObject y="220" x="0" height="300" width="768">' +
            '        <div style="font-size:30px; text-align: center;"><b>or</b></div>' +
            '    </foreignObject>' +
            '  <circle cx="58.5" cy="338" r="15" stroke="black" stroke-width="5" /> ' +
            '  <circle cx="711.5" cy="338" r="15" stroke="black" stroke-width="5" /> ' +
            '    <foreignObject y="320" x="0" height="300" width="768">' +
            '        <div>' +
            '            <div style="float: left; font-size: 20px; margin-left: 5%;"><input type="radio" style="width: 30px; height:30px; cursor: pointer;" id="l-option-radio" value="l-option-radio"></div>' +
            //-webkit-appearance: none; -moz-appearance: none; appearance: none; user-select: none;
            // class="myRadioButton"
            //.myRadioButton:hover input ~ .checkmark {  background-color: #ccc;}
            '            <div style="float: right; font-size: 20px; margin-right: 5%;"><input type="radio" style="width: 30px; height:30px; cursor: pointer;" id="r-option-radio" value="r-option-radio"></div>' +
            '        </div>' +
            '    </foreignObject>' +
            '</svg></form>' +
            '</div > ';


        // add prompt
        if (trial.prompt !== null) {
            new_html += trial.prompt;
        }

        // draw
        display_element.innerHTML = new_html;
        var t0 = performance.now();

        let mouse_moves_array_x = []
        let mouse_moves_array_y = []
        let mouse_moves_array_time = []

        const MOUSE_TIMEOUT_MILLISECONDS = 700;
        var mouseTimeOut = setTimeout(() => { mouseIdleHandler() }, MOUSE_TIMEOUT_MILLISECONDS);

        function resetMouseTimeout(func) {
            clearTimeout(mouseTimeOut)
            mouseTimeOut = setTimeout(func, MOUSE_TIMEOUT_MILLISECONDS)
        }


        //What to do when mouse is idle. Should be changed here to alter behaviour.
        function mouseIdleHandler() {
            mouse_id.style.display = "block";
            resetMouseTimeout(mouseIdleHandler)
        }



        function mouseListener(e1) {
            resetMouseTimeout(mouseIdleHandler) //Reset mouse timeout message since it just moved.
            x_cord = e1.pageX;
            y_cord = e1.pageY;
            time_now = Date.now();
            mouse_moves_array_x.push(x_cord);
            mouse_moves_array_y.push(y_cord);
            mouse_moves_array_time.push(time_now);
            //console.log([e1.pageX, e1.pageY]);

        }
        display_element.addEventListener("mousemove", mouseListener);

        // // alerts when mouse not moving for half a second
        // //think how to put it in the right place, then move it to be a text instead of alert.
        // var timeout;
        // display_element.onmousemove = function() {
        //         clearTimeout(timeout);
        //         timeout = setTimeout(function() {
        //             alert("move your mouse");
        //         }, 500);
        //     }
        // store response
        var response = {
            rt: null,
            choice: null
        };

        // function to end trial when it is time
        var end_trial = function() {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();
            clearTimeout(mouseTimeOut)


            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // gather the data to store for the trial
            var trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "choice": response.choice,
                "x_cord": mouse_moves_array_x,
                "y_cord": mouse_moves_array_y,
                "time_cord": mouse_moves_array_time
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };

        // function to handle responses by the subject
        var after_response = function() {

            display_element.removeEventListener("mousemove", mouseListener);
            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';
            response.rt = performance.now() - t0;

            if (trial.response_ends_trial) {
                end_trial();
            }

        };

        display_element.querySelector('#l-option-radio').addEventListener('click', function() {
            setTimeout(function() {
                response.choice = trial.stimulus[0];
                after_response()
            }, 10)
        });
        display_element.querySelector('#r-option-radio').addEventListener('click', function() {
            setTimeout(function() {
                response.choice = trial.stimulus[1];
                after_response()
            }, 10)
        });

        // hide stimulus if stimulus_duration is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }

    };

    return plugin;
})();