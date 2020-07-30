import EventEmitter from 'events';


import { bootstrap, shutdown, BootstrapperThis, SimpleAction, SimpleActionClass } from '@utilities/object';


export abstract class Application extends EventEmitter {
  logger;
  // abstract activities: (
  //   {Action:SimpleActionClass,register:()=>void} & SimpleActionClass
  //   )[] = [];
  abstract activities: (/*SimpleAction|*/SimpleActionClass)[];
  abstract defaultDependsOn: string[];

  constructor ({logger=console}={}) {
    super();
    this.logger = logger;
  }

  async start() {
    this.activities.forEach(
      (A) => //A instanceof SimpleAction
        // ? A.register()
        // :
        (new A({
          application:      this,
          defaultDependsOn: this.defaultDependsOn,
        })).register()
    );

    await this.emit('starting', { context: bootstrap.context });

    await bootstrap.run();

    const {logger=console} = bootstrap.context;
    logger.info('Application initialized');

    await this.emit('start', { context: bootstrap.context });

    await this.run({ context: bootstrap.context });

    await this.emit('started', { context: bootstrap.context });

    return this;
  }

  async run(context) {

  }

  async stop() {
    return this.emit('stop', { context: bootstrap.context });
  }

}
