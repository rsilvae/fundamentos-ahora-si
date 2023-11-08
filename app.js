//1 - invocamos a express , mimetypes y a multer
const express = require('express');
const app = express();
const multer = require('multer');
const mimeTypes = require('mime-types');
const myConnection = require('express-myconnection')


    // app.use(morgan('dev'));

    // const controller = {};

    // controller.list = (req,res)=>{
    //     req.getConnection((err,conn)=>{
    //         if(err){
    //             console.log("El error es: ",err)
    //         }else{
    //             conn.query('SELECT * FROM CURRICULUM', (err,curriculums)=>{
    //                 if(err){
    //                     console.log(err)
    //                 }else{
    //                     console.log(curriculums)
    //                     res.render('curriculums')
    //                 }

    //             })
    //         }
    //     })
    // }




//app.set('views',path.join(__dirname,'views'));


// importando rutas 








const habilidades = "SELECT habilidad FROM bd_fundamentos"

//2 - seteamos urlencoded para capturar los datos  del formulario 
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3 - invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// 4 - el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname +'/public'));

// 5 - setear el motor de platillas
app.set('view engine', 'ejs')

// 6 - Invocamos a bcrypts
const bcryptjs = require('bcryptjs')

// 7 - Var. de session
const session = require('express-session')
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true
}))


//8 - invocamos al modulo de conexion de la BD
const connection = require('./database/db');

//9 - estableciendo las rutas

app.get("/",(req,res) => {
    res.render("index")
})
app.get("/crear_hab",(req,res) => {
    res.render("crear_hab")
})
app.get("/empresa/login_empresa",(req,res) => {
    res.render("empresa/login_empresa")
})
app.get("/profesional/login_profesional",(req,res) => {
    res.render("profesional/login_profesional")
})
app.get("/profesional/register_profesional",(req,res) => {
    res.render("profesional/register_profesional")
})
app.get("/empresa/register_empresa",(req,res) => {
    res.render("empresa/register_empresa")
})
// app.get("/inicio_empresa",(req,res) => {
//     res.render("inicio_empresa")
// })
// app.get("/inicio_profesional",(req,res) => {
//     res.render("inicio_profesional")
// })
app.get("/borrador",(req,res) => {
    res.render("borrador")
})


// 10 - Registros

