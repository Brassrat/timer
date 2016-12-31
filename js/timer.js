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
    stopTimer();
  }
  return t;
}

function stopTimer() {
  clearInterval(timeinterval);
  playTone(activeButton);
  disableButtons(false);
  disableDigits();
  document.getElementById('barRow').style.visibility="hidden";
  document.getElementById('barRow').style.display="none";
}

var activeButton;

function playTone(button) {
  if (button) {
    if (button.audio()) {
      for (var ii = 0; ii < button.repeat(); ++ii)
      {
        button.audio().play();
      }
    }
    else {
      alert("NO SOUND for " + button.id());
    }
  }
}

function disableButtons(state) {
  for (var ii = 0; ii < buttons.length; ++ii) {
    buttons[ii].element().disabled = state;
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

function colorDigit(digits, cc) {
  if (digits) {
    digits.style.color = cc;
  }
}

function colorDigits() {
  var cc = activeButton ? activeButton.color() : 'black';
  colorDigit(dayText, cc);
  colorDigit(hourText, cc);
  colorDigit(minuteText, cc);
  colorDigit(secondText, cc);
}

function unColorBar(barId)
{
  var elem = document.getElementById('bar' + barId);
  if (elem) {
    elem.style.color = 'black';
    elem.style.backgroundColor = 'black';
    //elem.style.visibility="hidden";
    //elem.style.display="none";
  }
}

function colorBar(barId)
{
  var elem = document.getElementById('bar' + barId);
  if (elem) {
    elem.innerHTML='&nbsp';
    elem.style.backgroundColor = activeButton.color();
    elem.style.visibility="visible";
    elem.style.display="";
  }
}

function colorBars(t) {
  if (activeButton)
  {
    document.getElementById('barRow').style.visibility="visible";
    document.getElementById('barRow').style.display="";
    if ((t.days > 0) || (t.hours > 0) || (t.minutes > 0) || (t.seconds > 0)) {
      for (var ii = 0; ii < 10; ++ii) {
        if ((t.days > 0) || (t.hours > 0) || (t.minutes > 0) || (t.seconds > ii)) {
          colorBar(1 + ii);
        }
        else {
          unColorBar(1+ii);
        }
      }
    }
  }
}

function unColorBars() {
  document.getElementById('barRow').style.visibility="hidden";
  document.getElementById('barRow').style.display="none";
  for (var ii = 0; ii < 10; ++ii) {
    unColorBar(1+ii);
  }
}

function startCountDown(id) {
  disableButtons(true);
  activeButton = buttons[id];
  endtime = Date.now() + (activeButton.duration() * 1000);
  colorDigits();
  colorBars(updateClock());
  timeinterval = setInterval(updateClock, 1000);
}

function Button(aId, aColor, aDuration, aSound, aRepeat) {
  var id = aId;
  var color = aColor;
  var duration = aDuration;
  var sound = aSound;
  var audio;
  var repeat = aRepeat || 1;
  var element;
  return {
    id: function () {
      return id
    },
    element: function () {
      return element
    },
    setElement: function (elem) {
      element = elem;
      return element;
    },
    audio: function () {
      if (sound && !audio) {
        audio = new Audio('sound/' + sound + '.wav');
      }
      return audio;
    },
    color: function () {
      return color
    },
    duration: function () {
      return duration
    },
    sound: function () {
      return sound;
    },
    repeat: function () {
      return repeat
    }
  }
}

const buttons = {
  red: Button('red', 'red', 5, 'clap', 1),
  orange: Button('orange', 'orange', 5, 'chimes', 1),
  yellow: Button('yellow', 'yellow', 5, 'moo', 1),
  green: Button('green', 'green', 10, 'beep', 5),
  blue: Button('blue', 'blue', 10, 'drumroll', 1)
  //indigo: Button('indigo', 'indigo', 5, 'drop', 5)
  //violet: Button('violet', 'violet', 5, 'beep', 5)
};

window.onload = function () {
  secondDiv = document.getElementById('secondDiv');
  secondText = document.getElementById('second');
  document.getElementById('stuff').innerText = 'HELLO ELLIOT';
  document.getElementById('timer').style.visibility = 'visible';
  for (var key in buttons) {
    if (buttons.hasOwnProperty(key)) {
      var button = buttons[key];
      var elem = button.setElement(document.getElementById(button.id()));
      if (elem) {
        var dd = button.duration();
        elem.innerHTML = '' + dd;
        elem.style.backgroundColor = button.color();
        elem.disabled = false;
      }
    }
  }
  disableDigits();
  unColorBars();
};
