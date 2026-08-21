export const TYPES = {
    userService: Symbol.for('userService'),
    database: Symbol.for('database')
}

export interface User {
    id: string
    name: string;
    email: string;
    age: number;
}

