import {EventEmitter} from "events";
import Debug from 'debug';
import _ from'lodash';
//const debug = Debug('timers:Timer');
import {joinNonEmpty} from '@utilities/string';
import {DebuggableObject, DebuggableObjectOptions} from './basicObjects';


interface Resolve<T> { (value?: T | PromiseLike<T>): void }
interface Reject { (reason?: Error): void }


export interface TimeoutCallback { (): void }

export interface TimeoutOptions extends DebuggableObjectOptions{
  callback?: TimeoutCallback
  timeout?: number
}

export class Timeout extends DebuggableObject {
  protected _timer: NodeJS.Timeout  // number for browser
  get options(): Partial<TimeoutOptions> { return this._options; }

  constructor(options?: TimeoutOptions) {
    super(options);
  }

  //

  protected _stop() {
    this.debug('_stop')
    clearTimeout( this._timer );
    this._timer = null;
  }

  protected _isActive() {
    return this._timer !== null;
  }

  protected _start() {
    if (this.options.timeout >= 0) {
      this.debug(`_start ${this.options.timeout}ms`)
      this._timer = setTimeout(this.options.callback, this.options.timeout)
    } else {
      this.debug('timeout not started due to negative value')
    }
  }

  //

  public stop() {
    this.debug('stop')
    if (this._isActive()) {
      this._stop();
    }
  }

  public isActive() {
    return this._isActive();
  }

  public start(options?: TimeoutOptions) {
    this._extendOptions(options);
    this.debug('start', this.options)
    if (this.isActive()) this._stop()
    return this._start();
  }

}


export interface TimerCallback { (error: Error, timeout: number): void }

export interface TimerOptions extends DebuggableObjectOptions {
  name?: string
  autostart: boolean
  callback: TimerCallback
  timeout: number
}

export class Timer extends DebuggableObject {
  get options(): Partial<TimerOptions> { return this._options; }

  _timer: Timeout
  _startTime: number
  _remaining: number

  _resolve: Resolve<number>
  _reject: Reject

  constructor(options: TimerOptions) {
    super(options);
    this._timer = new Timeout();
    this._startTime = undefined
    this._remaining = undefined

    /*

      !!!
      constructor can't be async; this.start() is async
      !!!

     */
    if (this.options.autostart) {
      /*return*/ this.start(options);
    }
  }

  protected _handleTimeout() {
    this.debug(`[_handleTimeout]`);
    const result = this.options.timeout;
    if (typeof this.options.callback === 'function') {
      this.options.callback(null, result);
    }
    return this._resolve(result);
  }

  protected _pause() {
    this.debug(`[_pause]`, this.options);
    if (this._timer.isActive()) {
      this._timer.stop();
    }
  }

  protected _paused() {
    const now = Date.now();
    if (typeof this._startTime === 'undefined') this._startTime = now;

    const elapsed = now - this._startTime;
    // this.debug(`[_paused] now:`, now, ` startTime:`, startTime, '_remaining:', this._remaining);

    this._remaining -= elapsed;
    this.debug(`[_paused] elapsed:`, elapsed, ` remaining:`, this._remaining);
  }

  protected async _restart() {
    this.debug(`[_restart]`, this.options);
    this._stop();
    this._remaining = this.options.timeout;
    return this._start();
  }

  protected async _start() {
    this.debug(`[_start] _remaining:`, this._remaining);
    if (this._timer.isActive()) throw new Error(`Timer is already active`);
    this._startTime = Date.now();
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject  = reject;
      return this._timer.start({ callback: this._handleTimeout.bind(this), timeout: this._remaining });
    });
  }

  protected _stop() {
    this.debug(`[_stop]`, this.options);
    this._pause();
    this._paused();
  }

  //

  public async restart(options?: TimerOptions) {
    this._extendOptions(options)
    this.debug(`[restart]`, this.options);
    return this._restart();
  }

  public async start(options?: TimerOptions) {
    this._extendOptions(options)
    if (typeof this.options.timeout === 'undefined') throw new Error(`timeout option value must be set`);
    this.debug(`[start]`, this.options);
    return this._restart();
  }

  public stop() {
    this.debug(`[stop]`, this.options);
    this._remaining = 0;
    return this._stop();

    // do we need to reject+callback(err)
    // as we resolve+callback(null) when timer exceeds
    //

  }

  public pause() {
    this._pause();
    this._paused();
  }

  public async resume() {
    this.debug(`[resume] _remaining:`, this._remaining);
    return this._start();
  }

}


export class TimerArray {
  _timers: Timer[]
  protected _add(t: Timer) {
    this._timers.push(t);
    return t;
  }
  public _create(options: TimerOptions) {
    const t = new Timer(options);
    return this._add(t);
  }
  public create(options: TimerOptions) {
    return this._create(options);
  }
  public start(options: TimerOptions) {
    return this._timers.forEach(t => t.start(options));
  }
  public stop() {
    return this._timers.forEach(t => t.stop());
  }
  public restart(options: TimerOptions) {
    return this._timers.forEach(t => t.restart(options));
  }
}


export class TimerGroup extends EventEmitter {
  _timers: { [k:string]: Timer }
  constructor() {
    super();
    this._timers = {};
  }
  protected _add(name: string, t: Timer) {
    if (this._timers[name]) throw new Error(`Timer "${name}" already exist`);
    this._timers[name] = t;
    return t;
  }
  public create(options: TimerOptions) {
    // const opts = {
    //
    // }
    const t = new Timer({
      ...options,
      callback: (...rest) => {
        if (options.callback) options.callback(...rest);
        this.emit(options.name, ...rest);
      }
    });
    return this._add(options.name, t);
  }
  public forEach(cb) {
    return Object.keys(this._timers).forEach(
      n => cb(this._timers[n], n, this._timers)
    )
  }
  public start() {
    // this._timers.forEach(t => t.start);
    // Object.keys(this._timers).forEach(n => this._timers[n].start);
    return this.forEach(t => t.start());
  }
  public stop() {
    // this._timers.forEach(t => t.stop);
    return this.forEach(t => t.stop());
  }
  public restart() {
    // this._timers.forEach(t => t.restart);
    return this.forEach(t => t.restart());
  }
}


if (require.main === module) {
  const run = async () => {

    Debug.enable('timers:*');

    //const t1 = new Timer({
    //  autostart: true,
    //  timeout:   1 * 1000,
    //  callback:  () => {
    //    console.log(1)
    //  },
    //});
    //
    //const t2 = new Timer({
    //  //autostart: true,
    //  timeout:   2 * 1000,
    //  callback:  () => {
    //    console.log(2)
    //  },
    //});
    //await t2.start();
    //
    //const t3 = new Timer({
    //  //autostart: true,
    //  timeout:   3 * 1000,
    //  callback:  () => {
    //    console.log(3)
    //  },
    //});
    //setTimeout(()=>{t3.pause();}, 2500);
    //setTimeout(()=>{t3.resume();}, 3500);
    //await t3.start();

    const t4 = new Timer({
      name: 't4',
      autostart: false,
      timeout:   2 * 1000,
      callback:  () => {
        console.log(4)
      },
    });
    t4.start();
    setTimeout(()=>{t4.restart();}, 500);
    setTimeout(()=>{t4.restart();}, 1000);
    //setTimeout(()=>{t4.resume();}, 3500);

  }
  run();
}

// module.exports = {
//   Timer,
// }
