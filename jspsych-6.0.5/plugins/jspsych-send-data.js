jsPsych.plugins['send-data'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'send-data',
    description: '',
    parameters: {
      target: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Target',
        default: '',
        description: 'Target to send the XHR to'
      },
        fileName: {
          pretty_name: 'File Name',
            type: jsPsych.plugins.parameterType.STRING,
            default: '',
            description: 'data file name'
        },
        content: {
          pretty_name: 'Content',
            type: jsPsych.plugins.parameterType.STRING,
            default: '',
            description: 'data-file content'
        },
        sending: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Sent',
            default: 'We\'re making sure that your response was received, please wait.',
            description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
        timeLimit: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Time Limit',
            default: 60,
        },
        maxTrials: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Time Limit',
            default: 20,
        },
        error: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Sent',
            default: 'There was an error while attempting to save your data. Please contact us.',
            description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
        wait: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Gap',
            default: 3000,
            description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
        demanded_retries: {
            type: jsPsych.plugins.parameterType.STRING,
            default: 3,
            description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
    sent: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Sent',
            default: 'Your response was sent.<br>Press the button below to continue.',
            description: 'HTML formatted string to display at the top of the page above all the questions.'
    },
    loadingText: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '<div class="send-data-text">We\'re making sure your response was recorded, please wait.</div>',
        description: 'The text to show while loading'
    },
    successText :{
        type: jsPsych.plugins.parameterType.STRING,
        default: '<div class="send-data-text">Your response was recorded.</div>',
        description: 'The text to show if the xhr was received'
    },
    failedText: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '<div class="send-data-text">There was an error.<br>' +
            'If you know of a problem in your internet connection that may have caused it,<br>please try to fix it and press the "retry" button.<br>' +
            'Otherwise, please press the "Continue" button and contact the researcher via the prolific system.</div>',
        description: 'The text to show if xhr failed'
    },
    noConnectionText: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '<div class="send-data-text">It seems like there is a problem with your internet connection.<br>Please try fixing it and then press the "Retry" button below.</div>',
        description: 'The text to show if the user is not connected'
    },
        noConnectionTextProceed: {
            type: jsPsych.plugins.parameterType.STRING,
            default: '<div class="send-data-text">It seems like there is a problem with your internet connection.<br>Please try fixing it and then press the "Retry" button below.<br>If you cannot find any problem, please press the "Continue" button and contact the researcher.</div>',
            description: 'The text to show if the user is not connected and they\'re allowed to proceed'
        }
  }
  };

     plugin.trial = function(display_element, trial) {
         var retries = 0;
         var failCounter = 0;
         var timeLimit = trial.timeLimit * 1000;
         var timer = setTimeout(sendFailed, timeLimit);
         var style = document.createElement('style');
         style.innerHTML = '' +
             '.lds-ring {' +
             '  display: inline-block;' +
             '  position: relative;' +
             '  width: 64px;' +
             '  height: 64px;' +
             '}' +
             '.lds-ring div {' +
             '  box-sizing: border-box;' +
             '  display: block;' +
             '  position: absolute;' +
             '  width: 51px;' +
             '  height: 51px;' +
             '  margin: 6px;' +
             '  border: 6px solid #000000;' +
             '  border-radius: 50%;' +
             '  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;' +
             '  border-color: #000000 transparent transparent transparent;' +
             '}' +
             '.lds-ring div:nth-child(1) {' +
             '  animation-delay: -0.45s;' +
             '}' +
             '.lds-ring div:nth-child(2) {' +
             '  animation-delay: -0.3s;' +
             '}' +
             '.lds-ring div:nth-child(3) {' +
             '  animation-delay: -0.15s;' +
             '}' +
             '@keyframes lds-ring {' +
             '  0% {' +
             '    transform: rotate(0deg);' +
             '  }' +
             '  100% {' +
             '    transform: rotate(360deg);' +
             '  }' +
             '}' +
             '' +
             '.success-circ {' +
             '  height: 0px;' +
             '  width: 0px;' +
             '  font-size: 0px;' +
             '  color: #ffffff;' +
             '  background-color: #39e600;' +
             '  border-radius: 50%;' +
             '  display: inline-block;' +
             '  transition: all .3s linear;' +
             '}' +
             '.failed-circ {' +
             '  height: 0px;' +
             '  width: 0px;' +
             '  font-size: 0px;' +
             '  color: #ffffff;' +
             '  background-color: #e60000;' +
             '  border-radius: 50%;' +
             '  display: inline-block;' +
             '  transition: all .3s linear;' +
             '}' +
             '.connection-circ {' +
             '  height: 0px;' +
             '  width: 0px;' +
             '  font-size: 0px;' +
             '  color: #ffffff;' +
             '  background-color: #ffd11a;' +
             '  border-radius: 50%;' +
             '  display: inline-block;' +
             '  transition: all .3s linear;' +
             '}' +
             '.send-data-text {' +
             '  margin: 0;' +
             '  position: relative;' +
             '  top: 50%;' +
             '  left: 50%;' +
             '  -ms-transform: translate(-50%, -50%);' +
             '  transform: translate(-50%, -50%);'+
             '  }'
         ;
         display_element.appendChild(style);
         var desc = document.createElement('div');
         desc.setAttribute('id', 'send-data-desc');
         desc.setAttribute('style', 'text-align: center; min-height: 80px; height:auto; margin: 50px 0 0 0;');
         var animation = document.createElement('div');
         animation.setAttribute('id', 'send-data-animation');
         animation.setAttribute('style', 'text-align: center; height: 64px; margin: 20px 0 0 0;');
         var retryButton = document.createElement('button');
         retryButton.setAttribute('class', 'jspsych-btn');
         retryButton.setAttribute('style', 'width: 90px; height: 40px; font-size: 15px; margin: 0 0 10px 10px;');
         retryButton.innerHTML = 'Retry';
         retryButton.addEventListener('click', function () {
             startLoading();
             sendNewXHR();
             retries++;
         });
         var continueButton = document.createElement('button');
         continueButton.setAttribute('class', 'jspsych-btn');
         continueButton.setAttribute('style', 'width: 90px; height: 40px; font-size: 15px; margin: 0 0 10px 10px;');
         continueButton.innerHTML = 'Continue';
         continueButton.addEventListener('click', function () {
             display_element.innerHTML = '';
             jsPsych.finishTrial();
         });
         var buttonsDiv = document.createElement('div');
         buttonsDiv.setAttribute('style', 'text-align: center; height: 80px')
         var loadingAnimation = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
         var finishedAnimation = document.createElement('div');
         finishedAnimation.setAttribute('id', 'finished-circ')
         display_element.appendChild(animation);
         display_element.appendChild(desc);
         display_element.appendChild(buttonsDiv);
         function startLoading() {
             finishedAnimation.style.width = '0px';
             finishedAnimation.style.height = '0px';
             finishedAnimation.style['font-size'] = '0px';
             animation.innerHTML = loadingAnimation;
             desc.innerHTML = trial.loadingText;
             buttonsDiv.innerHTML = '';
         }
         function sendFailed() {
             clearTimeout(timer);
             setTimeout(function () {
                 finishedAnimation.setAttribute('class', 'failed-circ')
             finishedAnimation.innerHTML = '<div style="margin:0; transform: translate(0, 55%);"><b>&#10008;</b></div>';
             animation.innerHTML = '';
             animation.appendChild(finishedAnimation);
                 buttonsDiv.appendChild(continueButton);
                 buttonsDiv.appendChild(retryButton);
                 setTimeout(function () {
                 desc.innerHTML = trial.failedText;
                 finishedAnimation.style.width = '64px';
                 finishedAnimation.style.height = '64px';
                 finishedAnimation.style['font-size'] = '50px';
             }, 200);}, 1000);
         }
         function success() {
             clearTimeout(timer);
             setTimeout(function () {finishedAnimation.setAttribute('class', 'success-circ')
             finishedAnimation.innerHTML = '<div style="margin:0; transform: translate(0, 60%)"><b>&#10003;</b></div>';
             animation.innerHTML = '';
             animation.appendChild(finishedAnimation);
                 buttonsDiv.appendChild(continueButton);
                 setTimeout(function () {
                 desc.innerHTML = trial.successText;
                finishedAnimation.style.width = '64px';
                finishedAnimation.style.height = '64px';
                finishedAnimation.style['font-size'] = '50px';
             }, 200);}, 1000);
         }
         function internetError() {
             clearTimeout(timer);
             setTimeout(function () {finishedAnimation.setAttribute('class', 'connection-circ');
                 finishedAnimation.innerHTML = '<div style="margin:0; transform: translate(0, 60%)"><b>!</b></div>';
                 animation.innerHTML = '';
                 var textToShow = trial.noConnectionText;
                 animation.appendChild(finishedAnimation);
                 buttonsDiv.appendChild(retryButton);
                 if (retries >= trial.demanded_retries) {
                     buttonsDiv.appendChild(continueButton);
                     textToShow = trial.noConnectionTextProceed;
                 }
                 setTimeout(function () {
                     desc.innerHTML = textToShow;
                     finishedAnimation.style.width = '64px';
                     finishedAnimation.style.height = '64px';
                     finishedAnimation.style['font-size'] = '50px';
                 }, 200);}, 1000);
         }
         var sendNewXHR = function () {
             if(!navigator.onLine) {
                 internetError();
                 timer = null;
                 return;
             }
             if (timer == null) {
                 timer = setTimeout(sendFailed, timeLimit);
             }
             var xhr = new XMLHttpRequest();
             xhr.open('POST', trial.target);
             xhr.setRequestHeader('Content-Type', 'application/json');
             xhr.send(JSON.stringify({filename: trial.fileName, filedata: trial.content}));
             xhr.onload = function () {
                 if (xhr.status != 200) { // analyze HTTP status of the response
                     if (failCounter >= trial.maxTrials) {
                         sendFailed();
                     }
                     else{setTimeout(sendNewXHR, trial.wait);
                     failCounter++;}
                 } else {
                     success();
                 }
             };
             xhr.onerror = function() {
                 if (failCounter >= trial.maxTrials) {
                     sendFailed();
                 }
                 else{setTimeout(sendNewXHR, trial.wait);
                 failCounter++;}
             };
         };
         startLoading();
         sendNewXHR();
     };
     return plugin;
})();