app.post("/register_profesional", async (req,res)=>{
    const rut = req.body.rut;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const date_of_birth = req.body.date_of_birth;
    const names = req.body.names;
    const surname = req.body.surname;
    const numero = req.body.numero;
    const img = req.body.img;
    let passwordHash = await bcryptjs.hash(password,8);
    connection.query('INSERT INTO user_profesional SET ?', {rut:rut,username:username,email:email,password:passwordHash,date_of_birth:date_of_birth,names:names,surname:surname,numero:numero,img:img}, async(error, results)=>{
        if(error){
            console.log(error);
        } else{
            res.render('profesional/register_profesional',{
                alert: true,
                altertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:'profesional/login_profesional'
            })
        }
    })
})
app.post("/register_empresa", async (req,res)=>{
    const rut = req.body.rut;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = req.body.password;
    const razon_social = req.body.razon_social;
    const website = req.body.website;
    const cant_empleados = req.body.cant_empleados;
    const numero = req.body.numero;
    let passwordHash = await bcryptjs.hash(password,8);
    connection.query('INSERT INTO user_empresa SET ?', {rut:rut,nombre:nombre,email:email,password:passwordHash,razon_social:razon_social,website:website,cant_empleados:cant_empleados,numero:numero}, async(error, results)=>{
        if(error){
            console.log(error);
        } else{
            res.render('empresa/register_empresa',{
                alert: true,
                altertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:'empresa/login_empresa'
            })
        }
    })
})
app.post("/register_cv", async (req,res)=>{
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const habilidades = req.body.habilidades;
    const archivo = req.body.habilidades;
    connection.query('SELECT * FROM user_profesional WHERE username = ?',[req.session.username], (err,res_info_user_p)=>{
        if(err){
            console.error('Error al consultar la base de datos:', err);
            res.status(500).send('Error al obtener datos de la base de datos');
        }else{
            console.log('a1')
            connection.query('INSERT INTO curriculum SET ?',{nombre:nombre,user:res_info_user_p[0].rut,descripcion:descripcion},async(err,re)=>{
                if (err){
                    console.error('Error al consultar la base de datos:', err);
                    res.status(500).send('Error al obtener datos de la base de datos');
                }else{
                    console.log('b2')
                    connection.query('SELECT MAX(id) AS max_id FROM curriculum',(err,res_max_id_cur)=>{
                        req.session.cv_id = res_max_id_cur[0].max_id;
                        if(err){
                            console.error('Error al consultar la base de datos:', err);
                        res.status(500).send('Error al obtener datos de la base de datos');
                        }
                        for(let hab in habilidades){
                            if(habilidades.hasOwnProperty(hab)) {
                                console.log(habilidades[hab])
                                connection.query('SELECT * FROM habilidad WHERE nombre = ?', habilidades[hab],(err,res_id_hab)=>{
                                    if (err){
                                        console.error('Error al consultar la base de datos:', err);
                                        res.status(500).send('Error al obtener datos de la base de datos');
                                    }else{
                                        console.log('c3')
                                        connection.query('INSERT INTO curriculum_has_habilidad SET ?',{curriculum_id:res_max_id_cur[0].max_id,habilidad_id:res_id_hab[0].id},async(err,results)=>{
                                            if(err){
                                                console.log('El error fue: ',err)
                                            }else{
                                                console.log('d4')
                                                connection.query('SELECT habilidad_id FROM curriculum_has_habilidad WHERE curriculum_id = ?',[req.session.cv_id] ,(err,results)=>{
                                                    if(err){
                                                        console.error('Error al consultar la base de datos:', err);
                                                        res.status(500).send('Error al obtener datos de la base de datos');
                                                    }else{
                                                        console.log('e5')
                                                        req.session.data = results.map((row) => row.habilidad_id)
                                                        console.log("11111")
                                                        console.log(req.session.loggedin_p)
                                                        res.render('profesional/crear_cv2', {
                                                             //options: data,
                                                            // login:true,
                                                            username: req.session.username 
                                                        });
                                                    }
                                                })

                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            })
            
        }
    })
})
app.post("/register_oferta", async (req,res)=>{
    const cargo = req.body.cargo;
    const modalidad = req.body.modalidad;
    const lugar = req.body.lugar;
    const habilidades = req.body.habilidades;
    const carga_horaria = req.body.carga_horaria;
    const numero_de_vacantes = req.body.numero_de_vacantes;
    const renta_min = req.body.renta_min;
    const renta_max = req.body.renta_max;
    const descripcion = req.body.descripcion;
    console.log(req.session.nombre)

    connection.query('SELECT * FROM user_empresa WHERE nombre = ?',[req.session.nombre], (err,results_id_empresa)=>{
        if(err){
            console.error('1Error al consultar la base de datos:', err);
            res.status(500).send('Error al obtener datos de la base de datos');
        }else{
            connection.query('INSERT INTO oferta_trabajo SET ?', {cargo:cargo,modalidad:modalidad,lugar:lugar,carga_horaria:carga_horaria,numero_de_vacantes:numero_de_vacantes,empresa:results_id_empresa[0].rut,renta_min:renta_min,renta_max:renta_max,descripcion:descripcion }, async(error, results)=>{
            if(error){
                console.log(error);
            }else{                
                connection.query('SELECT MAX(id) AS max_id FROM oferta_trabajo',(err,results_id_oferta)=>{
                    
                    if(err){
                        console.error('2Error al consultar la base de datos:', err);
                        res.status(500).send('Error al obtener datos de la base de datos');
                    }else{
                        for (let hab in habilidades) {
                            if (habilidades.hasOwnProperty(hab)) {
                                connection.query('SELECT * FROM habilidad WHERE nombre = ?',habilidades[hab],(err,results_id_hab)=>{
                                    if(err){
                                        
                                        console.error('3Error al consultar la base de datos:', err);
                                        res.status(500).send('Error al obtener datos de la base de datos');
                                    }else{
                                        connection.query('INSERT INTO oferta_trabajo_has_habilidad SET ?',{oferta_trabajo_id:results_id_oferta[0].max_id,habilidad_id:results_id_hab[0].id},async(err,results)=>{
                                            if(err){
                                                console.log(err)
                                            }else{
                                                
                                                res.render('empresa/mis_ofertas',{
                                                    nombre:req.session.nombre
                                                })

                                            }
                                        })
                                    }
                                })

                                
                            }
                        }
                    }
                })
            }
        })
    }
    })
})

app.post("/reg_hab", async (req,res)=>{
    const nombre = req.body.nombre;
    connection.query('INSERT INTO habilidad SET ?', {nombre:nombre}, async(error, results)=>{
        if(error){
            console.log(error);
        } else{
            res.render('crear_hab',{
                alert: true,
                altertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:'crear_hab'
            })
        }
    })
})

// 11 - autentication

app.post('/auth_profesional', async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    let passwordHash = await bcryptjs.hash(password,8);
    if(username && password){
        connection.query('SELECT * FROM user_profesional WHERE username = ?', [username],async (error,results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(password,results[0].password))){
                res.render('profesional/login_profesional',{
                    alert: true,
                    altertTitle: "Error",
                    alertMessage: "Correo y/o contraseña incorrecta/s",
                    alertIcon:'error',
                    showConfirmButton:true,
                    timer:false,
                    ruta:'profesional/login_profesional'
                });
            } else{
                console.log("caca")
                req.session.loggedin_p = true;
                req.session.username = results[0].username;
                res.render('profesional/login_profesional',{
                    alert: true,
                    altertTitle: "Conexion exitosa",
                    alertMessage: "¡Login Exitoso!",
                    alertIcon:'success',
                    showConfirmButton:false,
                    timer:1500,
                    ruta:'profesional/inicio_profesional'
                });
            }
        })
    } else{
        res.render('profesional/login_profesional',{
            alert: true,
            altertTitle: "Advertencia",
            alertMessage: "¡Porfavor ingrese un nombre de usuario y una contraseña!",
            alertIcon:'warning',
            showConfirmButton:true,
            timer:false,
            ruta:'profesional/login_profesional'
        });
    }
})

app.post('/auth_empresa', async(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    let passwordHash = await bcryptjs.hash(password,8);
    if(email && password){
        connection.query('SELECT * FROM user_empresa WHERE email = ?', [email],async (error,results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(password,results[0].password))){
                res.render('empresa/login_empresa',{
                    alert: true,
                    altertTitle: "Error",
                    alertMessage: "Correo y/o contraseña incorrecta/s",
                    alertIcon:'error',
                    showConfirmButton:true,
                    timer:false,
                    ruta:'empresa/login_empresa'
                });
            } else{
                req.session.loggedin_e = true;
                req.session.nombre = results[0].nombre
                 
                res.render('empresa/login_empresa',{
                    nombre:req.session.nombre,
                    alert: true,
                    altertTitle: "Conexion exitosa",
                    alertMessage: "¡Login Exitoso!",
                    alertIcon:'success',
                    showConfirmButton:false,
                    timer:1500,
                    ruta:'empresa/inicio_empresa'
                });
            }
        })
    } else{
        res.render('empresa/login_empresa',{
            alert: true,
            altertTitle: "Advertencia",
            alertMessage: "¡Porfavor ingrese un nombre de usuario y una contraseña!",
            alertIcon:'warning',
            showConfirmButton:true,
            timer:false,
            ruta:'empresa/login_empresa'
        });
    }
})

// 12- auth pages empresa

app.get('/empresa/inicio_empresa',(req,res)=>{
    if(req.session.loggedin_e){
        res.render('empresa/inicio_empresa',{
            login:true,
            nombre: req.session.nombre 
        });
    } else {
        res.render('empresa/inicio_empresa', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})


app.get("/empresa/crear_oferta",(req,res) => {
    if(req.session.loggedin_e){
        connection.query('SELECT nombre FROM habilidad', (err,results)=>{
            if(err){
                console.error('Error al consultar la base de datos:', err);
                res.status(500).send('Error al obtener datos de la base de datos');
            }else{
                const data = results.map((row) => row.nombre);
                console.log("data es tipo : ",typeof data)
                console.log(data)
                res.render('empresa/crear_oferta', {
                        options: data,
                        login:true,
                        nombre: req.session.nombre 
                    });
            }
        })
    } else {
        res.render('empresa/crear_oferta', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})
app.get("/empresa/mis_ofertas",(req,res) => {
    if(req.session.loggedin_e){
        connection.query('SELECT * FROM user_empresa WHERE nombre = ?',[req.session.nombre],(err,rut_empresa)=>{
            console.log(rut_empresa[0].rut)
            connection.query('SELECT * FROM oferta_trabajo where empresa = ?',[rut_empresa[0].rut],(error,offers)=>{

                if(error){
                    console.log("el error de mierda es: ",error)
                }else{


                    // const id1 = offers.map((row)=>row.id);
                    // const cargo1 = offers.map((row)=>row.cargo);
                    // const create_time1 = offers.map((row)=>row.create_time);
                    // const modalidad1 = offers.map((row)=>row.modalidad);
                    // const lugar1 = offers.map((row)=>row.lugar);
                    // const carga_horaria1 = offers.map((row)=>row.carga_horaria);
                    // const numero_de_vacante1 = offers.map((row)=>row.numero_de_vacantes);
                    // const empresa1 = offers.map((row)=>row.empresa);
                    // const estado1 = offers.map((row)=>row.estado);
                    // const renta_min1 = offers.map((row)=>row.renta_min);
                    // const renta_max1 = offers.map((row)=>row.renta_max);
                    // const descripcion1 = offers.map((row)=>row.descripcion);
                    // const data = [
                    //     {id1},
                    //     {cargo1},
                    //     {create_time1},
                    //     {modalidad1},
                    //     {lugar1},
                    //     {numero_de_vacante1},
                    //     {empresa1},
                    //     {estado1},
                    //     {renta_min1},
                    //     {renta_max1},
                    //     {descripcion1}];
                    // console.log("id1 : ",id1 )
                    // console.log("id1 : ",typeof id1 )
                    // console.log("cargo1 : ",cargo1)
                    // console.log("cargo1 : ",typeof cargo1)
                    // console.log("create_time1 : ",create_time1)
                    // console.log("create_time1 : ",typeof create_time1)
                    // console.log("modalidad1 : ",modalidad1)
                    // console.log("lugar1 : ",lugar1)
                    // console.log("carga_horaria1 : ",carga_horaria1)
                    // console.log("numero_de_vacante1 : ",numero_de_vacante1)
                    // console.log("empresa1 : ",empresa1)
                    // console.log("renta_min1 : ",renta_min1)
                    // console.log("renta_max1 : ",renta_max1)
                    // console.log("descripcion1 : ",descripcion1)
                    // console.log("modalidad1 : ",typeof modalidad1)
                    // console.log("lugar1 : ",typeof lugar1)
                    // console.log("carga_horaria1 : ",typeof carga_horaria1)
                    // console.log("numero_de_vacante1 : ",typeof numero_de_vacante1)
                    // console.log("empresa1 : ",typeof empresa1)
                    // console.log("renta_min1 : ",typeof renta_min1)
                    // console.log("renta_max1 : ",typeof renta_max1)
                    // console.log("descripcion1 : ",typeof descripcion1)
                    res.render('empresa/mis_ofertas',
                    {offers:offers.rows
                        // datax:data,                        
                        // data2:cargo1,
                        // data3:create_time1,
                        // data4:modalidad1,
                        // data5:carga_horaria1,
                        // data6:lugar1,
                        // data7:carga_horaria1,
                        // data8:numero_de_vacante1,
                        // data9:empresa1,
                        // data10:estado1,
                        // data11:renta_min1,
                        // data12:renta_max1,
                        // data13:descripcion1,
                        // data14:req.session.nombre
                    })  
                }
                

            })

        })

        // connection.query('SELECT * FROM oferta_trabajo WHERE empresa = ?',[req.session.nombre],(err,resp)=>{
        //     rut = resp[0].rut
        //     console.log(req.session.rut)
        // })
        res.render('empresa/mis_ofertas',{
            login:true,
            nombre: req.session.nombre 
        });
    } else {
        res.render('empresa/mis_ofertas', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})
app.get("/empresa/perfil_e",(req,res) => {
    if(req.session.loggedin_e){
        res.render('empresa/perfil_e',{
            login:true,
            nombre: req.session.nombre 
        });
    } else {
        res.render('empresa/perfil_e', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})


// auth profesional
app.get('/profesional/inicio_profesional',(req,res)=>{
    if(req.session.loggedin_p){
        res.render('profesional/inicio_profesional',{
            login:true,
            username: req.session.username
        });
    } else {
        res.render('profesional/inicio_profesional', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})
app.get("/profesional/mis_cv",(req,res) => {
    if(req.session.loggedin_p){
        res.render('profesional/mis_cv',{
            login:true,
            username: req.session.username
        });
    } else {
        res.render('profesional/mis_cv', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})

app.get("/profesional/crear_cv",(req,res) => {
    if(req.session.loggedin_p){
        connection.query('SELECT nombre FROM habilidad', (err,results)=>{
            if(err){
                console.error('Error al consultar la base de datos:', err);
                res.status(500).send('Error al obtener datos de la base de datos');
            }else{
                const data = results.map((row) => row.nombre);
                
                res.render('profesional/crear_cv2', {
                    options: data,
                    login:true,
                    username: req.session.username 
                });
            }
        })
    } else {
        
        res.render('profesional/crear_cv2', {
            options: data,
            username: req.session.username,
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})

app.get("/profesional/crear_cv2",(req,res) => {
    if(req.session.loggedin_p){
        connection.query('SELECT MAX(id) AS max_id FROM curriculum',(err,res_max_id_cur)=>{
            if(err){
                console.error('Error al consultar la base de datos:', err);
                res.status(500).send('Error al obtener datos de la base de datos');
            }else{
                connection.query('SELECT habilidad_id FROM curriculum_has_habilidad WHERE curriculum_id = ?',[res_max_id_cur] ,(err,results)=>{
            if(err){
                console.error('Error al consultar la base de datos:', err);
                res.status(500).send('Error al obtener datos de la base de datos');
            }else{
                const data = results.map((row) => row.habilidad_id)
                console.log("11111")
                res.render('profesional/crear_cv2', {
                    options: req.session.data,
                    login:true,
                    username: req.session.username 
                });
            }
        })
            }

        })
        
    } else {
        console.log("2222")
        res.render('profesional/crear_cv2', {
            options: data,
            username: req.session.username,
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})

// app.get("/profesional/crear_cv",(req,res) => {
//     if(req.session.loggedin_p){
//         res.render('profesional/crear_cv',{
//             login:true,
//             username: req.session.username
//         });
//     } else {
//         res.render('profesional/crear_cv', {
//             login: false,
//             name:'Debe iniciar sesión'
//         })
//     }
// })
app.get("/profesional/buscar_ofertas",(req,res) => {
    if(req.session.loggedin_p){
        res.render('profesional/buscar_ofertas',{
            login:true,
            username: req.session.username
        });
    } else {
        res.render('profesional/buscar_ofertas', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})
app.get("/profesional/perfil_p",(req,res) => {
    if(req.session.loggedin_p){
        res.render('profesional/perfil_p',{
            login:true,
            username: req.session.username
        });
    } else {
        res.render('profesional/perfil_p', {
            login: false,
            name:'Debe iniciar sesión'
        })
    }
})

// 13 - logout
app.get('/logout', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000, (req, res)=>{
console.log( 'SERVER RUNNING IN http://localhost: 3000');
})

// app.get("borrador",(req,res)=>{
//     console.log("hola ")
//     connection.query('SELECT * FROM curriculum_has_habilidad WHERE curriculum_id = ?', [8], async(err,resp)=>{
//         if(err){
//             console.log("El error es ::: ",err)
//         }else{
//             const data = results.map((row) => row.habilidad_id);
//             console.log(data)
//             res.render("borrador",{
//                 options:data

//             });
//         }
//     })

// })

