const mysql  = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.BDD_HOST,
    user: process.env.BDD_USER,
    password: process.env.BDD_PASSWORD,
    database: process.env.BDD_DATABASE
})

connection.connect((error)=>{
    if(error){
        console.log("El error de conexion fue: "+error);
        return 
    }
    console.log('¡BD CONNECTED!');
})
module.exports = connection;