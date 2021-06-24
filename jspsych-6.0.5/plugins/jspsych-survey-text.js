/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-text'] = (function() {

    var plugin = {};

    plugin.info = {
        name: 'survey-text',
        description: '',
        parameters: {
            questions: {
                type: jsPsych.plugins.parameterType.COMPLEX,
                array: true,
                pretty_name: 'Questions',
                default: undefined,
                nested: {
                    prompt: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Prompt',
                        default: undefined,
                        description: 'Prompt for the subject to response'
                    },
                    value: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Value',
                        default: "",
                        description: 'The string will be used to populate the response field with editable answer.'
                    },
                    rows: {
                        type: jsPsych.plugins.parameterType.INT,
                        pretty_name: 'Rows',
                        default: 1,
                        description: 'The number of rows for the response text box.'
                    },
                    columns: {
                        type: jsPsych.plugins.parameterType.INT,
                        pretty_name: 'Columns',
                        default: 40,
                        description: 'The number of columns for the response text box.',
                        recommended: {
                            type: jsPsych.plugins.parameterType.STRING,
                            pretty_name: 'Recommended',
                            default: null,
                            description: 'Ask them once to answer this question'},
                        required: {
                            type: jsPsych.plugins.parameterType.BOOL,
                            pretty_name: 'Required',
                            default: false,
                            description: 'Subject will be required to respond each question.'
                        }
                    }
                }
            },
            preamble: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Preamble',
                default: null,
                description: 'HTML formatted string to display at the top of the page above all the questions.'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default:  'Continue',
                description: 'The text that appears on the button to finish the trial.'
            },
            postamble: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Preamble',
                default: null,
                description: 'HTML formatted string to display at the top of the page above all the questions.'
            },
            fullscreen: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Required',
                default: false,
                description: 'Subject will be required to respond each question.'
            }}
    };

    plugin.trial = function(display_element, trial) {

        for (var i = 0; i < trial.questions.length; i++) {
            if (typeof trial.questions[i].rows == 'undefined') {
                trial.questions[i].rows = 1;
            }
        }
        for (var i = 0; i < trial.questions.length; i++) {
            if (typeof trial.questions[i].columns == 'undefined') {
                trial.questions[i].columns = 40;
            }
        }
        for (var i = 0; i < trial.questions.length; i++) {
            if (typeof trial.questions[i].value == 'undefined') {
                trial.questions[i].value = "";
            }
        }

        var html = '';
        // show preamble text
        if(trial.preamble !== null){
            html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';
        }
        // add questions
        for (var i = 0; i < trial.questions.length; i++) {
            html += '<div id="jspsych-survey-text-"'+i+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
            html += '<p class="jspsych-survey-text">' + trial.questions[i].prompt + '</p>';
            if (trial.questions[i].recommended != null || trial.questions[i].required) {
                html += '<div style="color: red; visibility: hidden;" id="jspsych-survey-text-response-msg-'+i+'"></div>';
            }
            var autofocus = i == 0 ? "autofocus" : "";
            if(trial.questions[i].rows == 1){
                html += '<input style="font-size: 20px" type="text" name="#jspsych-survey-text-response-' + i + '" size="'+trial.questions[i].columns+'" value="'+trial.questions[i].value+'" '+autofocus+'"></input>';
            } else {
                html += '<textarea style="font-size: 20px" name="#jspsych-survey-text-response-' + i + '" cols="' + trial.questions[i].columns + '" rows="' + trial.questions[i].rows + '" '+autofocus+'">'+trial.questions[i].value+'</textarea>';
            }
            html += '</div>';
        }

        if (trial.postamble != null) {
            html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.postamble+'</div>';}
        // add submit button
        html += '<button id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text">'+trial.button_label+'</button>';



        display_element.innerHTML = html;

        var recommended = false;

        display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function() {
            // measure response time
            var endTime = (new Date()).getTime();
            var response_time = endTime - startTime;
            var missingRecommended = false;
            var missingRequired = false;

            // create object to hold responses
            var question_data = {};
            var matches = display_element.querySelectorAll('div.jspsych-survey-text-question');
            for(var index=0; index<matches.length; index++){
                var id = "Q" + index;
                var val = matches[index].querySelector('textarea, input').value;
                if (val === '') {
                    if (trial.questions[index].recommended != null && !recommended) {
                        document.getElementById('jspsych-survey-text-response-msg-'+index).style.visibility = 'visible';
                        document.getElementById('jspsych-survey-text-response-msg-'+index).innerHTML = trial.questions[index].recommended;
                        missingRecommended = true;
                    }
                    else if (trial.questions[index].required) {
                        document.getElementById('jspsych-survey-text-response-msg-'+index).style.visibility = 'visible';
                        document.getElementById('jspsych-survey-text-response-msg-'+index).innerHTML = 'You must respond to this question.';
                        missingRequired = true;
                    }
                }
                var obje = {};
                obje[id] = val;
                Object.assign(question_data, obje);
            }
            if (missingRecommended) {
                recommended = true;
                return;
            }
            if (missingRequired) {
                return;
            }

            var keyboardNotAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;
            if (keyboardNotAllowed) {
                // This is Safari, and keyboard events will be disabled. Don't allow fullscreen here.
                // do something else?

            } else if (trial.fullscreen) {
                var element = document.documentElement;
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }
            // save data
            var trialdata = {
                "rt": response_time,
                "responses": JSON.stringify(question_data)
            };
            if (trial.fullscreen) {
                trialdata.fullscreen = !keyboardNotAllowed;
            }

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial(trialdata);
        });

        var startTime = (new Date()).getTime();
    };

    return plugin;
})();
