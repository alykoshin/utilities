const debug = require('debug')('watchdog');

const {joinNonEmpty} = require('@utilities/string');


const DEFAULT_WATCHDOG_NAME = 'watchdog';

const DEFAULT_COUNTER_NAME = 'counter';
const DEFAULT_COUNTER_OPTIONS = Object.freeze({
  name:      DEFAULT_COUNTER_NAME,
  limit:     10000,
});

const DEFAULT_TIMER_NAME   = 'timer';
const DEFAULT_TIMER_OPTIONS = Object.freeze({
  name:      DEFAULT_TIMER_NAME,
  timeout:   10000,
  autostart: false,
});


export class EINVALID_VALUE extends Error {
  code: string
  constructor(msg?) {
    super(joinNonEmpty(['EINVALID_VALUE',msg],': '));
    this.code = 'EINVALID_VALUE';
  }
}

export class EWATCHDOG extends Error {
  code: string
  constructor(msg?) {
    super(joinNonEmpty(['EWATCHDOG',msg],': '));
    this.code = 'EWATCHDOG';
  }
}


interface AbstractWatchdogOptions {
  name: string
  callback: (error: EWATCHDOG) => void
}

export class AbstractWatchdog {
  _options

  constructor (options) {
    this._options = {};
    this._setOptions(DEFAULT_COUNTER_OPTIONS, options);
  }

  _setOptions(...options) {
    return Object.assign(this._options, ...options);
  }

  _getDebugId() {
    return joinNonEmpty([DEFAULT_WATCHDOG_NAME, this._options.name], ':');
  }

  _trigger (msg) {
    debug(`* [${ this._getDebugId() }] ${msg}`);
    return this._options.callback(new EWATCHDOG(msg));
  }

}


export class WatchdogCounter extends AbstractWatchdog {
  _counter: number

  constructor(props) {
    super(props);
    this.reset();
  }

  reset () {
    this._counter = 0;
  }

  inc (n=1) {
    if (n <= 0) throw new EINVALID_VALUE();
    this._counter += n;
    if (this._counter > this._options.limit) {
      //throw new EWATCHDOG(`[${this._getDebugId()}] Watchdog counter limit has been exceeded (limit: ${this._options.limit})`);
      const msg = `[${this._getDebugId()}] Watchdog counter limit has been exceeded (limit: ${this._options.limit})`;
      return this._trigger(msg);
    }
  }

}


export class WatchdogTimer extends AbstractWatchdog {
  timer: NodeJS.Timer

  constructor (options={}) {
    super(options);
    this.timer = null;
    if (this._options.autostart) {
      /*return */ /* await */ this.start();
    }
  }

  _startTimer (callback) {
    this._options.callback = callback;

    const handleTimeout = () => {
      const msg = `* [${ this._getDebugId() }] Timeout has expired (timeout: ${this._options.timeout}ms)`;
      //debug(`* [${ this._getDebugId() }] ${msg}`);
      //return this._options.callback(new EWATCHDOG(msg));
      return this._trigger(msg);
    };

    this.timer = setTimeout(
      handleTimeout,
      this._options.timeout
    );
  }

  _stopTimer () {
    debug(`* [${ this._getDebugId() }] watchdog stopped`);
    clearTimeout(this.timer);
  }

  async start (options={}) {
    this._setOptions(options);
    debug(`* [${ this._getDebugId() }] watchdog started (timeout: ${this._options.timeout}ms)`);
    return new Promise((resolve, reject) => {

      return this._startTimer( reject.bind(this) );

    })
  }

  stop() {
    return this._stopTimer();
  }

}


module.exports = {
  WatchdogCounter,
  WatchdogTimer,
  EWATCHDOG,
};
