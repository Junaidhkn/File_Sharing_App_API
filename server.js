const express = require( 'express' );
const path = require( 'path' );
const cors = require( 'cors' )
const bodyParser = require( "body-parser" )

const connectDb = require( './config/db' );

const app = express();
app.use( cors() )
app.use( express.json( { extended: true } ) );
// app.use( bodyParser.json() );

connectDb();

// Routes
app.use( '/api/files', require( './routes/uploadFiles' ) );
app.use( '/files', require( './routes/showFiles' ) );
app.use( '/files/download', require( './routes/download' ) );

app.listen( 5000 );
