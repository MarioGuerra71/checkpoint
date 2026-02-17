import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "examen_dwes_3",
});

//
//import mysql from "mysql2/promise";
//
//export const db = mysql.createPool({
//  host: "localhost",
//  user: "dwes25",
//  password: "dwes",
//  database: "examen_dwes_3",
//});

