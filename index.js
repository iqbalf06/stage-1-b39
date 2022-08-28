const express = require('express')
const db = require('./connection/db')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')

const app = express()
const port = 8000

app.set('view engine', 'hbs') // set view engine hbs
app.use('/assets', express.static(__dirname + '/assets')) // path folder assets
app.use(express.urlencoded({extended: false}))

app.use(flash())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000 // 2JAM
    }
}))


db.connect(function (err, client, done) {
    if (err) throw err // menampilkan error koneksi database

app.get('/', function(request, response){

    
    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        console.log(request.session);
        client.query('SELECT * FROM tb_projects ORDER BY id DESC', function(err, result){
            if (err) throw err // menampilkan error dari query
            // console.log(result.rows);
            let data = result.rows

            let dataProject = data.map(function(item){
                return {
                    ...item,
                    duration: getDistanceTime(item.start_date, item.end_date),
                    isLogin: request.session.isLogin,
                    
                }

            })
            
            response.render('index', {dataProject, user: request.session.user, isLogin: request.session.isLogin})
 
        }) 
      
    })
    
})

app.get('/contact', function(request, response){
    response.render('contact', {user: request.session.user, isLogin: request.session.isLogin})
})

app.get('/add-project', function(request, response){ 
    if(!request.session.user) {
        request.flash('danger', 'Anda belum login! Silahkan login terlebih dahulu')
        return response.render('login')
    }    
   response.render('add-project', {user: request.session.user, isLogin: request.session.isLogin})
})

app.post('/add-project', function(request, response) {
    
    let { inputTitle: title, inputContent: content, startdate: start_date, enddate: end_date } = request.body

    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        let query = `INSERT INTO tb_projects (title, start_date, end_date, content, image) VALUES ('${title}','${start_date}','${end_date}','${content}','image.jpg')`

        client.query(query, function(err, result){
            if (err) throw err // menampilkan error dari query
                
              response.redirect('/')
        }) 
      
    })
})


app.get('/myproject-detail/:id', function(request, response){

    let id = request.params.id

    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        let query = `SELECT = FROM tb_projects WHERE id=${id}`

        client.query('SELECT * FROM tb_projects', function(err, result){
            if (err) throw err // menampilkan error dari query

            let data = result.rows
            let dataProject = data.map(function (item){
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                    isLogin: request.session.isLogin,
                    
                }

            })
                
              response.render('myproject-detail', {data: dataProject[0], user: request.session.user, isLogin: request.session.isLogin})
        }) 
      
    })

})

app.get('/update-project/:idParams', function(request, response){
    if(!request.session.user){
        request.flash('danger', 'Silahkan login!')
        return response.redirect('/login')
    }
    
    let id = request.params.idParams

    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err // menampilkan error dari query

            let data = result.rows[0]
            
            
                
            response.render('update-project', { data,user: request.session.user, isLogin: request.session.isLogin })
        }) 
      
    })

   
})

app.post('/update-project/:idParams', function(request, response){
    let id = request.params.idParams

    let {inputTitle, inputContent } = request.body

    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        let query = `UPDATE tb_projects
        SET title='${inputTitle}', content='${inputContent}'
        WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err // menampilkan error dari query
        
                
            response.redirect('/')
        }) 
      
    })


})

app.get('/delete-project/:idParams', function(request, response){
    let id = request.params.idParams

    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        let query = `DELETE FROM tb_projects WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err // menampilkan error dari query
                
              response.redirect('/')
        }) 
      
    })

})

app.get('/register', function (request, response) {
    response.render('register')
})

app.post('/register', function (request, response) {
    
    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        let { inputName, inputEmail, inputPassword } = request.body
        
        const hashedPassword = bcrypt.hashSync(inputPassword, 10)

        let query = `INSERT INTO tb_user (name, email, password)
        VALUES ('${inputName}','${inputEmail}','${hashedPassword}')`

        client.query(query, function(err, result){
            if (err) throw err // menampilkan error dari query
                
            response.redirect('register')
        }) 
      
    })
    
    
})

app.get('/login', function (request, response) {
    response.render('login')
})

app.post('/login', function (request, response) {

    let { inputEmail, inputPassword } = request.body
   
    let query = `SELECT * FROM tb_user WHERE email='${inputEmail}'`

    client.query(query, function(err, result){
        if (err) throw err // menampilkan error dari query

        console.log((result.rows[0]));
        if(result.rows.length == 0) {
             console.log('Email belum terdaftar')
             request.flash('danger', 'Email belum terdaftar')
             return response.redirect('login')
             
        }

        const isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)
        console.log(isMatch)

        if(isMatch) {
            console.log('Login berhasil');

            request.session.isLogin = true
            request.session.user = {
                id:  result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email,
            }

            request.flash('success', 'Login berhasil')
            response.redirect('/')

        } else {
            console.log('Password salah');
            request.flash('danger', 'Password salah')
            response.redirect('login')
        }
            
       
    }) 

})

app.get('/logout', function (request, response) {
    request.session.destroy()
    response.redirect('/')
})

})

function getDistanceTime(startdate, enddate){

    let stDate = startdate
    let enDate = enddate
  
    let distance = enDate - stDate
    // console.log(distance);
  
    let milisecond = 1000 // 1 detik 1000 milisecond
    let secondInHours = 3600 // 1 jam sama dengan 3600 detik
    let hoursInDay = 24 // 1 hari 24 jam
    let dayInMonth = 30
    let monthInYear = 12
  
    let distanceYear = Math.floor(distance / (milisecond * secondInHours * hoursInDay * dayInMonth * monthInYear))
    let distanceMonth = Math.floor(distance / (milisecond * secondInHours * hoursInDay * dayInMonth))
    let distanceDay = Math.floor(distance / (milisecond * secondInHours * hoursInDay))
  
  
    if(distanceYear > 0){
  
      return `${distanceYear} year`
    } else if(distanceMonth > 0){
        return `${distanceMonth} month`
    } else {
        return `${distanceDay} day`
    }
     
  }

  function getFullTime(time) {

    let month = ["Januari", "Febuari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    if (hours < 10) {
        hours = "0" + hours
    } else if (minutes < 10) {
        minutes = "0" + minutes
    }

    // 12 Agustus 2022 09.04
    let fullTime = `${date} ${month[monthIndex]} ${year}`
    // console.log(fullTime);
    return fullTime
}


app.listen(port, function(){
    console.log(`server running on port ${port}`);
})