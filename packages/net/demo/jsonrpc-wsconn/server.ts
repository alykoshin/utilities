import Debug from 'debug';

import { jsonrpc } from "../../";
import {NodeJSError} from "../../src/types";
import {WSClient,WSServer} from "../../src/wsconn";
import {WSServerConnection} from "../../src/wsconn/server";

import { Handler } from './handler'

const config = require('./config.json');


if (require.main === module) {
  const debug = Debug('WS:Server');
  // Debug.enable('*');

  process.on('unhandledRejection', (reason, promise) => {
    debug('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
  });

  const wsServer = new WSServer(config);
  wsServer.on('connection', (conn: WSServerConnection) => {

    let int = null;
    const startPing = () => {
      const PING_INTERVAL = 5000;
      debug(`** startPing`);

      int = setInterval(async () => {
        debug(`** startPing:setInterval`);
        try {
          // const result = await handler.sdpPing(
          //   createSdpPing()
          // );
          const result = handler.pingRequest({});
          debug(`** startPing:setInterval:sdpPing: RESULT: ${JSON.stringify(result, null, 2)}`);
        } catch(e) {
          debug(`** startPing:setInterval:sdpPing: ERROR:`, e);
          // debug(`** sdpPing: ERROR (will close connection):`, e);
          // conn.terminate();
        }
      }, PING_INTERVAL);

    }

    conn.on('close', () => {
      debug(`** startPing: close`);
      if (int) {
        clearInterval(int);
        int = null;
      }
    });

    const handler = new Handler();
    const jrpc = new jsonrpc.Jsonrpc({ transport: conn, handler });
    handler.jrpc = jrpc;

    startPing();

    //

  });
  debug('** Initialized');

}
