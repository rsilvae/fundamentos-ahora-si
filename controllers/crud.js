const controller = {};

controller.list = (req,res)=>{
    req.getConnection((err,conn)=>{
        if(err){
            console.log("El error es: ",err)
        }else{
            conn.query('SELECT * FROM CURRICULUM', (err,curriculums)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log(curriculums)
                    res.render('curriculums')
                }

            })
        }
    })
}

module.exports = controller;