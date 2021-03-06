var express = require('express');
const nunjucks = require('nunjucks');
var	app = express();

const port = process.env.PORT || 8080;

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb+srv://maxpower:helloworld@cluster0.6di0t.mongodb.net/testmax1?retryWrites=true&w=majority';

var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

nunjucks.configure('views', {
    autoescape: true,
    express: app
  });
  
session = require('express-session');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'string-supersecreto32',
    name: 'sessionId',
    proxy: true,
    resave: true,
    saveUninitialized: true ,
    cookie: { maxAge:  60 * 60 * 1000 }  
}));


var auth = function(req, res, next) {
  if (req.session.login)
    return next();
  else
	return res.status(401).send("No has sido autorizado.");
};
 
//Index para el login
app.get("/", (req, res) => {
    res.render("index.html");
});


// Login endpoint
app.all('/login', function (req, res) {
  if (!req.body.user || !req.body.pass) {
    res.send('No se ha podido hacer el login');    
  } else {

    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
        const dbo = db.db("testmax1");  
        dbo.collection("login").findOne({$and:[{"user":req.body.user},{"pass":req.body.pass}]},function(err, data) {             
            //console.log(data); 
            if(data){
                req.session.login = true;  
                req.session.nombre = data.user;               
                res.status(200).send("<h1>Login con exito!</h1><a href='/content'>Ir al contenido</a>");  
            }
            else{
              res.status(401).send("No has sido autorizado, amigo.");
            } 
          })
        });
      }
    });

 
// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("Sesión cerrada!");
});
 
// Get content endpoint
app.get('/content', auth, function (req, res) {    
    res.render('agregarlibro.html');
});
  

// Recibimos la información del formulario de alta de platos e insertamos en la base de datos
app.post('/altalibro', (req, res)=>{
    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
    const dbo = db.db("testmax1")
    // key de la base datos : req.body.name_campo_formulario
    dbo.collection("libros").insertOne(
        {   
            ISBN:req.body.id,
            Titulo: req.body.titulo,            
            Autor:req.body.autor,
            Pais: req.body.pais,
            Year:req.body.year,
            Editorial:req.body.editorial

            
        },
        function (err, res) {
            if (err) {
            db.close();
            return console.log(err);
            }
            db.close()
        })
        res.send('<p>Libro agregado exitosamente</p><p><a href="/agregarlibro">Agregar Libro</a></p><p><a href="/logout">Cerrar Sesión</a></p>')
    })
}) 



app.listen(port);

