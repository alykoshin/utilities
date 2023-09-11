export class EMACHINE_ERROR extends Error {
  code: string
  info?: any
  constructor (msg?: string, info?: any, code?: string) {
    // if (typeof info === 'undefined') {
    //
    // }
    code = code || 'EMACHINE_ERROR'
    super(msg || code);
    this.code = code;
    this.info = info;
  }
}

export class EINVALID_EVENT extends EMACHINE_ERROR {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_EVENT'); }
}


export class EINVALID_STATE extends EMACHINE_ERROR {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_STATE'); }
}

export class EINVALID_CURRENT_STATE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_CURRENT_STATE'); }
}

export class EINVALID_START_STATE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_START_STATE'); }
}

export class EINVALID_FINAL_STATE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_FINAL_STATE'); }
}

export class EINVALID_STATE_ID_VALUE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_STATE_ID_VALUE'); }
}

//

export class EINVALID_TRANSITION extends EMACHINE_ERROR {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_TRANSITION_ID'); }
}

export class EINVALID_TRANSITION_ID extends EINVALID_TRANSITION {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_TRANSITION_ID'); }
}

export class EINVALID_TRANSITION_TO extends EINVALID_TRANSITION {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_TRANSITION_TO'); }
}

export class ETRANSITION_REJECTION extends EINVALID_TRANSITION {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'ETRANSITION_REJECTION'); }
}

