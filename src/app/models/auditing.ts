import { User } from './user';


export interface Auditing {
  user: User;
  lastModified: string;
}
