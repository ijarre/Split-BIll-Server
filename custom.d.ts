declare namespace Express {
  export interface Request {
    user?: {
      user_id: string;
      username: string;
      email: string;
    };
  }
}
