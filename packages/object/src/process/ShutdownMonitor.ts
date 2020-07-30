import Debug from 'debug';


export const DEFAULT_SIGNALS: NodeJS.Signals[] = [
  'SIGINT',  // Ctrl+C
  'SIGTERM',
  'SIGQUIT',
  'SIGUSR2',
  // SIGUSR1 - Node debugger
  // SIGKILL cannot be interrupted
];

export interface setSignalHandlersArguments {
  signals?: NodeJS.Signals[],
  callback: ((signal: string)=>{}),
}

export function setSignalHandlers(this:any,{ signals, callback }: setSignalHandlersArguments) {
  const debug = Debug('setSignals');
  signals = signals || DEFAULT_SIGNALS;
  debug(`process.pid: ${process.pid} process.ppid: ${process.ppid}`);
  debug(`setSignalHandlers: ${signals.join(', ')}`);
  // console.log('1111111111111', this)

  //
  //process.stdin.resume();
  //

  signals.forEach(sig => {
    process.on(sig, async () => {
      const msg = `* ${sig} signal received`;
      debug(msg);
      // console.log('22222222222222222', this)
      await callback.call(this, sig);
    })
  })
}


export interface ShutdownHandler { () : Promise<any> }
export interface ShutdownMonitorOptions {
  timeout: number
}
export interface HandlerStructure {
  name: string
  fn: ShutdownHandler
}

const DEBUG_NAME = 'ShutdownMonitor';

export class ShutdownMonitor {
  /*protected*/ debug: Debug
  protected options: ShutdownMonitorOptions
  protected terminating: boolean
  protected handlers: HandlerStructure[] = [];

  constructor (options: ShutdownMonitorOptions) {
    this.debug = Debug(`${DEBUG_NAME}`);
    this.options = options;
    this.terminating = false;
    //  // this.handlers = [];
    //  process.on('SIGINT', async() => {
    //    this.debug(`\nprocess.on(SIGINT)`);
    //    return this.terminate();
    //  });
    //  process.on('SIGUSR2', async() => {
    //    this.debug(`\nprocess.on(SIGUSR2)`);
    //    return this.terminate();
    //  });
    //  process.on('SIGHUP', async() => {
    //    this.debug(`\nprocess.on(SIGHUP)`);
    //    return this.terminate();
    //  });
    // process.on('SIGTERM', async() => {
    //    this.debug(`\nprocess.on(SIGTERM)`);
    //    return this.terminate();
    //  });
    setSignalHandlers.call(this, { callback: this.terminate });
  }

  _addHandler(h: HandlerStructure) {
    this.handlers.push(h);
  }

  addHandler(name: string, fn: ShutdownHandler) {
    this._addHandler({ name, fn });
  }

  async _firstAttempt () {
    this.terminating = true;
    console.warn();
    const msg = 'Gracefully terminating the application';
    console.warn(msg);
    // this.debug(msg);
    this.debug('Handlers: [', this.handlers.map(h => `'${h.name}'`).join(', '), ']');

    // const TERMINATE_TIMEOUT = 3000;
    const TIMEOUT_ERROR_MSG = 'TIMEOUT';

    const timeoutPromise = new Promise((resolve, reject) => {
      const debug = Debug(`${DEBUG_NAME}:timeout`);
      debug(`Waiting for program termination (timeout ${this.options.timeout})`);
      return setTimeout(() => {
        debug(`ERROR: Timeout expired: ${this.options.timeout}`);
        console.error(`ERROR: Timeout expired: ${this.options.timeout}`);
        return reject(new Error(TIMEOUT_ERROR_MSG));
      }, this.options.timeout);
    });
    // const allWithTimeout = Promise

    try {
      const allHandlersPromise = Promise.all(this.handlers.map(async(h) => {
          const debug = Debug(`${DEBUG_NAME}:${h.name}`);
          debug(`Terminating ${h.name}`)
          return h.fn().then(res => {
            debug(`Terminated  ${h.name}`)
            return res;
          });
        })
      );
      await Promise.race([allHandlersPromise, timeoutPromise]);
      // await server.close;
      this.debug(`process.exit(0)`);
      return process.exit(0);

    } catch(err) {
      console.error('ERROR:', err);
      this.debug('Failed to gracefully terminate application');
      return this._secondAttempt();
    }

  }

  async _secondAttempt () {
    const msg = `Forcing immediate termination`;
    console.warn();
    console.warn(msg);
    this.debug(`process.exit(-1)`);
    return process.exit(-1);
  }

  async terminate (reason?: string) {
    console.log(`terminate() reason: ${reason}`);
    return this.terminating ? this._secondAttempt() : this._firstAttempt();
  }

}


const DEFAULT_TIMEOUT = 10000;
export const shutdownMonitor = new ShutdownMonitor({ timeout: DEFAULT_TIMEOUT });


if (require.main === module) {

  // Debug.enable(`${DEBUG_NAME}:*`);
  Debug.enable(`${DEBUG_NAME}*`);

  const run = async () => {
    // const shutdown = new ShutdownMonitor({timeout: DEFAULT_TIMEOUT});
    const createTestHandler = (name, timeout, rjct=false) => {
      const fn = /*async*/ () => {
        // shutdown.debug(`${name} started`);
        return new Promise(
          (resolve, reject) => setTimeout(() => {
              // shutdown.debug(`${name} done`);
              return rjct
                ? reject(new Error('Test rejection'))
                : resolve()
                ;
            },
            timeout
          )
        )
      }
      return { name, fn }
    }
    shutdownMonitor.debug('testing')

    shutdownMonitor._addHandler(createTestHandler('h-1000', 1000));
    shutdownMonitor._addHandler(createTestHandler('h-2000', 2000));
    shutdownMonitor._addHandler(createTestHandler('h-3000', 3000, true));
    shutdownMonitor._addHandler(createTestHandler('h-5000', 5000));
    await shutdownMonitor.terminate();
  }
  run();

}


