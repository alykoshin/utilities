import Debug from 'debug';

import { jsonrpc } from "../../";
import { WSClient } from '../../src/wsconn'

import { Handler } from './handler'

const config = require('./config.json');

//

const url = () => `ws://${config.host}:${config.port}/${config.namespace}`;

//

if (require.main === module) {
  const debug = Debug('WS:Client')
  // Debug.enable('*');

  process.on('unhandledRejection', (reason, promise) => {
    debug('Unhandled Rejection at:', promise, 'reason:', reason);
  });


  async function run() {
    const client = new WSClient({
      ...config,
      url: url(),
    });

    const handler = new Handler();
    const jrpc = new jsonrpc.Jsonrpc({ transport: client.conn, handler });
    handler.jrpc = jrpc;

    //

    handler.on('sdpPing', function(params) {
      console.log('sdpPing');
      return 'Success';
    })

    //

    await client.connect();
    debug('** connected');

  }
  run();

}


