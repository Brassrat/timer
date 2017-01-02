
var timerBackground = 'black';
var is_safari = navigator.userAgent.indexOf("Safari") > -1;

function Button(aId, aColor, aDuration, aSound, aRepeat) {
  var _id = aId;
  var _color = aColor;
  var _duration = aDuration;
  var _sound = aSound;
  var _needLoad = true; //is_safari;
  var _audio;
  var _element;
  var _repeat = aRepeat || 1;
  return {
    id: function () {
      return _id
    },
    element: function () {
      if (!_element) {
        _element = document.createElement("button");
        _element.id = _id;
        _element.className ="start";
        _element.onclick = function() { startTimer(_id); }
        _element.style.backgroundColor = _color;
        _element.innerHTML = '' + _duration;
        _element.style.disabled=true;
      }
      return _element;
    },
    disable: function(state) {
      this.element().disabled = state;
    },
    setElement: function () {
      var elem = this.element();
      var div = document.getElementById('buttonDiv');
      if (div) {
        div.appendChild(elem);
      }
      return elem;
    },
    play: function(count) {
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
        _audio.play();
      }
    },
    playOnce: function() {
      if (!_audio && _sound) {
        _audio = new Audio('sound/' + _sound + '.wav');
        if (_needLoad) {
          _audio.load();
          _needLoad = false;
        }
      }
    },
    color: function () {
      return _color;
    },
    duration: function () {
      return _duration;
    },
    repeat: function () {
      return _repeat;
    }
  }
}

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
    elem.style.color = btn.color();
    elem.style.visibility="visible";
    elem.style.display="";
  }
}

function colorBars(btn, t) {
  if (btn)
  {
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
  document.getElementById('barRow').style.visibility="visible";
  //DISPLAYdocument.getElementById('barRow').style.display="";
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
  //DISPLAYdocument.getElementById('barRow').style.display="none";
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

var buttons = {}; // empty dictionary

function disableButtons(state) {
  for (var key in buttons) {
    if (buttons.hasOwnProperty(key)) {
      buttons[key].disable(state);
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

function startTimer(id) {
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

/*
function loadJSON(callback) {
     var xobj = new XMLHttpRequest();
     xobj.overrideMimeType("application/json");
     xobj.open('GET', 'config.json', true); // Replace 'my_data' with the path to your file
     xobj.onreadystatechange = function () {
       if (xobj.readyState == 4 && xobj.status == "200") {
// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
         callback(xobj.responseText);
       }
      };
      xobj.send(null);
}

function init() {
  loadJSON(function(response) {
    try {
// Parse JSON string into object
      config = JSON.parse(response);
      processConfig();
    } catch(ignore)
    );
  }
}
*/

function processConfig() {
  if (config) {
    var bb = config['buttons'];
    if (bb) {
      for (var iii = 0; iii < bb.length; ++iii) {
        var btn = bb[iii];
        if (btn.active) {
          //red: Button('red', 'red', 5, 'clap', 1),
          var button = new Button(btn.name, btn.color, btn.timeout, btn.sound, btn.repeat);
          button.setElement();
          buttons[btn.id] = button;
        }
      }
    }
  }
  disableButtons(false);
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

window.onload = function () {
  secondDiv = document.getElementById('secondDiv');
  secondText = document.getElementById('second');
  var name = QueryString.name || 'ELLIOT';
  document.getElementById('stuff').innerText = 'HELLO ' + name.replace(/[<>@#$%^&*()={}/?"':;]/g,'').toUpperCase();
  document.getElementById('timer').style.visibility = 'visible';
  processConfig();
  var barDiv = document.getElementById('barDiv');
  if (barDiv)
  {
    for (var ii = 10; ii > 0; --ii)
    {
      var span = document.createElement("span");
      span.id = 'bar' + ii;
      span.className ="bar";
      span.innerHTML='&block;';
      barDiv.appendChild(span);
    }
  }
  disableDigits();
  unColorBars();
};

// vim: sw=2 ts=2 :
