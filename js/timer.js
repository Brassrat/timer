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

      const rainbow = ['red', 'orange', 'yellow', 'blue', 'green', 'indigo', 'violet'];

      const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      let timerBackground = 'black';
      let timerForeground = rainbow[randomnumber(rainbow.length)];
      let buttons = {}; // empty dictionary
      let activeButton;
      let timeinterval;
      let dayText = null;
      let dayDiv = null;
      let hourText = null;
      let hourDiv = null;
      let minuteText = null;
      let minuteDiv = null;
      let secondText = null;
      let secondDiv = null;
      let endtime;

      let blank = '&nbsp;';

      function $E(id) { return document.getElementById(id) }

      function randomnumber(max) { return Math.min(max, Math.floor((Math.random() * (max + 1)))) }

      let greetingDiv = null;
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

        greetingDiv = $E('greeting');
        secondText = $E('second');
        name = QueryString.name || config.name;
        language = QueryString.language || 'english';

        if (config) {
          timerBackground = config.background || 'black';
          config.buttons.forEach(btn => { buttons[btn.id] = new Button(btn); });
        }

        for (let ii = 0; ii < nms.length; ++ii) {
          counts[ii] = new Count(ii);
        }

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
        let count = aCount;
        let file = '';
        let audio = null;
        let needLoad = true || TimerBrowser.iOS();

        function initAudio() {
          if (!audio) {
            let nm = nms[count];
            if (nm) {
              file = `sound/${language}/${nm}`;
              audio = new Audio(file);
              audio.style.display = "none";
              needLoad = TimerBrowser.iOS();
            }
          }
          if (audio && needLoad) {
            audio.load();
            needLoad = false;
          }
          return (audio != null);
        }

        //initAudio();

        function stop() {
          if (audio && (playingCount === _count)) {
            audio.pause();
            audio.currentTime = 0;
          }
        }

        function play() {
          if (initAudio()) {
            const ee = function () {
              playingCount = -1;
              audio.removeEventListener("ended", ee, false);
            };

            playingCount = count;
            audio.addEventListener("ended", ee, true);
            audio.play();
          }
        }

        function load() { return initAudio(); }

        return {load, play};
      }

      function Button(cfg) {
        const _id = cfg.id;
        const active = cfg.active || false;
        const _color = cfg.color || 'yellow';
        const _timeout = cfg.timeout || 1;
        const _sound = cfg.sound;
        const _repeat = cfg.repeat || 1;
        let _needLoad = true || TimerBrowser.iOS();
        let _audio = null;
        let _element = null;

        function id() { return _id }

        function color() { return _color; }

        function duration() { return _timeout; }

        function element() {
          if (!_element) {
            _element = document.createElement("button");
            _element.id = _id;
            _element.className = "start";
            _element.onclick = function () { startTimer(_id); };
            _element.style.backgroundColor = _color;
            _element.innerHTML = '' + _timeout;
            _element.style.disabled = true;
            if (active) {
              let div = $E('buttonDiv');
              if (div) { div.appendChild(_element); }
            }
          }
          return _element;
        }

        function disable(state) { element().disabled = state; }

        function play() {
          if (!_audio && _sound) {
            _audio = new Audio(`sound/notification/${_sound}.wav`);
          }
          if (_audio) {
            if (_needLoad) {
              _audio.load();
              _needLoad = false;
            }
            let ct = _repeat || 1;
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

        function playStart() {
          if (!_audio && _sound) {
            _audio = new Audio('sound/notification/' + _sound + '.wav');
            if (_needLoad) {
              _audio.load();
              _needLoad = false;
            }
          }
        }

        return {id, disable, play, playStart, color, duration,};
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

      function updateDigit(elem, value, off) {
        if (elem) { elem.innerHTML = (value && (value > 0)) ? (value >= 10 ? '' + value : blank + value) : (off ? off : blank); }
      }

      function colorBar(btn, barId) {
        let elem = $E('bar' + barId);
        if (elem) {
          elem.style.color = btn.color();
          elem.style.visibility = "visible";
          //elem.style.backgroundColor = btn.color();
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
        if (elem && (elem.style.color !== timerBackground)) {
          elem.style.color = timerBackground;
          elem.style.backgroundColor = timerBackground;
          //elem.style.visibility = "hidden";
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
        updateDigit(dayText, t.days);
        updateDigit(hourText, t.hours);
        updateDigit(minuteText, t.minutes);
        let secs = t.seconds;
        updateDigit(secondText, secs);
        if ((t.days <= 0) && (t.hours <= 0) && (t.minutes <= 0) && (secs >= 0) && (secs < counts.length)) {
          counts[secs].play();
          for (let ii = counts.length - 1; ii > secs; --ii) {
            unColorBar(ii);
          }
        }
        if (greetingDiv) {
          timerForeground = rainbow[randomnumber(rainbow.length)];
          greetingDiv.style.color = timerForeground;
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

      function disableDigit(digit) {
        if (digit) { updateDigit(digit, ''); }
      }

      function disableDigits() {
        [dayText, hourText, minuteText, secondText].forEach(tt => disableDigit(tt));
      }

      function stopTimer(btn) {
        clearInterval(timeinterval);
        if (btn) { btn.play(); }
        disableButtons(false);
        disableDigits();
      }

      function color(elem, cc) {
        if (elem) { elem.style.color = cc; }
      }

      function colorDigits(btn) {
        const cc = btn ? btn.color() : timerBackground;
        [dayDiv, hourDiv, minuteDiv, secondDiv].forEach(tt => color(tt, cc));
        //[dayText, hourText, minuteText, secondText].forEach(tt => color(tt, cc));
      }

      function startTimer(id) {
        activeButton = buttons[id];
        if (activeButton) {
          disableButtons(true);
          counts.forEach(cc => { cc.load(); });

          activeButton.playStart();
          endtime = Date.now() + (activeButton.duration() * 1000);
          colorDigits(activeButton);
          colorBars(activeButton, updateClock());
          if (greetingDiv) {
            timerForeground = rainbow[randomnumber(rainbow.length)];
            greetingDiv.style.color = timerForeground;
          }
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
    }
)();

window.onload = function () {
  timer.processConfig();
};
// vim: sw=2 ts=2 scs :
