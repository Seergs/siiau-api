import { Injectable, Logger } from '@nestjs/common';
import * as mysql from 'mysql'

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly db: mysql.Connection
  constructor() {
    this.db = mysql.createConnection(process.env.DATABASE_URL);
    this.db.connect()
  }

  async save(controller: string, path: string) { 
    const query = `INSERT INTO analytics(controller, path, date) VALUES('{1}','{2}', NOW())`
    const statement = query.replace("{1}", controller).replace("{2}", path)
    this.db.query(statement, (err) => {
      if (err) throw err;
      this.logger.debug("analytics saved");
    })
  }
}
