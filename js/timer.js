let timerBackground = 'black';

const nms = ['01.one.mp3',
  '02.two.mp3',
  '03.three.mp3',
  '04.four.mp3',
  '05.five.mp3',
  '06.six.mp3',
  '07.seven.mp3',
  '08.eight.mp3',
  '09.nine.mp3',
  '10.ten.mp3'];

const counts = [0,0,0,0,0,0,0,0,0,0];

let buttons = {}; // empty dictionary
let activeButton;
let timeinterval;
let daysDiv;
let dayText;
let hourDiv;
let hourText;
let minuteDiv;
let minuteText;
let secondDiv;
let secondText;
let endtime;

let zero = '&nbsp;';

function processConfig() {
  if (config) {
    const bb = config['buttons'];
    if (bb) {
      for (let iii = 0; iii < bb.length; ++iii) {
        const btn = bb[iii];
        if (btn.active) {
          //red: Button('red', 'red', 5, 'clap', 1),
          const button = new Button(btn.name, btn.color, btn.timeout, btn.sound, btn.repeat);
          button.setElement();
          buttons[btn.id] = button;
        }
      }
    }
  }
  disableButtons(false);
}


const QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  const query_string = {};
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i=0;i<vars.length;i++) {
    let pair = vars[i].split("=");
    let nm = pair[0];
    let value = decodeURIComponent(pair[1]);
    if (typeof query_string[nm] === "undefined") {
      query_string[nm] = value; // If first entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      // If second entry with this name make it an array
      query_string[nm] = [query_string[nm], value ];
    } else {
      // If third or later entry with this name add to array
      query_string[nm].push(value);
    }
  }
  return query_string;
}();

window.onload = function () {
  secondDiv = document.getElementById('secondDiv');
  secondText = document.getElementById('second');
  const name = QueryString.name || config.name;
  processConfig();
  document.getElementById('greeting').innerText = 'HELLO ' + name.replace(/[<>@#$%^&*()={}/?"':;]/g,'').toUpperCase();
  document.getElementById('timer').style.visibility = 'visible';
  const barDiv = document.getElementById('barDiv');
  if (barDiv) {
    for (let ii = 10; ii > 0; --ii) {
      const span = document.createElement("span");
      span.id = 'bar' + ii;
      span.className ="bar";
      span.innerHTML='&block;';
      barDiv.appendChild(span);
    }
  }
  disableDigits();
  unColorBars();
  const language = QueryString.language || 'english';
  for (let ii = 0; ii < 10; ++ii) {
    let aa = new Audio('sound/' + language + "/" + nms[ii]);
    if (TimerBrowser.iOS()) { aa.load(); }
    counts[ii] = aa;
  }

};

function Button(aId, aColor, aDuration, aSound, aRepeat) {
  const _id = aId;
  const _color = aColor;
  const _duration = aDuration;
  const _sound = aSound;
  let _needLoad = TimerBrowser.iOS();
  let _audio;
  let _element;
  let _repeat = aRepeat || 1;
  return {
    id: function () {
      return _id
    },
    element: function () {
      if (!_element) {
        _element = document.createElement("button");
        _element.id = _id;
        _element.className ="start";
        _element.onclick = function() { startTimer(_id); };
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
      const elem = this.element();
      let div = document.getElementById('buttonDiv');
      if (div) {
        div.appendChild(elem);
      }
      return elem;
    },
    play: function(count) {
      if (_audio) {
        let ct = count || 1;
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
    playCount: function(ct) {
       if ((ct > 0) && (ct <= counts.length)) (counts[ct-1]).play()
    },
    playOnce: function() {
      if (!_audio && _sound) {
        _audio = new Audio('sound/notification/' + _sound + '.wav');
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
  const t = endtime - Date.now();
  return {
    'total': t,
    'days': Math.floor(t / (1000 * 60 * 60 * 24)),
    'hours': Math.floor((t / (1000 * 60 * 60)) % 24),
    'minutes': Math.floor((t / 1000 / 60) % 60),
    'seconds': Math.floor(((t + 500) / 1000) % 60)
  };
}

function updateDigits(div, elem, value, off) {
  if (div && elem) {
    elem.innerHTML = (value > 0) ? (value >= 10 ? '' + value : zero + value) : (off ? off : zero + zero);
  }
}

function colorBar(btn, barId) {
  let elem = document.getElementById('bar' + barId);
  if (elem) {
    //elem.innerHTML='&nbsp';
    //elem.style.backgroundColor = btn.color();
    elem.style.color = btn.color();
    //VISIBLEelem.style.visibility="visible";
    //DISPLAYelem.style.display="";
  }
}

function colorBars(btn, t) {
  if (btn) {
    if ((t.days > 0) || (t.hours > 0) || (t.minutes > 0) || (t.seconds > 0)) {
      for (let ii = 0; ii < 10; ++ii) {
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

function unColorBar(barId) {
  const elem = document.getElementById('bar' + barId);
  if (elem) {
    elem.style.color = timerBackground;
    elem.style.backgroundColor = timerBackground;
  }
}

function unColorBars() {
  document.getElementById('barRow').style.visibility="hidden";
  //DISPLAYdocument.getElementById('barRow').style.display="none";
  for (let ii = 0; ii < 10; ++ii) {
    unColorBar(1+ii);
  }
}

function updateClock() {
  const t = getTimeRemaining(endtime);
  updateDigits(daysDiv, dayText, t.days, '');
  updateDigits(hourDiv, hourText, t.hours, '');
  updateDigits(minuteDiv, minuteText, t.minutes, '');
  updateDigits(secondDiv, secondText, t.seconds, '');
  activeButton.playCount(t.seconds);
  if ((t.days <= 0) && (t.hours <= 0) && (t.minutes <= 0) && (t.seconds <= 10)) {
    for (let ii = 10; ii > t.seconds; --ii) {
      unColorBar(ii);
    }
  }
  if (t.total <= 0) {
    stopTimer(activeButton);
  }
  return t;
}

function disableButtons(state) {
  for (let key in buttons) {
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
  const cc = btn ? btn.color() : timerBackground;
  colorDigit(dayText, cc);
  colorDigit(hourText, cc);
  colorDigit(minuteText, cc);
  colorDigit(secondText, cc);
}

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

// vim: sw=2 ts=2 scs :
