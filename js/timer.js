const timer = (function () {

  const nms = [
    '', /* TBD zero */
    '01.one.mp3',
    '02.two.mp3',
    '03.three.mp3',
    '04.four.mp3',
    '05.five.mp3',
    '06.six.mp3',
    '07.seven.mp3',
    '08.eight.mp3',
    '09.nine.mp3',
    '10.ten.mp3'];

  const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  let timerBackground = 'black';
  let buttons = {}; // empty dictionary
  let activeButton;
  let timeinterval;
  let dayText = null;
  let hourText = null;
  let minuteText = null;
  let secondText = null;
  let endtime;

  let zero = '&nbsp;';

  function $E(id) { return document.getElementById(id) }

  function randomnumber(max) { return Math.min(max, Math.floor((Math.random() * (max+1)) )) }

  let name = 'no name';
  let language = 'english';

  function processConfig() {
    const QueryString = function () {
      // This function is anonymous, is executed immediately and
      // the return value is assigned to QueryString!
      const query_string = {};
      const query = window.location.search.substring(1);
      const vars = query.split("&");
      for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        let nm = pair[0];
        let value = decodeURIComponent(pair[1]);
        if (typeof query_string[nm] === "undefined") {
          query_string[nm] = value; // If first entry with this name
        }
        else if (typeof query_string[pair[0]] === "string") {
          // If second entry with this name make it an array
          query_string[nm] = [query_string[nm], value];
        }
        else {
          // If third or later entry with this name add to array
          query_string[nm].push(value);
        }
      }
      return query_string;
    }();

    secondText = $E('second');
    name = QueryString.name || config.name;
    language = QueryString.language || 'english';

    const rainbow = ['red', 'orange', 'yellow', 'blue', 'green', 'indigo', 'violet'];

    if (config) {
      timerBackground = config.background || 'black';
      timerForeground = rainbow[randomnumber(rainbow.length)];
      const bb = config.buttons;
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

    for (let ii = 0; ii < nms.length; ++ii) {
      counts[ii] = new Count(ii);
    }

    let greetingDiv = $E('greeting');
    if (greetingDiv) {
      greetingDiv.style.color = timerForeground;
      greeting.innerText = 'HELLO ' + name.replace(/[<>@#$%^&*()={}/?"':;]/g, '').toUpperCase();
    }
    let timerDiv = $E('timer');
    if (timerDiv) {
      timerDiv.style.visibility = 'visible';
    }

    function addBar(barDiv, id) {
      const span = document.createElement("span");
      span.id = `bar${id}`;
      span.className = 'bar';
      span.innerHTML = '&block;';
      barDiv.appendChild(span);
    }

    const barDiv = $E('barDiv');
    if (barDiv) {
      for (let ii = counts.length; ii > 0; --ii) { addBar(barDiv, ii) }
    }

    disableButtons(false);
    disableDigits();
    unColorBars();

  }

  function Queue() {
    let qq = [];

    function push(cc) { qq.push(cc)}

    function pop(cc) { qq.shift(cc)}

    function isEmpty() {return qq.length <= 0}
  }

  const noAudio = {
    load: function () {},
    pause: function () {},
    currentTime: 0,
    addEventListener: function () {},
    play: function () {}
  };

  let playingCount = -1;
  let playList = new Queue();

  /*
  play: function () {
    audio.addEventListener("count_ended", count_ended, true);
    playingCount = count;
    for (let ii=count; ii >= 0; --ii) {
      playList.push()
    }
    audio.play();
  }
  */

  // function playAudio(url){
  //   var audio = document.createElement('audio');
  //   audio.src = url;
  //   audio.style.display = "none"; //added to fix ios issue
  //   audio.autoplay = false; //avoid the user has not interacted with your page issue
  //   audio.onended = function(){
  //     audio.remove(); //remove after playing to clean the Dom
  //   };
  //   document.body.appendChild(audio);
  // }

  function Count(aCount) {
    let count = 0;
    let file = '';
    let audio = null;

    function initAudio(cc) {
      let nm = nms[cc];
      count = cc;
      if (nm) {
        file = `sound/${language}/${nm}`;
        audio = new Audio(file);
        audio.style.display = "none";
        if (true || TimerBrowser.iOS()) { audio.load(); }
      }
      else {
        file = '';
        audio = noAudio;
      }
    }

    initAudio(aCount);

    function count_ended() {
      playingCount = -1;
      audio.removeEventListener("ended", count_ended, false);
    }

    function stop() {
      if (audio && (playingCount === _count)) {
        audio.pause();
        audio.currentTime = 0;
      }
    }

    return {
      file: function () { return file; },
      play: function () {
        if (audio) {
          playingCount = count;
          audio.addEventListener("ended", count_ended, true);
          audio.play();
        }
      }
    }
  }

  function Button(aId, aColor, aDuration, aSound, aRepeat) {
    const _id = aId;
    const _color = aColor;
    const _duration = aDuration;
    const _sound = aSound;
    const _repeat = aRepeat || 1;
    let _needLoad = true || TimerBrowser.iOS();
    let _audio;
    let _element;

    function id() { return _id }

    function color() { return _color; }

    function duration() { return _duration; }

    function element() {
      if (!_element) {
        _element = document.createElement("button");
        _element.id = _id;
        _element.className = "start";
        _element.onclick = function () { startTimer(_id); };
        _element.style.backgroundColor = _color;
        _element.innerHTML = '' + _duration;
        _element.style.disabled = true;
      }
      return _element;
    }

    function repeat() { return _repeat; }

    function disable(state) { this.element().disabled = state; }

    function setElement() {
      const elem = element();
      let div = $E('buttonDiv');
      if (div) { div.appendChild(elem); }
      return elem;
    }

    function play(count) {
      if (_audio) {
        let ct = count || 1;
        if (ct > 1) {
          _audio.addEventListener("ended",
                                  function ended() {
                                    if (--ct > 0) { _audio.play(); }
                                    else {
                                      _audio.removeEventListener("ended", ended, false);
                                    }
                                  }, true);
        }
        _audio.play();
      }
    }

    function playOnce() {
      if (!_audio && _sound) {
        _audio = new Audio('sound/notification/' + _sound + '.wav');
        if (_needLoad) {
          _audio.load();
          _needLoad = false;
        }
      }
    }

    return {
      id,
      element,
      disable,
      setElement,
      play,
      playOnce,
      color,
      duration,
      repeat
    }
  }

  function playCount(ct) {
    if ((ct >= 0) && (ct < counts.length)) {
      (counts[ct]).play()
    }
  }

  function getTimeRemaining(endtime) {
    const t = endtime - Date.now();
    return {
      total: t,
      days: Math.floor(t / (1000 * 60 * 60 * 24)),
      hours: Math.floor((t / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((t / 1000 / 60) % 60),
      seconds: Math.floor(((t + 500) / 1000) % 60)
    };
  }

  function updateDigits(elem, value, off) {
    if (elem) {
      elem.innerHTML = (value > 0) ? (value >= 10 ? '' + value : zero + value) : (off ? off : zero + zero);
    }
  }

  function colorBar(btn, barId) {
    let elem = $E('bar' + barId);
    if (elem) {
      elem.style.color = btn.color();
      //elem.style.backgroundColor = btn.color();
      // elem.style.visibility = "visible";
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
            unColorBar(1 + ii);
          }
        }
      }
    }
    $E('barRow').style.visibility = "visible";
    //DISPLAY$E('barRow').style.display="";
  }

  function unColorBar(barId) {
    const elem = $E('bar' + barId);
    // elem.style.visibility = "hidden";
    if (elem && (elem.style.color !== timerBackground)) {
      elem.style.color = timerBackground;
      elem.style.backgroundColor = timerBackground;
    }
  }

  function unColorBars() {
    $E('barRow').style.visibility = "hidden";
    for (let ii = counts.length - 1; ii >= 0; --ii) {
      unColorBar(ii);
    }
  }

  function updateClock() {
    const t = getTimeRemaining(endtime);
    updateDigits(dayText, t.days, '');
    updateDigits(hourText, t.hours, '');
    updateDigits(minuteText, t.minutes, '');
    let secs = t.seconds;
    updateDigits(secondText, secs, '');
    playCount(secs);
    if ((t.days <= 0) && (t.hours <= 0) && (t.minutes <= 0) && (secs < counts.length)) {
      for (let ii = counts.length - 1; ii > secs; --ii) {
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
  return {processConfig};
})();

window.onload = function () {
  timer.processConfig();
};


// vim: sw=2 ts=2 scs :
