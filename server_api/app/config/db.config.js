export const USER = "root";
export const HOST = process.env.DB_HOST ? process.env.DB_HOST : "localhost";
export const PORT = process.env.DB_PORT ? process.env.DB_PORT : "3306";

//export const HOST = "mariadb";
//export const USER = "root";

export const PASSWORD = process.env.DB_PWD;
//export const DB = "HClocal";
export const DB = "heating";
export const dialect = "mariadb";
export const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};
