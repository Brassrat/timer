
var timerBackground = 'black';

function Button(aId, aColor, aDuration, aSound, aRepeat) {
  var _id = aId;
  var _color = aColor;
  var _duration = aDuration;
  var _sound = aSound;
  var _played = false;
  var _audio;
  var _element;
  var _repeat = aRepeat || 1;
  return {
    id: function () {
      return _id
    },
    element: function () {
      return _element
    },
    setElement: function () {
      _element = document.getElementById(_id);
      return _element;
    },
    play: function(count) {
      if (_sound && !_audio) {
        _audio = new Audio('sound/' + _sound + '.wav');
      }
      if (_audio) {
        var ct = count || 1;
        if (ct > 1) {
          _audio.addEventListener("ended",
            function ended() {
              if (--ct > 0) {
                _audio.play();
              } else {
                _audio.removeEventListener("ended", ended, false);
              }
            }, true);
        }
        _played = true;
        _audio.play();
      }
    },
    playOnce: function() {
      if (!_played) {
        var audio = new Audio('sound/' + 'clap' + '.wav');
        audio.play();
        this.play(1);
      }
    },
    color: function () {
      return _color
    },
    duration: function () {
      return _duration
    },
    repeat: function () {
      return _repeat
    }
  }
}

const buttons = function(){
  // TODO load from config file??
  return {
    red: Button('red', 'red', 5, 'clap', 1),
    orange: Button('orange', 'orange', 5, 'chimes', 1),
    yellow: Button('yellow', 'yellow', 5, 'moo', 1),
    green: Button('green', 'green', 10, 'beep', 4),
    blue: Button('blue', 'blue', 10, 'drumroll', 1)
    //indigo: Button('indigo', 'indigo', 5, 'drop', 5)
    //violet: Button('violet', 'violet', 5, 'GLASS', 5)
  }
}();

function getTimeRemaining(endtime) {
  var t = endtime - Date.now();
  var seconds = Math.floor(((t + 500) / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

var timeinterval;
var daysDiv;
var dayText;
var hourDiv;
var hourText;
var minuteDiv;
var minuteText;
var secondDiv;
var secondText;
var endtime;

var zero = '&nbsp;';

function updateDigits(div, elem, value, off) {
  if (div && elem) {
    elem.innerHTML = (value > 0) ? (value >= 10 ? '' + value : zero + value) : (off ? off : zero + zero);
  }
}

function colorBar(btn, barId) {
  var elem = document.getElementById('bar' + barId);
  if (elem) {
    elem.innerHTML='&nbsp';
    elem.style.backgroundColor = btn.color();
    elem.style.visibility="visible";
    elem.style.display="";
  }
}

function colorBars(btn, t) {
  if (btn)
  {
    document.getElementById('barRow').style.visibility="visible";
    document.getElementById('barRow').style.display="";
    if ((t.days > 0) || (t.hours > 0) || (t.minutes > 0) || (t.seconds > 0)) {
      for (var ii = 0; ii < 10; ++ii) {
        if ((t.days > 0) || (t.hours > 0) || (t.minutes > 0) || (t.seconds > ii)) {
          colorBar(btn, 1 + ii);
        }
        else {
          unColorBar(1+ii);
        }
      }
    }
  }
}
function unColorBar(barId)
{
  var elem = document.getElementById('bar' + barId);
  if (elem) {
    elem.style.color = timerBackground;
    elem.style.backgroundColor = timerBackground;
  }
}

function unColorBars() {
  document.getElementById('barRow').style.visibility="hidden";
  document.getElementById('barRow').style.display="none";
  for (var ii = 0; ii < 10; ++ii) {
    unColorBar(1+ii);
  }
}

var activeButton;

function updateClock() {
  var t = getTimeRemaining(endtime);
  updateDigits(daysDiv, dayText, t.days, '');
  updateDigits(hourDiv, hourText, t.hours, '');
  updateDigits(minuteDiv, minuteText, t.minutes, '');
  updateDigits(secondDiv, secondText, t.seconds, '');
  if ((t.days <= 0) && (t.hours <= 0) && (t.minutes <= 0) && (t.seconds <= 10)) {
    for (var ii = 10; ii > t.seconds; --ii) {
      unColorBar(ii);
    }
  }
  if (t.total <= 0) {
    stopTimer(activeButton);
  }
  return t;
}

function disableButtons(state) {
  for (var key in buttons) {
    if (buttons.hasOwnProperty(key)) {
      var elem = buttons[key].element();
      if (elem) { elem.disabled = state; }
    }
  }
}

function disableDigit(digits) {
  if (digits) {
    digits.innerHTML = zero + zero
  }
}
function disableDigits() {
  disableDigit(dayText);
  disableDigit(hourText);
  disableDigit(minuteText);
  disableDigit(secondText);
}

function stopTimer(btn) {
  clearInterval(timeinterval);
  if (btn) { btn.play(btn.repeat()); }
  disableButtons(false);
  disableDigits();
  document.getElementById('barRow').style.visibility="hidden";
  document.getElementById('barRow').style.display="none";
}

function colorDigit(digits, cc) {
  if (digits) {
    digits.style.color = cc;
  }
}

function colorDigits(btn) {
  var cc = btn ? btn.color() : timerBackground;
  colorDigit(dayText, cc);
  colorDigit(hourText, cc);
  colorDigit(minuteText, cc);
  colorDigit(secondText, cc);
}

//var startSound = new Audio('sound/' + 'beep' + '.wav');

function startCountDown(id) {
  activeButton = buttons[id];
  if (activeButton) {
    disableButtons(true);
    activeButton.playOnce();
    endtime = Date.now() + (activeButton.duration() * 1000);
    colorDigits(activeButton);
    colorBars(activeButton, updateClock());
    timeinterval = setInterval(updateClock, 1000);
  }
}

window.onload = function () {
  secondDiv = document.getElementById('secondDiv');
  secondText = document.getElementById('second');
  document.getElementById('stuff').innerText = 'HELLO ELLIOT';
  document.getElementById('timer').style.visibility = 'visible';
  for (var key in buttons) {
    if (buttons.hasOwnProperty(key)) {
      var button = buttons[key];
      var elem = button.setElement();
      if (elem) {
        elem.innerHTML = '' + button.duration();
        elem.style.backgroundColor = button.color();
      }
    }
  }
  disableButtons(false);
  disableDigits();
  unColorBars();
};

// vim: sw: 2 ts: 2 :
