import {Injectable, Inject, forwardRef} from '@angular/core';

import {Config, ConsoleService} from '../index';

@Injectable()
export class LogService {

  constructor(@Inject(forwardRef(() => ConsoleService)) public logger: ConsoleService) {}
  
  // debug (standard output)
  public debug(msg: any) { 
    if (Config.DEBUG.LEVEL_4) {
      this.logger.log(msg);  // must be `log` as Android does not support console.debug !!
    }
  }
  
  // error
  public error(err: any) {
    if (Config.DEBUG.LEVEL_4 || Config.DEBUG.LEVEL_3) {
      this.logger.error(err);  
    }
  }
  
  // warn
  public warn(err: any) {
    if (Config.DEBUG.LEVEL_4 || Config.DEBUG.LEVEL_2) {
      this.logger.warn(err);  
    }
  }
  
  // info
  public info(err: any) {
    if (Config.DEBUG.LEVEL_4 || Config.DEBUG.LEVEL_1) {
      this.logger.info(err);  
    }
  }
}
